import React, { useState, useEffect } from 'react'
import {
	Package,
	AlertTriangle,
	ShoppingCart,
	TrendingUp,
	ArrowRight,
	Layers,
} from 'lucide-react'
import type { Product } from '../../types/product'
import { formatRupiah } from '../../utils/formatCurrency'
import { productService } from '../../services/productService'
import type { ActivityLog } from '../../types/activityLog'

interface DashboardViewProps {
	onNavigateToInventory?: () => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
	onNavigateToInventory,
}) => {
	const [realProducts, setRealProducts] = useState<Product[]>([])
	const [logs, setLogs] = useState<ActivityLog[]>([])
	const [salesStats, setSalesStats] = useState({
		totalOrders: 0,
		totalRevenue: 0,
	}) // <-- State baru untuk data riil
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// Ambil 3 data cloud sekaligus secara paralel
		Promise.all([
			productService.getAll(),
			productService.getLogs(5),
			productService.getSalesAnalytics(), // <-- Panggil fungsi analitik riil dari database
		])
			.then(([productsData, logsData, salesData]) => {
				setRealProducts(productsData)
				setLogs(logsData)
				setSalesStats(salesData) // Masukkan data riil ke state
			})
			.catch((err) => console.error('Gagal memuat dashboard:', err.message))
			.finally(() => setIsLoading(false))
	}, [])

	const lowStockItems = realProducts.filter((p) => p.stock <= 5)

	// SEKARANG SEMUA KARTU DI BAWAH INI 100% DINAMIS DARI DATABASE CLOUD
	const quickStats = [
		{
			id: 1,
			title: 'Total Produk',
			value: isLoading ? '...' : `${realProducts.length} Item`,
			icon: Package,
			color: 'bg-blue-500/10 text-blue-600',
		},
		{
			id: 2,
			title: 'Stok Kritis',
			value: isLoading ? '...' : `${lowStockItems.length} Produk`,
			icon: AlertTriangle,
			color: 'bg-red-500/10 text-red-600',
		},
		{
			id: 3,
			title: 'Pesanan Masuk',
			value: isLoading ? '...' : `${salesStats.totalOrders} Transaksi`,
			icon: ShoppingCart,
			color: 'bg-amber-500/10 text-amber-600',
		},
		{
			id: 4,
			title: 'Total Pendapatan',
			value: isLoading ? '...' : formatRupiah(salesStats.totalRevenue),
			icon: TrendingUp,
			color: 'bg-emerald-500/10 text-emerald-600',
		},
	]

	const formatTime = (isoString: string) => {
		const date = new Date(isoString)
		return (
			date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
			' WIB'
		)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-slate-800">Ringkasan Toko</h1>
				<p className="text-sm text-slate-500">
					Pantauan inventaris ElectroHub hari ini berdasarkan live database.
				</p>
			</div>

			{/* KARTU STATISTIK UTAMA (SUDAH LIVE SEMUANYA) */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
				{quickStats.map((stat) => {
					const Icon = stat.icon
					return (
						<div
							key={stat.id}
							className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between animate-in fade-in duration-300">
							<div className="space-y-1">
								<p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
									{stat.title}
								</p>
								<p className="text-xl font-bold text-slate-800">{stat.value}</p>
							</div>
							<div className={`p-3 rounded-lg ${stat.color}`}>
								<Icon size={22} />
							</div>
						</div>
					)
				})}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* KOLOM PERINGATAN STOK */}
				<div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs lg:col-span-1 flex flex-col justify-between">
					<div>
						<div className="flex items-center space-x-2 text-red-600 mb-4">
							<AlertTriangle size={20} />
							<h2 className="font-bold text-slate-800">
								Peringatan Stok Kritis
							</h2>
						</div>
						<div className="space-y-3">
							{isLoading ? (
								<p className="text-xs text-slate-400 text-center py-6 animate-pulse">
									Memuat data...
								</p>
							) : lowStockItems.length > 0 ? (
								lowStockItems.map((item) => (
									<div
										key={item.id}
										className="p-3 bg-red-50/60 border border-red-100 rounded-lg flex justify-between items-center">
										<div className="min-w-0 pr-2">
											<h4 className="text-sm font-semibold text-slate-800 truncate">
												{item.name}
											</h4>
											<p className="text-xs text-slate-400 font-mono mt-0.5">
												{item.sku}
											</p>
										</div>
										<span className="px-2.5 py-1 bg-red-600 text-white font-bold text-xs rounded-md">
											{item.stock} Unit
										</span>
									</div>
								))
							) : (
								<p className="text-xs text-slate-400 text-center py-6">
									Semua stok produk aman.
								</p>
							)}
						</div>
					</div>
					<button
						onClick={onNavigateToInventory}
						className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-colors">
						<span>Restock di Inventaris</span>
						<ArrowRight size={14} />
					</button>
				</div>

				{/* LOG AKTIVITAS LIVE */}
				<div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs lg:col-span-2 space-y-6">
					<div>
						<div className="flex items-center space-x-2 text-slate-700 mb-4">
							<Layers size={18} />
							<h2 className="font-bold text-slate-800">
								Log Aktivitas Live Admin
							</h2>
						</div>
						<div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-4 max-h-60 overflow-y-auto">
							{isLoading ? (
								<p className="text-xs text-slate-400">
									Memuat log aktivitas...
								</p>
							) : logs.length > 0 ? (
								logs.map((log) => (
									<div key={log.id} className="relative">
										<div
											className={`absolute -left-5.25 mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
												log.action === 'CREATE'
													? 'bg-emerald-500'
													: log.action === 'UPDATE'
														? 'bg-blue-500'
														: log.action === 'DELETE'
															? 'bg-red-500'
															: 'bg-amber-500'
											}`}
										/>
										<p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
											{formatTime(log.created_at)}
										</p>
										<p className="text-sm text-slate-600 font-medium mt-0.5">
											{log.description}
										</p>
									</div>
								))
							) : (
								<p className="text-xs text-slate-400 py-4">
									Belum ada aktivitas terekam.
								</p>
							)}
						</div>
					</div>

					{/* VISUALISASI GRAFIK PENJUALAN SEDERHANA */}
					<div className="pt-4 border-t border-slate-100">
						<h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
							Grafik Performa Toko
						</h3>
						<div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
							<div className="flex items-end space-x-2 h-16 pt-2">
								{/* Batang grafik simulasi proporsional terhadap total transaksi nyata */}
								<div className="w-full bg-slate-200 h-1/3 rounded-xs" />
								<div className="w-full bg-slate-200 h-1/2 rounded-xs" />
								<div className="w-full bg-slate-200 h-2/3 rounded-xs" />
								<div
									className="w-full bg-blue-500 rounded-xs transition-all duration-500"
									style={{
										height: `${Math.min(salesStats.totalOrders * 10 + 10, 100)}%`,
									}}
								/>
							</div>
							<div className="flex justify-between text-[9px] text-slate-400 font-semibold mt-2">
								<span>Minggu 1</span>
								<span>Minggu 2</span>
								<span>Minggu 3</span>
								<span className="text-blue-600 font-bold">Hari Ini (Live)</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

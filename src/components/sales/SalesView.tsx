import React, { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle } from 'lucide-react'
import type { Product } from '../../types/product'
import { formatRupiah } from '../../utils/formatCurrency'
import { productService } from '../../services/productService'

interface CartItem {
	product: Product
	quantity: number
}

export const SalesView: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([])
	const [cart, setCart] = useState<CartItem[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isProcessing, setIsProcessing] = useState(false)
	const [checkoutSuccess, setCheckoutSuccess] = useState(false)

	const loadKatalog = () => {
		setIsLoading(true)
		productService
			.getAll()
			.then(setProducts)
			.catch((err) => alert('Gagal muat kasir: ' + err.message))
			.finally(() => setIsLoading(false))
	}

	useEffect(() => {
		loadKatalog()
	}, [])

	const addToCart = (product: Product) => {
		if (product.stock <= 0) return alert('Stok produk habis!')

		setCart((prev) => {
			const eksis = prev.find((item) => item.product.id === product.id)
			if (eksis) {
				if (eksis.quantity >= product.stock)
					return (alert('Melebihi batas stok!'), prev)
				return prev.map((item) =>
					item.product.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item,
				)
			}
			return [...prev, { product, quantity: 1 }]
		})
	}

	const updateQty = (productId: string, delta: number) => {
		setCart((prev) =>
			prev
				.map((item) => {
					if (item.product.id !== productId) return item
					const nextQty = item.quantity + delta
					if (nextQty > item.product.stock) {
						alert('Stok tidak mencukupi!')
						return item
					}
					return { ...item, quantity: nextQty }
				})
				.filter((item) => item.quantity > 0),
		)
	}

	const handleCheckout = async () => {
		if (cart.length === 0) return
		try {
			setIsProcessing(true)

			// 1. Susun payload data barang yang dibeli (sertakan harga produk)
			const bulkPayload = cart.map((item) => ({
				id: item.product.id,
				name: item.product.name,
				currentStock: item.product.stock,
				quantity: item.quantity,
				price: item.product.price, // <-- Sertakan harga
			}))

			// 2. Kirim data barang beserta TOTAL pembayaran keranjang saat ini
			await productService.updateStockBulk(bulkPayload, totalPayment)

			setCheckoutSuccess(true)
			setCart([])
			loadKatalog()
			setTimeout(() => setCheckoutSuccess(false), 3000)
		} catch (err: any) {
			alert('Transaksi gagal: ' + err.message)
		} finally {
			setIsProcessing(false)
		}
	}

	const totalPayment = cart.reduce(
		(sum, item) => sum + item.product.price * item.quantity,
		0,
	)

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-slate-800">
					Sistem Kasir (POS)
				</h1>
				<p className="text-sm text-slate-500">
					Pencatatan nota penjualan instan toko ElectroHub.
				</p>
			</div>

			{checkoutSuccess && (
				<div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 animate-in fade-in duration-200">
					<CheckCircle className="text-emerald-500" size={18} />
					<span className="text-sm font-semibold">
						Transaksi Berhasil! Stok cloud berkurang otomatis.
					</span>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-4">
					<h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
						Katalog Produk
					</h3>
					{isLoading ? (
						<div className="text-center py-12 text-slate-400">
							Memuat data produk...
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{products.map((product) => (
								<div
									key={product.id}
									onClick={() => addToCart(product)}
									className={`bg-white p-4 rounded-xl border border-slate-200 flex space-x-3 cursor-pointer hover:border-blue-500 transition-all ${product.stock === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
									<img
										src={product.image}
										alt={product.name}
										className="w-14 h-14 object-cover rounded-lg border shrink-0"
									/>
									<div className="flex-1 min-w-0 flex flex-col justify-between">
										<div>
											<h4 className="font-bold text-slate-800 text-sm truncate">
												{product.name}
											</h4>
											<p className="text-xs text-slate-400 font-mono">
												{product.sku}
											</p>
										</div>
										<div className="flex items-center justify-between mt-1">
											<span className="font-semibold text-sm text-slate-700">
												{formatRupiah(product.price)}
											</span>
											<span className="text-xs font-medium text-slate-400">
												Stok: {product.stock}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between h-[calc(100vh-220px)] sticky top-6">
					<div className="flex flex-col overflow-hidden">
						<div className="flex items-center space-x-2 text-slate-700 border-b border-slate-100 pb-3 mb-4">
							<ShoppingCart size={18} />
							<h2 className="font-bold text-slate-800">Keranjang Nota</h2>
							<span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
								{cart.length}
							</span>
						</div>
						<div className="space-y-4 overflow-y-auto flex-1 pr-1">
							{cart.length === 0 ? (
								<div className="text-center py-16 text-slate-400 text-xs">
									Keranjang kosong.
								</div>
							) : (
								cart.map((item) => (
									<div
										key={item.product.id}
										className="flex items-center justify-between gap-2 pb-2 border-b border-slate-50">
										<div className="min-w-0 flex-1">
											<h4 className="text-xs font-bold text-slate-800 truncate">
												{item.product.name}
											</h4>
											<p className="text-xs text-slate-400">
												{formatRupiah(item.product.price)}
											</p>
										</div>
										<div className="flex items-center space-x-1.5 shrink-0">
											<button
												onClick={() => updateQty(item.product.id, -1)}
												className="p-1 bg-slate-100 rounded-md">
												<Minus size={10} />
											</button>
											<span className="text-xs font-bold text-slate-800 w-4 text-center">
												{item.quantity}
											</span>
											<button
												onClick={() => updateQty(item.product.id, 1)}
												className="p-1 bg-slate-100 rounded-md">
												<Plus size={10} />
											</button>
											<button
												onClick={() =>
													setCart(
														cart.filter(
															(i) => i.product.id !== item.product.id,
														),
													)
												}
												className="p-1 text-slate-300 hover:text-red-500 ml-1">
												<Trash2 size={12} />
											</button>
										</div>
									</div>
								))
							)}
						</div>
					</div>
					<div className="border-t border-slate-100 pt-4 space-y-4 bg-white">
						<div className="flex items-center justify-between">
							<span className="text-xs font-semibold text-slate-400">
								Total Pembayaran:
							</span>
							<span className="text-base font-bold text-slate-800">
								{formatRupiah(totalPayment)}
							</span>
						</div>
						<button
							onClick={handleCheckout}
							disabled={cart.length === 0 || isProcessing}
							className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center">
							{isProcessing ? (
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
							) : (
								<span>Proses Nota & Potong Stok</span>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

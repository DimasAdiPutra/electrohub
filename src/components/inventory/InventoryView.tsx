import React, { useState, useEffect } from 'react'
import {
	Search,
	Plus,
	Edit2,
	Trash2,
	SlidersHorizontal,
	ArrowUp,
	ArrowDown,
	ArrowUpDown,
} from 'lucide-react'
import type { Product } from '../../types/product'
import { formatRupiah } from '../../utils/formatCurrency'
import { supabase } from '../../config/supabaseClient'
import { ProductFormModal } from './ProductFormModal'

export const InventoryView: React.FC = () => {
	// State Utama Data & Filter
	const [products, setProducts] = useState<Product[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('Semua')
	const [isLoading, setIsLoading] = useState(true)

	// Fungsi untuk mengambil data dari tabel 'products' di Supabase
	const fetchProducts = async () => {
		try {
			setIsLoading(true)

			// Tembak tabel 'products', ambil semua kolom (*), urutkan berdasarkan ID terbaru
			const { data, error } = await supabase
				.from('products')
				.select('*')
				.order('id', { ascending: false })

			if (error) {
				throw error
			}

			if (data) {
				// Masukkan data dari Supabase ke dalam state products React
				setProducts(data as Product[])
			}
		} catch (error: any) {
			alert('Gagal mengambil data dari Supabase: ' + error.message)
		} finally {
			setIsLoading(false)
		}
	}

	// Jalankan fungsi fetchProducts secara otomatis saat halaman Inventory pertama kali dibuka
	useEffect(() => {
		fetchProducts()
	}, [])

	// State Pengurutan (Sorting)
	const [sortField, setSortField] = useState<
		'name' | 'category' | 'price' | 'stock' | null
	>(null)
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

	// State Pengontrol Modal Form
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
	const [editingProductId, setEditingProductId] = useState<string | null>(null)
	const [formData, setFormData] = useState({
		name: '',
		sku: '',
		category: 'Aksesoris',
		price: 0,
		stock: 0,
		image: '',
	})

	// Handler Pengurutan Kolom Tabel
	const handleSort = (field: 'name' | 'category' | 'price' | 'stock') => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
		} else {
			setSortField(field)
			setSortDirection('asc')
		}
	}

	// Handler Buka Modal Tambah
	const openAddModal = () => {
		setModalMode('add')
		setEditingProductId(null)
		setFormData({
			name: '',
			sku: '',
			category: 'Aksesoris',
			price: 0,
			stock: 0,
			image: '',
		})
		setIsModalOpen(true)
	}

	// Handler Buka Modal Edit
	const openEditModal = (product: Product) => {
		setModalMode('edit')
		setEditingProductId(product.id)
		setFormData({
			name: product.name,
			sku: product.sku,
			category: product.category,
			price: product.price,
			stock: product.stock,
			image: product.image,
		})
		setIsModalOpen(true)
	}

	// ==========================================
	// ✅ LOGIKA BARU: DELETE (HAPUS DATA DI SUPABASE)
	// ==========================================
	const handleDeleteProduct = async (id: string) => {
		if (
			window.confirm(
				'Apakah Anda yakin ingin menghapus produk ini dari inventaris toko?',
			)
		) {
			try {
				setIsLoading(true)

				const { error } = await supabase.from('products').delete().eq('id', id) // Hapus baris data yang ID-nya cocok

				if (error) throw error

				alert('Produk berhasil dihapus dari database Supabase!')
				fetchProducts() // Refresh tabel agar baris yang dihapus langsung hilang
			} catch (error: any) {
				alert('Gagal menghapus produk: ' + error.message)
			} finally {
				setIsLoading(false)
			}
		}
	}

	// Handler Submit Form (Simpan/Pembaruan) ke Supabase
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!formData.name || !formData.sku) return

		const productImage =
			formData.image ||
			'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=150&auto=format&fit=crop&q=60'

		try {
			setIsLoading(true)

			if (modalMode === 'add') {
				// Logika CREATE (Sudah berhasil kamu buat sebelumnya)
				const { error } = await supabase.from('products').insert([
					{
						name: formData.name,
						sku: formData.sku,
						category: formData.category,
						price: Number(formData.price),
						stock: Number(formData.stock),
						image: productImage,
					},
				])

				if (error) throw error
				alert('Produk baru berhasil disimpan ke database Supabase!')
			} else {
				// ==========================================
				// ✅ LOGIKA BARU: UPDATE (EDIT DATA DI SUPABASE)
				// ==========================================
				const { error } = await supabase
					.from('products')
					.update({
						name: formData.name,
						sku: formData.sku,
						category: formData.category,
						price: Number(formData.price),
						stock: Number(formData.stock),
						image: productImage,
					})
					.eq('id', editingProductId) // Kunci data berdasarkan ID produk yang diedit

				if (error) throw error
				alert('Perubahan data produk berhasil disimpan ke Supabase!')
			}

			setIsModalOpen(false)
			fetchProducts() // Tarik data terbaru untuk me-refresh tabel
		} catch (error: any) {
			alert('Gagal memproses data di Supabase: ' + error.message)
		} finally {
			setIsLoading(false)
		}
	}

	// Memproses Filter & Sort Data secara Berantai (Chaining)
	const filteredProducts = products
		.filter((product) => {
			const matchesSearch =
				product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.sku.toLowerCase().includes(searchTerm.toLowerCase())
			const matchesCategory =
				selectedCategory === 'Semua' || product.category === selectedCategory
			return matchesSearch && matchesCategory
		})
		.sort((a, b) => {
			if (!sortField) return 0
			let fieldA = a[sortField]
			let fieldB = b[sortField]

			if (typeof fieldA === 'string' && typeof fieldB === 'string') {
				fieldA = fieldA.toLowerCase()
				fieldB = fieldB.toLowerCase()
			}

			if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1
			if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1
			return 0
		})

	// Render Indikator Panah Pengurutan
	const renderSortIcon = (field: 'name' | 'category' | 'price' | 'stock') => {
		if (sortField !== field)
			return <ArrowUpDown size={14} className="text-slate-300" />
		return sortDirection === 'asc' ? (
			<ArrowUp size={14} className="text-blue-600" />
		) : (
			<ArrowDown size={14} className="text-blue-600" />
		)
	}

	return (
		<div className="space-y-6">
			{/* HEADER */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-slate-800">
						Manajemen Inventaris
					</h1>
					<p className="text-sm text-slate-500">
						Kelola stok barang, pantau kode SKU, dan lakukan pembaruan data
						toko.
					</p>
				</div>
				<button
					onClick={openAddModal}
					className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto">
					<Plus size={18} />
					<span>Tambah Produk</span>
				</button>
			</div>

			{/* FILTER BAR */}
			<div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
				<div className="relative w-full md:w-96">
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
						size={18}
					/>
					<input
						type="text"
						placeholder="Cari nama produk atau SKU..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
					/>
				</div>
				<div className="flex items-center space-x-2 w-full md:w-auto justify-end">
					<SlidersHorizontal
						size={16}
						className="text-slate-400 hidden sm:block"
					/>
					<select
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
						className="w-full md:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
						<option value="Semua">Semua Kategori</option>
						<option value="Aksesoris">Aksesoris</option>
						<option value="Monitor">Monitor</option>
						<option value="Charger">Charger</option>
					</select>
				</div>
			</div>

			{/* DATA TABLE */}
			<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider select-none">
								<th className="p-4 w-20">Gambar</th>
								<th
									onClick={() => handleSort('name')}
									className="p-4 cursor-pointer hover:bg-slate-100/80 transition-colors group">
									<div className="flex items-center space-x-1">
										<span
											className={
												sortField === 'name'
													? 'text-blue-600'
													: 'text-slate-500'
											}>
											Info Produk
										</span>
										{renderSortIcon('name')}
									</div>
								</th>
								<th
									onClick={() => handleSort('category')}
									className="p-4 cursor-pointer hover:bg-slate-100/80 transition-colors group">
									<div className="flex items-center space-x-1">
										<span
											className={
												sortField === 'category'
													? 'text-blue-600'
													: 'text-slate-500'
											}>
											Kategori
										</span>
										{renderSortIcon('category')}
									</div>
								</th>
								<th
									onClick={() => handleSort('price')}
									className="p-4 cursor-pointer hover:bg-slate-100/80 transition-colors group">
									<div className="flex items-center space-x-1">
										<span
											className={
												sortField === 'price'
													? 'text-blue-600'
													: 'text-slate-500'
											}>
											Harga
										</span>
										{renderSortIcon('price')}
									</div>
								</th>
								<th
									onClick={() => handleSort('stock')}
									className="p-4 cursor-pointer hover:bg-slate-100/80 transition-colors group">
									<div className="flex items-center space-x-1">
										<span
											className={
												sortField === 'stock'
													? 'text-blue-600'
													: 'text-slate-500'
											}>
											Stok
										</span>
										{renderSortIcon('stock')}
									</div>
								</th>
								<th className="p-4 text-center w-28">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-sm text-slate-600">
							{isLoading ? (
								/* Tampilan saat loading */
								<tr>
									<td
										colSpan={6}
										className="text-center py-12 text-slate-400 font-medium">
										<div className="flex items-center justify-center space-x-2">
											<div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
											<span>Menghubungkan ke database Supabase...</span>
										</div>
									</td>
								</tr>
							) : filteredProducts.length > 0 ? (
								/* Tampilan saat data berhasil dimuat */
								filteredProducts.map((product) => (
									<tr
										key={product.id}
										className="hover:bg-slate-50/50 transition-colors">
										<td className="p-4">
											<img
												src={product.image}
												alt={product.name}
												className="w-12 h-12 object-cover rounded-lg border border-slate-100 bg-slate-50"
											/>
										</td>
										<td className="p-4">
											<div className="font-semibold text-slate-800 line-clamp-1">
												{product.name}
											</div>
											<div className="text-xs text-slate-400 mt-0.5 tracking-wide font-mono">
												{product.sku}
											</div>
										</td>
										<td className="p-4">
											<span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
												{product.category}
											</span>
										</td>
										<td className="p-4 font-medium text-slate-700">
											{formatRupiah(product.price)}
										</td>
										<td className="p-4">
											<div className="flex items-center space-x-2">
												<span
													className={`w-2 h-2 rounded-full ${product.stock <= 5 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}
												/>
												<span
													className={`font-bold ${product.stock <= 5 ? 'text-red-600' : 'text-slate-700'}`}>
													{product.stock} Unit
												</span>
											</div>
										</td>
										<td className="p-4">
											<div className="flex items-center justify-center space-x-1">
												<button
													onClick={() => openEditModal(product)}
													className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
													<Edit2 size={16} />
												</button>
												<button
													onClick={() => handleDeleteProduct(product.id)}
													className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
													<Trash2 size={16} />
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								/* Tampilan jika data di database kosong */
								<tr>
									<td
										colSpan={6}
										className="text-center py-12 text-slate-400 font-medium">
										Tidak ada produk ditemukan di database Supabase.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* REFACTORED MODAL COMPONENT */}
			<ProductFormModal
				isOpen={isModalOpen}
				mode={modalMode}
				formData={formData}
				onClose={() => setIsModalOpen(false)}
				onChange={setFormData}
				onSubmit={handleSubmit}
			/>
		</div>
	)
}

export default InventoryView

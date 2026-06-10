import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import type { Product } from '../../types/product'
import { formatRupiah } from '../../utils/formatCurrency'
import { productService } from '../../services/productService'
import { ProductFormModal } from './ProductFormModal'

export const InventoryView: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('Semua')
	const [isLoading, setIsLoading] = useState(true)

	const [sortField, setSortField] = useState<
		'name' | 'category' | 'price' | 'stock' | null
	>(null)
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

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

	const loadProducts = async () => {
		try {
			setIsLoading(true)
			const data = await productService.getAll()
			setProducts(data)
		} catch (err: any) {
			alert('Error ambil data: ' + err.message)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		loadProducts()
	}, [])

	const handleSort = (field: 'name' | 'category' | 'price' | 'stock') => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
		} else {
			setSortField(field)
			setSortDirection('asc')
		}
	}

	const openAddModal = () => {
		setModalMode('add')
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

	const handleDeleteProduct = async (id: string) => {
		if (
			!window.confirm('Yakin ingin menghapus produk ini dari database cloud?')
		)
			return
		try {
			setIsLoading(true)
			await productService.delete(id)
			alert('Produk terhapus!')
			loadProducts()
		} catch (err: any) {
			alert('Gagal menghapus: ' + err.message)
		} finally {
			setIsLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!formData.name || !formData.sku) return
		const productImage =
			formData.image ||
			'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=150&auto=format&fit=crop&q=60'

		try {
			setIsLoading(true)
			const payload = {
				...formData,
				price: Number(formData.price),
				stock: Number(formData.stock),
				image: productImage,
			}

			if (modalMode === 'add') {
				await productService.create(payload)
				alert('Produk ditambahkan!')
			} else if (editingProductId) {
				await productService.update(editingProductId, payload)
				alert('Produk diperbarui!')
			}
			setIsModalOpen(false)
			loadProducts()
		} catch (err: any) {
			alert('Gagal memproses data: ' + err.message)
		} finally {
			setIsLoading(false)
		}
	}

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
			let valA = a[sortField]
			let valB = b[sortField]
			if (typeof valA === 'string' && typeof valB === 'string') {
				valA = valA.toLowerCase()
				valB = valB.toLowerCase()
			}
			if (valA < valB) return sortDirection === 'asc' ? -1 : 1
			if (valA > valB) return sortDirection === 'asc' ? 1 : -1
			return 0
		})

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-slate-800">
						Manajemen Inventaris
					</h1>
					<p className="text-sm text-slate-500">
						Kelola stok barang dan kode SKU toko secara realtime.
					</p>
				</div>
				<button
					onClick={openAddModal}
					className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors">
					<Plus size={18} />
					<span>Tambah Produk</span>
				</button>
			</div>

			<div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
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
						className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
					/>
				</div>
				<select
					value={selectedCategory}
					onChange={(e) => setSelectedCategory(e.target.value)}
					className="w-full md:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none">
					<option value="Semua">Semua Kategori</option>
					<option value="Aksesoris">Aksesoris</option>
					<option value="Monitor">Monitor</option>
					<option value="Charger">Charger</option>
				</select>
			</div>

			<div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider select-none">
								<th className="p-4 w-20">Gambar</th>
								{(
									[
										['name', 'Info Produk'],
										['category', 'Kategori'],
										['price', 'Harga'],
										['stock', 'Stok'],
									] as const
								).map(([field, label]) => (
									<th
										key={field}
										onClick={() => handleSort(field)}
										className="p-4 cursor-pointer hover:bg-slate-100/80 text-slate-500 font-semibold transition-colors">
										<div className="flex items-center space-x-1">
											<span>{label}</span>
											{sortField === field &&
												(sortDirection === 'asc' ? (
													<ArrowUp size={14} />
												) : (
													<ArrowDown size={14} />
												))}
										</div>
									</th>
								))}
								<th className="p-4 text-center w-28">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-sm text-slate-600">
							{isLoading ? (
								<tr>
									<td colSpan={6} className="text-center py-12 text-slate-400">
										Memproses sambungan Supabase...
									</td>
								</tr>
							) : filteredProducts.length > 0 ? (
								filteredProducts.map((product) => (
									<tr
										key={product.id}
										className="hover:bg-slate-50/50 transition-colors">
										<td className="p-4">
											<img
												src={product.image}
												alt={product.name}
												className="w-12 h-12 object-cover rounded-lg border"
											/>
										</td>
										<td className="p-4">
											<div className="font-semibold text-slate-800 line-clamp-1">
												{product.name}
											</div>
											<div className="text-xs text-slate-400 mt-0.5 font-mono">
												{product.sku}
											</div>
										</td>
										<td className="p-4">{product.category}</td>
										<td className="p-4 font-medium">
											{formatRupiah(product.price)}
										</td>
										<td className="p-4">
											<span
												className={`font-bold ${product.stock <= 5 ? 'text-red-600' : 'text-slate-700'}`}>
												{product.stock} Unit
											</span>
										</td>
										<td className="p-4 text-center">
											<div className="flex items-center justify-center space-x-1">
												<button
													onClick={() => openEditModal(product)}
													className="p-2 text-slate-400 hover:text-blue-600">
													<Edit2 size={16} />
												</button>
												<button
													onClick={() => handleDeleteProduct(product.id)}
													className="p-2 text-slate-400 hover:text-red-600">
													<Trash2 size={16} />
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={6} className="text-center py-12 text-slate-400">
										Tidak ada produk ditemukan.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

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

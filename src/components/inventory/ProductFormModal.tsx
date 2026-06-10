import React from 'react'
import { X } from 'lucide-react'
import type { Product } from '../../types/product'

interface ProductFormModalProps {
	isOpen: boolean
	mode: 'add' | 'edit'
	formData: Omit<Product, 'id'>
	onClose: () => void
	onChange: (data: any) => void
	onSubmit: (e: React.FormEvent) => void
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
	isOpen,
	mode,
	formData,
	onClose,
	onChange,
	onSubmit,
}) => {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				onClick={onClose}
				className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
			/>

			{/* Kotak Konten Modal */}
			<div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
					<h3 className="font-bold text-slate-800 text-base">
						{mode === 'add'
							? 'Tambah Produk Inventaris Baru'
							: 'Perbarui Data Produk'}
					</h3>
					<button
						onClick={onClose}
						className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors">
						<X size={18} />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={onSubmit} className="p-5 space-y-4">
					<div>
						<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
							Nama Produk *
						</label>
						<input
							type="text"
							required
							placeholder="Contoh: ASUS VivoBook Ultra 14"
							value={formData.name}
							onChange={(e) => onChange({ ...formData, name: e.target.value })}
							className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
								Kode SKU *
							</label>
							<input
								type="text"
								required
								placeholder="Contoh: EL-ASU-014"
								value={formData.sku}
								onChange={(e) => onChange({ ...formData, sku: e.target.value })}
								className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
							/>
						</div>
						<div>
							<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
								Kategori
							</label>
							<select
								value={formData.category}
								onChange={(e) =>
									onChange({ ...formData, category: e.target.value })
								}
								className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
								<option value="Aksesoris">Aksesoris</option>
								<option value="Monitor">Monitor</option>
								<option value="Charger">Charger</option>
							</select>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
								Harga Barang (Rp) *
							</label>
							<input
								type="number"
								required
								min="0"
								placeholder="0"
								value={formData.price || ''}
								onChange={(e) =>
									onChange({ ...formData, price: Number(e.target.value) })
								}
								className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
							/>
						</div>
						<div>
							<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
								Jumlah Stok *
							</label>
							<input
								type="number"
								required
								min="0"
								placeholder="0"
								value={formData.stock || ''}
								onChange={(e) =>
									onChange({ ...formData, stock: Number(e.target.value) })
								}
								className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
							/>
						</div>
					</div>

					<div>
						<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
							URL Tautan Gambar (Opsional)
						</label>
						<input
							type="url"
							placeholder="https://example.com/gambar.jpg"
							value={formData.image}
							onChange={(e) => onChange({ ...formData, image: e.target.value })}
							className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
						/>
					</div>

					{/* Tombol Kaki Modal */}
					<div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 mt-6">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
							Batal
						</button>
						<button
							type="submit"
							className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
							{mode === 'add' ? 'Tambahkan Barang' : 'Simpan Perubahan'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

import React, { useState, useEffect } from 'react'
import { X, Upload } from 'lucide-react'
import { productService } from '../../services/productService'

interface ProductFormModalProps {
	isOpen: boolean
	mode: 'add' | 'edit'
	formData: {
		name: string
		sku: string
		category: string
		price: number
		stock: number
		image: string
	}
	onClose: () => void
	onChange: (data: any) => void
	onSubmit: (e: React.SubmitEvent<HTMLFormElement>, customPayload?: any) => void
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
	isOpen,
	mode,
	formData,
	onClose,
	onChange,
	onSubmit,
}) => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string>('')
	const [isUploading, setIsUploading] = useState(false)

	// Efek untuk memantau perubahan status buka/tutup modal
	useEffect(() => {
		if (!isOpen) {
			// Bersihkan state ketika modal ditutup
			setSelectedFile(null)
			setPreviewUrl('')
		} else if (mode === 'edit' && formData.image) {
			// Jika mode edit, set preview dengan URL gambar yang sudah ada di database
			setPreviewUrl(formData.image)
		}
	}, [isOpen, mode, formData.image])

	if (!isOpen) return null

	// Handler saat admin memilih file gambar dari komputer
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0]

			// Validasi Ukuran File (Maksimal 2 MB agar kuota gratis Supabase hemat)
			if (file.size > 2 * 1024 * 1024) {
				alert('Ukuran file terlalu besar! Maksimal batas ukuran adalah 2 MB.')
				return
			}

			setSelectedFile(file)
			setPreviewUrl(URL.createObjectURL(file)) // Membuat blob URL lokal untuk preview instan
		}
	}

	// Handler internal saat tombol simpan diklik
	const handleFormSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()

		let finalImageUrl = formData.image

		// Jika admin memilih berkas gambar baru, jalankan proses upload ke Supabase Storage terlebih dahulu
		if (selectedFile) {
			try {
				setIsUploading(true)
				finalImageUrl = await productService.uploadImage(selectedFile)
			} catch (err: any) {
				alert('Gagal mengunggah gambar ke server Supabase: ' + err.message)
				setIsUploading(false)
				return
			} finally {
				setIsUploading(false)
			}
		}

		// Teruskan payload data bersih yang sudah berisi URL gambar final ke InventoryView
		onSubmit(e, {
			...formData,
			price: Number(formData.price),
			stock: Number(formData.stock),
			image: finalImageUrl,
		})
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
			<div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
				{/* HEADER MODAL */}
				<div className="flex items-center justify-between p-4 border-b border-slate-100">
					<h2 className="font-bold text-slate-800 text-base">
						{mode === 'add' ? 'Tambah Produk Baru' : 'Edit Informasi Produk'}
					</h2>
					<button
						onClick={onClose}
						className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
						<X size={18} />
					</button>
				</div>

				{/* FORM BODY */}
				<form
					onSubmit={handleFormSubmit}
					className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
					{/* INPUT NAMA */}
					<div className="space-y-1">
						<label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
							Nama Produk
						</label>
						<input
							type="text"
							required
							placeholder="Contoh: ASUS ROG Swift PG279Q"
							value={formData.name}
							onChange={(e) => onChange({ ...formData, name: e.target.value })}
							className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
						/>
					</div>

					{/* INPUT SKU */}
					<div className="space-y-1">
						<label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
							Kode SKU
						</label>
						<input
							type="text"
							required
							placeholder="Contoh: EL-ASUS-001"
							value={formData.sku}
							onChange={(e) => onChange({ ...formData, sku: e.target.value })}
							className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						{/* INPUT HARGA */}
						<div className="space-y-1">
							<label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Harga (Rupiah)
							</label>
							<input
								type="number"
								required
								min={0}
								placeholder="0"
								value={formData.price || ''}
								onChange={(e) =>
									onChange({ ...formData, price: Number(e.target.value) })
								}
								className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
							/>
						</div>

						{/* INPUT STOK */}
						<div className="space-y-1">
							<label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Jumlah Stok
							</label>
							<input
								type="number"
								required
								min={0}
								placeholder="0"
								value={formData.stock || ''}
								onChange={(e) =>
									onChange({ ...formData, stock: Number(e.target.value) })
								}
								className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
							/>
						</div>
					</div>

					{/* PILIHAN KATEGORI */}
					<div className="space-y-1">
						<label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
							Kategori
						</label>
						<select
							value={formData.category}
							onChange={(e) =>
								onChange({ ...formData, category: e.target.value })
							}
							className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
							<option value="Aksesoris">Aksesoris</option>
							<option value="Monitor">Monitor</option>
							<option value="Charger">Charger</option>
						</select>
					</div>

					{/* UPLOAD FOTO PRODUK (INTEGRASI SUPABASE STORAGE) */}
					<div className="space-y-1.5">
						<label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
							Foto Fisik Barang
						</label>
						<div className="flex items-center space-x-4 p-3 bg-slate-50 border border-slate-200 border-dashed rounded-lg">
							{/* Tempat Preview Gambar */}
							<div className="w-16 h-16 bg-slate-200 rounded-lg overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center text-slate-400">
								{previewUrl ? (
									<img
										src={previewUrl}
										alt="Preview barang"
										className="w-full h-full object-cover"
									/>
								) : (
									<Upload size={20} />
								)}
							</div>

							{/* Input File Elemen */}
							<div className="flex-1 min-w-0">
								<input
									type="file"
									id="product-file-input"
									accept="image/*"
									onChange={handleFileChange}
									className="hidden"
								/>
								<label
									htmlFor="product-file-input"
									className="inline-block px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-2xs">
									Pilih Gambar
								</label>
								<p className="text-[10px] text-slate-400 mt-1 truncate">
									{selectedFile
										? selectedFile.name
										: 'Format JPG/PNG, Maksimal 2MB'}
								</p>
							</div>
						</div>
					</div>

					{/* FOOTER TOMBOL AKSI */}
					<div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
						<button
							type="button"
							onClick={onClose}
							disabled={isUploading}
							className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-lg transition-colors">
							Batal
						</button>
						<button
							type="submit"
							disabled={isUploading}
							className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center justify-center min-w-20">
							{isUploading ? (
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
							) : mode === 'add' ? (
								'Tambahkan Barang'
							) : (
								'Simpan Perubahan'
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

import { supabase } from '../config/supabaseClient'
import type { Product } from '../types/product'
import type { ActivityLog } from '../types/activityLog'

export const productService = {
	// --- FUNGSI UTAMA AUDIT LOGS ---
	async addLog(
		action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TRANSACTION',
		description: string,
	) {
		const { error } = await supabase
			.from('activity_logs')
			.insert([{ action, description }])
		if (error) console.error('Gagal mencatat log aktivitas:', error.message)
	},

	async getLogs(limit = 5) {
		const { data, error } = await supabase
			.from('activity_logs')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(limit)
		if (error) throw error
		return data as ActivityLog[]
	},

	// --- FUNGSI UNTUK UNGGAH GAMBAR KE BUCKET ---
	async uploadImage(file: File): Promise<string> {
		// Buat nama file unik agar tidak saling menimpa (contoh: 1718239201-namafoto.jpg)
		const fileExt = file.name.split('.').pop()
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
		const filePath = `${fileName}`

		// 1. Unggah file mentah ke bucket 'product-images'
		const { error: uploadError } = await supabase.storage
			.from('product-images')
			.upload(filePath, file)

		if (uploadError) throw uploadError

		// 2. Ambil URL publik dari file yang berhasil diunggah
		const { data } = supabase.storage
			.from('product-images')
			.getPublicUrl(filePath)

		return data.publicUrl // Mengembalikan string URL publik
	},

	// --- MODIFIKASI CRUD AGAR OTOMATIS MENCATAT LOG ---
	async getAll() {
		const { data, error } = await supabase
			.from('products')
			.select('*')
			.order('id', { ascending: false })
		if (error) throw error
		return data as Product[]
	},

	async create(product: Omit<Product, 'id'>) {
		const { data, error } = await supabase
			.from('products')
			.insert([product])
			.select()
		if (error) throw error

		// Catat log otomatis
		await this.addLog(
			'CREATE',
			`Admin menambahkan produk baru: "${product.name}" dengan SKU: ${product.sku}`,
		)
		return data
	},

	async update(id: string, product: Omit<Product, 'id'>) {
		const { error } = await supabase
			.from('products')
			.update(product)
			.eq('id', id)
		if (error) throw error

		// Catat log otomatis
		await this.addLog(
			'UPDATE',
			`Admin memperbarui info produk: "${product.name}" (SKU: ${product.sku})`,
		)
	},

	async delete(id: string) {
		// Ambil info nama barang dulu sebelum dihapus untuk keperluan log
		const { data: prod } = await supabase
			.from('products')
			.select('name')
			.eq('id', id)
			.single()

		const { error } = await supabase.from('products').delete().eq('id', id)
		if (error) throw error

		// Catat log otomatis
		await this.addLog(
			'DELETE',
			`Admin menghapus produk: "${prod?.name || 'Tidak diketahui'}" dari inventaris`,
		)
	},

	async updateStockBulk(
		items: {
			id: string
			name: string
			currentStock: number
			quantity: number
		}[],
	) {
		for (const item of items) {
			const newStock = item.currentStock - item.quantity
			const { error } = await supabase
				.from('products')
				.update({ stock: newStock })
				.eq('id', item.id)
			if (error) throw error

			// Catat log otomatis untuk setiap transaksi kasir
			await this.addLog(
				'TRANSACTION',
				`Kasir memproses penjualan "${item.name}" sebanyak ${item.quantity} unit`,
			)
		}
	},
}

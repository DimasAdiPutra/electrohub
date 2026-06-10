import { supabase } from '../config/supabaseClient'
import type { Product } from '../types/product'

export const productService = {
	// Ambil semua data produk
	async getAll() {
		const { data, error } = await supabase
			.from('products')
			.select('*')
			.order('id', { ascending: false })
		if (error) throw error
		return data as Product[]
	},

	// Tambah produk baru
	async create(product: Omit<Product, 'id'>) {
		const { data, error } = await supabase
			.from('products')
			.insert([product])
			.select()
		if (error) throw error
		return data
	},

	// Perbarui data produk
	async update(id: string, product: Omit<Product, 'id'>) {
		const { error } = await supabase
			.from('products')
			.update(product)
			.eq('id', id)
		if (error) throw error
	},

	// Hapus produk
	async delete(id: string) {
		const { error } = await supabase.from('products').delete().eq('id', id)
		if (error) throw error
	},

	// Proses potong stok masal (Kasir)
	async updateStockBulk(
		items: { id: string; currentStock: number; quantity: number }[],
	) {
		for (const item of items) {
			const newStock = item.currentStock - item.quantity
			const { error } = await supabase
				.from('products')
				.update({ stock: newStock })
				.eq('id', item.id)
			if (error) throw error
		}
	},
}

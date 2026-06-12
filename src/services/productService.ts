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

	// --- 1. PROSES POTONG STOK & CATAT NOTA TRANSAKSI REAL ---
  async updateStockBulk(
    items: { id: string; name: string; currentStock: number; quantity: number; price: number }[],
    totalPayment: number
  ) {
    // A. Kurangi stok masing-masing produk di Supabase
    for (const item of items) {
      const newStock = item.currentStock - item.quantity;
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.id);

      if (stockError) throw stockError;

      // Catat log aktivitas santai untuk admin
      await this.addLog('TRANSACTION', `Kasir menjual "${item.name}" sebanyak ${item.quantity} unit`);
    }

    // B. Masukkan data keuangan riil ke tabel transaksi baru
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const { error: txError } = await supabase
      .from('sales_transactions')
      .insert([{ total_payment: totalPayment, total_items: totalItems }]);

    if (txError) throw txError;
  },

	// --- FUNGSI UNTUK MERUBAH DATA MENJADI EXCEL / CSV ---
	async downloadInventoryCSV() {
		try {
			// 1. Ambil data produk terbaru dari database
			const products = await this.getAll()

			if (products.length === 0) {
				alert('Tidak ada data produk yang bisa diexport.')
				return
			}

			// 2. Buat judul kolom (Header) di baris pertama Excel
			// Menggunakan pembatas koma (,) atau titik koma (;) sesuai standar Excel internasional
			const headers = [
				'No',
				'Nama Produk',
				'Kode SKU',
				'Kategori',
				'Harga (Rp)',
				'Stok Tersedia',
			]

			// 3. Konversi susunan data produk menjadi baris-baris teks CSV
			const csvRows = [
				headers.join(','), // Baris pertama adalah header
				...products.map((p, i) =>
					[
						`"${i + 1}"`,
						`"${p.name.replace(/"/g, '""')}"`, // Bungkus dengan tanda kutip untuk mengamankan karakter spasi atau koma
						`"${p.sku}"`,
						`"${p.category}"`,
						p.price,
						p.stock,
					].join(','),
				),
			]

			const csvContent = csvRows.join('\n')

			// 4. Proses konversi teks menjadi file berkas biner (Blob) instan di browser
			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
			const url = URL.createObjectURL(blob)

			// 5. Trigger download otomatis di browser user
			const link = document.createElement('a')
			link.href = url

			// Beri nama file laporan yang rapi disertai tanggal cetak otomatis
			const tanggal = new Date().toLocaleDateString('id-ID').replace(/\//g, '-')
			link.setAttribute(
				'download',
				`Laporan_Inventaris_ElectroHub_${tanggal}.csv`,
			)

			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)

			// 6. Catat ke Log Aktivitas bahwa admin telah mencetak laporan keuangan
			await this.addLog(
				'TRANSACTION',
				`Admin melakukan export seluruh data laporan inventaris toko ke file Excel/CSV`,
			)
		} catch (error: any) {
			alert('Gagal mengeksport data: ' + error.message)
		}
	},

	// --- FUNGSI BARU: ANALITIK KASIR RIIL ---
	async getSalesAnalytics() {
    const { data, error } = await supabase
      .from('sales_transactions')
      .select('total_payment');

    if (error) throw error;

    // Hitung total pesanan berdasarkan jumlah baris di tabel transaksi
    const totalOrders = data.length;

    // Hitung total pendapatan riil dari penjumlahan nominal seluruh transaksi
    const totalRevenue = data.reduce((sum, tx) => sum + Number(tx.total_payment), 0);

    return {
      totalOrders,
      totalRevenue
    };
  }
}

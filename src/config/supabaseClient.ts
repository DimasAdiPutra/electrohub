import { createClient } from '@supabase/supabase-js'

// 1. Ambil kunci rahasia dari file .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// 2. Validasi pengaman untuk memastikan kunci sudah terbaca dengan benar
if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		'Koneksi gagal: URL atau Anon Key Supabase belum diatur di file .env.local',
	)
}

// 3. Buat dan ekspor client Supabase agar bisa dipakai di komponen lain
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

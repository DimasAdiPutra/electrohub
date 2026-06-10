import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import { DashboardView } from './components/dashboard/DashboardView'
import { InventoryView } from './components/inventory/InventoryView'
import { SalesView } from './components/sales/SalesView'
import { Menu, X } from 'lucide-react' // Mengambil ikon menu

function App() {
	const [activePage, setActivePage] = useState<
		'dashboard' | 'inventory' | 'sales'
	>('dashboard')
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // State untuk HP

	return (
		<div className="flex h-screen bg-slate-50 overflow-hidden w-full">
			{/* SIDEBAR: Di desktop otomatis muncul (md:flex), di HP disembunyikan (hidden) kecuali tombol menu diklik */}
			<div
				className={`fixed inset-y-0 left-0 z-50 md:relative md:flex ${isMobileMenuOpen ? 'flex' : 'hidden'}`}>
				<Sidebar
					activePage={activePage}
					setActivePage={(page) => {
						setActivePage(page)
						setIsMobileMenuOpen(false) // Otomatis tutup sidebar di HP setelah klik menu
					}}
				/>
			</div>

			{/* OVERLAY: Biar layar belakang gelap saat sidebar HP terbuka */}
			{isMobileMenuOpen && (
				<div
					onClick={() => setIsMobileMenuOpen(false)}
					className="fixed inset-0 bg-black/40 z-40 md:hidden"
				/>
			)}

			{/* HALAMAN UTAMA */}
			<div className="flex-1 flex flex-col min-w-0">
				{/* HEADER UNTUK MOBIL / HP (Hanya muncul di layar kecil) */}
				<header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between md:hidden">
					<h2 className="font-bold text-slate-800">ElectroHub</h2>
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className="p-2 text-slate-600">
						{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</header>

				{/* KONTEN */}
				<main className="flex-1 p-4 md:p-6 overflow-y-auto">
					{activePage === 'dashboard' && (
						<DashboardView
							onNavigateToInventory={() => setActivePage('inventory')}
						/>
					)}
					{activePage === 'inventory' && <InventoryView />}
					{activePage === 'sales' && <SalesView />}
				</main>
			</div>
		</div>
	)
}

export default App

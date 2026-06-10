import React from 'react'
import {
	LayoutDashboard,
	Package,
	// ShoppingCart,
	// BarChart3,
	Store,
} from 'lucide-react'

// Definisi tipe halaman yang valid sesuai dengan state di App.tsx
// type PageType = 'dashboard' | 'inventory' | 'orders' | 'reports'
type PageType = 'dashboard' | 'inventory'

interface SidebarProps {
	activePage: PageType
	setActivePage: (page: PageType) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
	activePage,
	setActivePage,
}) => {
	// Daftar menu navigasi beserta ikon dan target halamannya
	const menuItems = [
		{ id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
		{ id: 'inventory', name: 'Inventory', icon: Package },
		// { id: 'orders', name: 'Orders', icon: ShoppingCart },
		// { id: 'reports', name: 'Reports', icon: BarChart3 },
	]

	return (
		<aside className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800">
			{/* BAGIAN ATAS: LOGO & NAMA APLIKASI */}
			<div>
				<div className="p-6 flex items-center space-x-3 border-b border-slate-800">
					<div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-600/20">
						<Store size={20} />
					</div>
					<div>
						<h2 className="font-bold text-white tracking-wide text-lg leading-none">
							ElectroHub
						</h2>
						<p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-1">
							Electronics
						</p>
					</div>
				</div>

				{/* DAFTAR MENU NAVIGASI */}
				<nav className="p-4 space-y-1">
					{menuItems.map((item) => {
						const IconComponent = item.icon
						const isActive = activePage === item.id

						return (
							<button
								key={item.id}
								onClick={() => setActivePage(item.id as PageType)}
								className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
									isActive
										? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
										: 'hover:bg-slate-800/60 hover:text-slate-100 text-slate-400'
								}`}>
								<IconComponent
									size={18}
									className={
										isActive
											? 'text-white'
											: 'text-slate-400 group-hover:text-slate-100'
									}
								/>
								<span>{item.name}</span>
							</button>
						)
					})}
				</nav>
			</div>

			{/* BAGIAN BAWAH: FOOTER/PROFIL SINGKAT (OPSIONAL) */}
			<div className="p-4 border-t border-slate-800 bg-slate-950/30 flex items-center space-x-3">
				<div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-white border border-slate-600">
					AR
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-xs font-semibold text-slate-200 truncate">
						Admin Rian
					</p>
					<p className="text-[10px] text-slate-500 truncate">Super Admin</p>
				</div>
			</div>
		</aside>
	)
}

export default Sidebar

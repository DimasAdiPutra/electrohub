import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  TrendingUp, 
  ArrowRight,
  Layers
} from 'lucide-react';
import type { Product } from '../../types/product';
import { formatRupiah } from '../../utils/formatCurrency';
import { supabase } from '../../config/supabaseClient';

interface DashboardViewProps {
  onNavigateToInventory?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToInventory }) => {
  // State untuk menampung data riil dari Supabase
  const [realProducts, setRealProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mengambil data dari database saat komponen dimuat
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) throw error;
        if (data) setRealProducts(data as Product[]);
      } catch (error: any) {
        console.error('Gagal memuat statistik dashboard:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ==========================================
  // LOGIKA PENGOLAHAN DATA RIIL (DERIVED STATE)
  // ==========================================
  
  // 1. Hitung produk dengan stok kritis (stok <= 5) dari database
  const lowStockItems = realProducts.filter(product => product.stock <= 5);
  
  // 2. Hitung total jenis produk unik yang ada di database
  const totalUniqueProducts = realProducts.length;

  // 3. Susun data statistik untuk Quad Cards (Menggunakan data riil)
  const quickStats = [
    { id: 1, title: 'Total Produk', value: isLoading ? '...' : `${totalUniqueProducts} Item`, icon: Package, color: 'bg-blue-500/10 text-blue-600' },
    { id: 2, title: 'Stok Kritis', value: isLoading ? '...' : `${lowStockItems.length} Produk`, icon: AlertTriangle, color: 'bg-red-500/10 text-red-600' },
    { id: 3, title: 'Pesanan Masuk', value: '24 Order', icon: ShoppingCart, color: 'bg-amber-500/10 text-amber-600' },
    { id: 4, title: 'Total Pendapatan', value: formatRupiah(45200000), icon: TrendingUp, color: 'bg-emerald-500/10 text-emerald-600' },
  ];

  // Data statis untuk log aktivitas
  const recentActivities = [
    { id: 1, time: '10 menit yang lalu', desc: 'Admin memantau sistem pergudangan ElectroHub' },
    { id: 2, time: '1 jam yang lalu', desc: 'Database terkoneksi dengan cloud PostgreSQL Supabase' },
    { id: 3, time: '2 jam yang lalu', desc: 'Integrasi sistem modul admin eksternal selesai' },
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Ringkasan Toko</h1>
        <p className="text-sm text-slate-500">Berikut pantauan inventaris ElectroHub hari ini berdasarkan data live database.</p>
      </div>

      {/* QUAD STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {quickStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.title}</p>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <IconComponent size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SISI KIRI: LOW STOCK ALERT PANEL (Dinamis dari Supabase) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertTriangle size={20} />
              <h2 className="font-bold text-slate-800">Peringatan Stok Kritis</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">Item berikut berada di bawah batas minimum (5 unit).</p>
            
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-xs text-slate-400 text-center py-6 animate-pulse">Memuat data stok kritis...</p>
              ) : lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <div key={item.id} className="p-3 bg-red-50/60 border border-red-100 rounded-lg flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-sm font-semibold text-slate-800 truncate">{item.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{item.sku}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-red-600 text-white font-bold text-xs rounded-md shrink-0">
                      {item.stock} Unit
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">Semua stok produk aman (di atas 5 unit).</p>
              )}
            </div>
          </div>

          <button 
            onClick={onNavigateToInventory}
            className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-colors cursor-pointer"
          >
            <span>Restock di Inventaris</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* SISI KANAN: AKTIVITAS TERBARU & CHART PLACEHOLDER */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-6">
          
          <div>
            <div className="flex items-center space-x-2 text-slate-700 mb-4">
              <Layers size={18} />
              <h2 className="font-bold text-slate-800">Log Aktivitas Admin</h2>
            </div>
            <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-5">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="relative">
                  <div className="absolute -left-5.25 mt-1 w-2.5 h-2.5 bg-slate-400 rounded-full border-2 border-white" />
                  <p className="text-xs font-medium text-slate-400">{activity.time}</p>
                  <p className="text-sm text-slate-600 font-medium mt-0.5">{activity.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tren Penjualan Minggu Ini</h3>
            <div className="h-32 w-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center">
              <p className="text-xs text-slate-400 font-medium">[ Area Visualisasi Grafik Tren Penjualan ]</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardView;
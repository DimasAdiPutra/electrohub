import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle } from 'lucide-react';
import type { Product } from '../../types/product';
import { formatRupiah } from '../../utils/formatCurrency';
import { supabase } from '../../config/supabaseClient';

interface CartItem {
  product: Product;
  quantity: number;
}

export const SalesView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // 1. Ambil data produk yang stoknya masih ada (> 0)
  const fetchAvailableProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) setProducts(data as Product[]);
    } catch (error: any) {
      alert('Gagal memuat produk kasir: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableProducts();
  }, []);

  // 2. Fungsi Tambah Barang ke Keranjang
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Stok barang sudah habis!');
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        // Cek apakah kuantitas melebihi stok yang ada
        if (existingItem.quantity >= product.stock) {
          alert(`Tidak bisa menambah lebih banyak. Stok terbatas ${product.stock} unit.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  // 3. Kurangi Kuantitas di Keranjang
  const updateQuantity = (productId: string, amount: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + amount;
            if (newQty <= 0) return null; // Hapus jika 0

            // Cek batas stok saat ditambah lewat keranjang
            if (newQty > item.product.stock) {
              alert(`Stok hanya tersedia ${item.product.stock} unit.`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // 4. Hapus Item dari Keranjang
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  // 5. Hitung Total Pembayaran
  const totalPayment = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // 6. Fungsi Checkout Utama (Potong Stok Supabase)
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setIsProcessingPay(true);

      // Lakukan iterasi update stok untuk setiap barang di dalam keranjang
      for (const item of cart) {
        const newStock = item.product.stock - item.quantity;

        const { error } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product.id);

        if (error) throw error;
      }

      // Berhasil
      setCheckoutSuccess(true);
      setCart([]); // Kosongkan keranjang
      fetchAvailableProducts(); // Refresh data produk lokal

      setTimeout(() => setCheckoutSuccess(false), 4000); // Sembunyikan notif setelah 4 detik
    } catch (error: any) {
      alert('Transaksi gagal diproses: ' + error.message);
    } finally {
      setIsProcessingPay(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Sistem Kasir (POS)</h1>
        <p className="text-sm text-slate-500">Pilih produk elektronik untuk membuat nota penjualan instan pelanggan.</p>
      </div>

      {checkoutSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle className="text-emerald-500 shrink-0" size={20} />
          <span className="text-sm font-semibold">Transaksi Berhasil! Stok database Supabase telah berhasil diperbarui otomatis.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM KIRI: DAFTAR PRODUK (2/3 Layar) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Katalog Produk Tersedia</h3>
          
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Memuat katalog barang...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => addToCart(product)}
                  className={`bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex space-x-3 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all select-none group ${product.stock === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg border border-slate-100 shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">{product.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{product.sku}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold text-sm text-slate-700">{formatRupiah(product.price)}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${product.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                        Stok: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* KOLOM KANAN: KERANJANG BELANJA (1/3 Layar) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between h-[calc(100vh-220px)] sticky top-6">
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center space-x-2 text-slate-700 border-b border-slate-100 pb-3 mb-4">
              <ShoppingCart size={18} />
              <h2 className="font-bold text-slate-800">Keranjang Nota</h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">{cart.length}</span>
            </div>

            {/* List Item Keranjang */}
            <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">Keranjang belanja kosong. Klik produk di sebelah kiri.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between gap-2 border-b border-slate-50 pb-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{item.product.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{formatRupiah(item.product.price)}</p>
                    </div>
                    
                    {/* Kontrol Kuantitas */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold text-slate-800 w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors">
                        <Plus size={12} />
                      </button>
                      <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-slate-300 hover:text-red-500 rounded-md transition-colors ml-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bagian Total & Tombol Bayar */}
          <div className="border-t border-slate-100 pt-4 mt-4 space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Total Pembayaran:</span>
              <span className="text-lg font-bold text-slate-800">{formatRupiah(totalPayment)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessingPay}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              {isProcessingPay ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Proses & Kurangi Stok Cloud</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
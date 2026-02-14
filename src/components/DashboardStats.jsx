// src/components/DashboardStats.jsx
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

const DashboardStats = ({ date }) => {
  const [stats, setStats] = useState({
    daily: {
      totalSales: 0,
      totalTransactions: 0,
      cashTotal: 0,
      transferTotal: 0,
      profit: 0,
      averageTransaction: 0
    },
    weekly: {
      totalSales: 0,
      growth: 0
    },
    monthly: {
      totalSales: 0,
      target: 100000000, // Target 100 juta
      percentage: 0
    },
    topProducts: [],
    lowStock: [],
    recentTransactions: []
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date(date);
      today.setHours(0, 0, 0, 0);
      
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      console.log('Fetching data for date:', date);

      // 1. Ambil transaksi hari ini
      const dailyQuery = query(
        collection(db, 'transactions'),
        where('timestamp', '>=', today),
        where('timestamp', '<=', endOfDay),
        where('type', '==', 'sale')
      );
      
      const dailySnapshot = await getDocs(dailyQuery);
      let dailyTotal = 0;
      let dailyCash = 0;
      let dailyTransfer = 0;
      let dailyProfit = 0;

      dailySnapshot.forEach(doc => {
        const data = doc.data();
        dailyTotal += data.total || 0;
        dailyCash += data.cash || 0;
        dailyTransfer += data.transfer || 0;
        dailyProfit += (data.total || 0) * 0.2; // Estimasi profit 20%
      });

      // 2. Ambil transaksi minggu ini
      const weeklyQuery = query(
        collection(db, 'transactions'),
        where('timestamp', '>=', startOfWeek),
        where('timestamp', '<=', endOfDay),
        where('type', '==', 'sale')
      );
      
      const weeklySnapshot = await getDocs(weeklyQuery);
      let weeklyTotal = 0;
      weeklySnapshot.forEach(doc => weeklyTotal += doc.data().total || 0);

      // 3. Ambil transaksi bulan ini
      const monthlyQuery = query(
        collection(db, 'transactions'),
        where('timestamp', '>=', startOfMonth),
        where('timestamp', '<=', endOfDay),
        where('type', '==', 'sale')
      );
      
      const monthlySnapshot = await getDocs(monthlyQuery);
      let monthlyTotal = 0;
      monthlySnapshot.forEach(doc => monthlyTotal += doc.data().total || 0);

      // 4. Hitung Top Products dari semua transaksi
      const allTransactionsQuery = query(
        collection(db, 'transactions'),
        where('type', '==', 'sale')
      );
      const allTransactionsSnapshot = await getDocs(allTransactionsQuery);
      
      const productSales = {};
      const productDetails = {}; // Untuk menyimpan detail produk

      allTransactionsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.items && Array.isArray(data.items)) {
          data.items.forEach(item => {
            const key = item.code || item.name;
            
            if (!productSales[key]) {
              productSales[key] = {
                name: item.name,
                code: item.code,
                price: item.price,
                quantity: 0,
                total: 0
              };
            }
            
            productSales[key].quantity += item.quantity || 0;
            productSales[key].total += (item.price * (item.quantity || 0));
            
            // Simpan detail produk untuk referensi
            if (!productDetails[key]) {
              productDetails[key] = {
                name: item.name,
                code: item.code,
                price: item.price,
                unit: item.unit || 'pcs'
              };
            }
          });
        }
      });

      // Sort by quantity sold dan ambil top 5
      const topProductsList = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
        .map(item => ({
          id: item.code,
          name: item.name,
          soldCount: item.quantity,
          totalSales: item.total,
          price: item.price,
          ...productDetails[item.code]
        }));

      console.log('Top Products:', topProductsList);

      // 5. Ambil low stock products
      const lowStockQuery = query(
        collection(db, 'products'),
        where('stock', '<=', 10),
        orderBy('stock', 'asc'),
        limit(5)
      );
      
      let lowStock = [];
      try {
        const lowStockSnapshot = await getDocs(lowStockQuery);
        lowStock = lowStockSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.log('No low stock products or need index:', error);
        // Fallback: ambil semua produk dan filter manual
        const allProductsSnapshot = await getDocs(collection(db, 'products'));
        lowStock = allProductsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.stock <= (p.minStock || 10))
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 5);
      }

      // 6. Ambil recent transactions
      const recentQuery = query(
        collection(db, 'transactions'),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const recentSnapshot = await getDocs(recentQuery);
      const recentTransactions = recentSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.timestamp?.toDate?.()
        };
      });

      // 7. Hitung growth mingguan
      const lastWeekStart = new Date(startOfWeek);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(startOfWeek);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
      lastWeekEnd.setHours(23, 59, 59, 999);
      
      const lastWeekQuery = query(
        collection(db, 'transactions'),
        where('timestamp', '>=', lastWeekStart),
        where('timestamp', '<=', lastWeekEnd),
        where('type', '==', 'sale')
      );
      const lastWeekSnapshot = await getDocs(lastWeekQuery);
      let lastWeekTotal = 0;
      lastWeekSnapshot.forEach(doc => lastWeekTotal += doc.data().total || 0);

      const weeklyGrowth = lastWeekTotal > 0 
        ? ((weeklyTotal - lastWeekTotal) / lastWeekTotal) * 100 
        : 0;

      setStats({
        daily: {
          totalSales: dailyTotal,
          totalTransactions: dailySnapshot.size,
          cashTotal: dailyCash,
          transferTotal: dailyTransfer,
          profit: dailyProfit,
          averageTransaction: dailySnapshot.size > 0 ? dailyTotal / dailySnapshot.size : 0
        },
        weekly: {
          totalSales: weeklyTotal,
          growth: weeklyGrowth
        },
        monthly: {
          totalSales: monthlyTotal,
          target: 100000000,
          percentage: (monthlyTotal / 100000000) * 100
        },
        topProducts: topProductsList,
        lowStock,
        recentTransactions
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Format angka ke Rupiah
  const formatRupiah = (angka) => {
    return `Rp ${angka.toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Sales */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">Hari Ini</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatRupiah(stats.daily.totalSales)}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {stats.daily.totalTransactions} transaksi
          </p>
          <div className="mt-3 flex items-center text-sm">
            <span className="text-green-600 font-medium">
              {formatRupiah(stats.daily.profit)}
            </span>
            <span className="text-gray-500 ml-1">estimasi profit</span>
          </div>
        </div>

        {/* Weekly Sales */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">Minggu Ini</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatRupiah(stats.weekly.totalSales)}
          </h3>
          <div className="mt-3 flex items-center text-sm">
            {stats.weekly.growth > 0 ? (
              <>
                <span className="text-green-600 font-medium">↑ {stats.weekly.growth.toFixed(1)}%</span>
                <span className="text-gray-500 ml-1">dari minggu lalu</span>
              </>
            ) : stats.weekly.growth < 0 ? (
              <>
                <span className="text-red-600 font-medium">↓ {Math.abs(stats.weekly.growth).toFixed(1)}%</span>
                <span className="text-gray-500 ml-1">dari minggu lalu</span>
              </>
            ) : (
              <span className="text-gray-500">Sama dengan minggu lalu</span>
            )}
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">Bulan Ini</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatRupiah(stats.monthly.totalSales)}
          </h3>
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Target: Rp 100 jt</span>
              <span className="font-medium">{stats.monthly.percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 rounded-full h-2 transition-all duration-500" 
                style={{ width: `${Math.min(stats.monthly.percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Average Transaction */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">Rata-rata</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatRupiah(stats.daily.averageTransaction)}
          </h3>
          <p className="text-sm text-gray-600 mt-1">per transaksi hari ini</p>
          <div className="mt-3 text-xs text-gray-500">
            Total: {stats.daily.totalTransactions} transaksi
          </div>
        </div>
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">🏆 Produk Terlaris</h3>
            <span className="text-xs text-gray-500">Berdasarkan jumlah terjual</span>
          </div>
          
          <div className="space-y-4">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => (
                <div key={product.id || index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-3
                    ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'}
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="mr-3">{product.soldCount} terjual</span>
                      <span>{formatRupiah(product.totalSales)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{product.code}</p>
                    <p className="text-xs text-gray-400">{formatRupiah(product.price)}/{product.unit || 'pcs'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p>Belum ada data penjualan</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              ⚠️ Stok Menipis
              {stats.lowStock.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                  {stats.lowStock.length} perlu restock
                </span>
              )}
            </h3>
            <span className="text-xs text-gray-500">Stok ≤ 10</span>
          </div>
          
          <div className="space-y-3">
            {stats.lowStock.length > 0 ? (
              stats.lowStock.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">Kode: {product.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-bold text-lg">{product.stock} {product.unit}</p>
                    <p className="text-xs text-gray-500">Min: {product.minStock || 10}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto text-green-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Semua stok aman</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {stats.lowStock.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                + Restock semua
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">🔄 Transaksi Terbaru</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Lihat Semua →
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-500">ID</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Waktu</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Kasir</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Items</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Total</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Metode</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map(transaction => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-sm font-medium text-gray-900">
                      #{transaction.id?.substring(0, 8)}
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {transaction.date?.toLocaleTimeString('id-ID')}
                    </td>
                    <td className="py-3 text-sm text-gray-600">{transaction.kasir}</td>
                    <td className="py-3 text-sm text-gray-600">{transaction.items?.length} item</td>
                    <td className="py-3 text-sm font-medium text-gray-900">
                      {formatRupiah(transaction.total || 0)}
                    </td>
                    <td className="py-3">
                      {transaction.cash > 0 && transaction.transfer > 0 ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                          Mixed
                        </span>
                      ) : transaction.cash > 0 ? (
                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                          Tunai
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                          Transfer
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    Belum ada transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Tunai</p>
          <p className="text-lg font-bold text-gray-900">{formatRupiah(stats.daily.cashTotal)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Transfer</p>
          <p className="text-lg font-bold text-gray-900">{formatRupiah(stats.daily.transferTotal)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Produk Terjual</p>
          <p className="text-lg font-bold text-gray-900">
            {stats.topProducts.reduce((acc, p) => acc + p.soldCount, 0)} item
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Estimasi Profit</p>
          <p className="text-lg font-bold text-green-600">{formatRupiah(stats.daily.profit)}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
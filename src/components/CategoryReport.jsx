// src/components/CategoryReport.jsx
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import * as XLSX from 'xlsx';

const CategoryReport = () => {
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState({
    categories: [],
    summary: {
      totalCategories: 0,
      totalSales: 0,
      totalItems: 0,
      topCategory: null
    }
  });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, 'transactions'),
        where('timestamp', '>=', start),
        where('timestamp', '<=', end),
        where('type', '==', 'sale')
      );

      const snapshot = await getDocs(q);
      
      const categoryMap = {};
      let totalSales = 0;
      let totalItems = 0;

      snapshot.forEach(doc => {
        const trans = doc.data();
        if (trans.items) {
          trans.items.forEach(item => {
            const cat = item.category || 'lainnya';
            if (!categoryMap[cat]) {
              categoryMap[cat] = {
                category: cat,
                sales: 0,
                quantity: 0,
                transactions: 0,
                averagePrice: 0,
                products: {}
              };
            }
            
            categoryMap[cat].sales += item.price * item.quantity;
            categoryMap[cat].quantity += item.quantity;
            categoryMap[cat].transactions++;
            
            // Track produk dalam kategori
            const productKey = item.code || item.name;
            if (!categoryMap[cat].products[productKey]) {
              categoryMap[cat].products[productKey] = {
                name: item.name,
                code: item.code,
                quantity: 0,
                sales: 0
              };
            }
            categoryMap[cat].products[productKey].quantity += item.quantity;
            categoryMap[cat].products[productKey].sales += item.price * item.quantity;
            
            totalSales += item.price * item.quantity;
            totalItems += item.quantity;
          });
        }
      });

      // Hitung rata-rata dan konversi ke array
      const categories = Object.values(categoryMap).map(cat => {
        cat.averagePrice = cat.quantity > 0 ? cat.sales / cat.quantity : 0;
        cat.topProducts = Object.values(cat.products)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 3);
        return cat;
      }).sort((a, b) => b.sales - a.sales);

      setData({
        categories,
        summary: {
          totalCategories: categories.length,
          totalSales,
          totalItems,
          topCategory: categories[0] || null
        }
      });
    } catch (error) {
      console.error("Error fetching category data:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatRupiah = (angka) => {
    return `Rp ${angka.toLocaleString('id-ID')}`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      makanan: '🍚',
      minuman: '🥤',
      rokok: '🚬',
      gas: '🔥',
      minyak: '🫒',
      sembako: '📦',
      lainnya: '📌'
    };
    return icons[category] || '📦';
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Ringkasan per Kategori
    const categoryData = [
      ['LAPORAN PENJUALAN PER KATEGORI'],
      [`Periode: ${startDate} s/d ${endDate}`],
      [],
      ['Kategori', 'Total Penjualan', 'Quantity', 'Rata-rata Harga', 'Jumlah Transaksi', 'Kontribusi'],
      ...data.categories.map(c => [
        c.category,
        c.sales,
        c.quantity,
        c.averagePrice,
        c.transactions,
        `${((c.sales / data.summary.totalSales) * 100).toFixed(2)}%`
      ])
    ];
    const wsCategory = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, wsCategory, 'Per Kategori');

    XLSX.writeFile(wb, `laporan_kategori_${startDate}_${endDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                // Logic untuk set date range
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="custom">Kustom</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Total Kategori</p>
          <p className="text-3xl font-bold mt-2">{data.summary.totalCategories}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Total Penjualan</p>
          <p className="text-2xl font-bold mt-2">{formatRupiah(data.summary.totalSales)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Total Items Terjual</p>
          <p className="text-3xl font-bold mt-2">{data.summary.totalItems}</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Kategori Top</p>
          <p className="text-2xl font-bold mt-2 capitalize">{data.summary.topCategory?.category || '-'}</p>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.categories.map(cat => (
          <div key={cat.category} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getCategoryIcon(cat.category)}</span>
                <h3 className="text-lg font-bold text-gray-900 capitalize">{cat.category}</h3>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                {((cat.sales / data.summary.totalSales) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Total Penjualan</p>
                <p className="text-lg font-bold text-gray-900">{formatRupiah(cat.sales)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantity Terjual</p>
                <p className="text-lg font-bold text-gray-900">{cat.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rata-rata Harga</p>
                <p className="text-md font-medium text-gray-700">{formatRupiah(cat.averagePrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transaksi</p>
                <p className="text-md font-medium text-gray-700">{cat.transactions}</p>
              </div>
            </div>

            {/* Top Products in Category */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Produk Terlaris:</p>
              <div className="space-y-2">
                {cat.topProducts.map((product, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{product.name}</span>
                    <span className="font-medium text-gray-900">{product.quantity} terjual</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pie Chart Visualization */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Distribusi Penjualan per Kategori</h3>
        <div className="space-y-3">
          {data.categories.map(cat => (
            <div key={cat.category} className="flex items-center">
              <span className="w-24 text-sm text-gray-600 capitalize flex items-center">
                <span className="mr-2">{getCategoryIcon(cat.category)}</span>
                {cat.category}
              </span>
              <div className="flex-1 mx-4">
                <div className="relative h-8">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg opacity-75 transition-all duration-300"
                    style={{ width: `${(cat.sales / data.summary.totalSales) * 100}%` }}
                  >
                    <div className="absolute inset-0 flex items-center px-3 text-white text-sm font-medium truncate">
                      {formatRupiah(cat.sales)}
                    </div>
                  </div>
                </div>
              </div>
              <span className="w-20 text-sm text-right text-gray-600">
                {((cat.sales / data.summary.totalSales) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryReport;
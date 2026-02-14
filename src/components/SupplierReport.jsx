// src/components/SupplierReport.jsx
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import * as XLSX from 'xlsx';

const SupplierReport = () => {
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState({
    suppliers: [],
    products: [],
    purchases: [],
    summary: {
      totalSuppliers: 0,
      totalProducts: 0,
      totalPurchaseValue: 0,
      topSupplier: null
    }
  });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Ambil semua produk
      const productsSnapshot = await getDocs(collection(db, 'products'));
      
      const supplierMap = {};
      const products = [];

      productsSnapshot.forEach(doc => {
        const product = { id: doc.id, ...doc.data() };
        products.push(product);
        
        const supplier = product.supplier || 'Unknown';
        if (!supplierMap[supplier]) {
          supplierMap[supplier] = {
            name: supplier,
            products: [],
            totalProducts: 0,
            totalStock: 0,
            totalValue: 0,
            categories: {}
          };
        }
        
        supplierMap[supplier].products.push(product);
        supplierMap[supplier].totalProducts++;
        supplierMap[supplier].totalStock += product.stock || 0;
        supplierMap[supplier].totalValue += (product.purchasePrice || product.price * 0.8) * (product.stock || 0);
        
        const cat = product.category || 'lainnya';
        if (!supplierMap[supplier].categories[cat]) {
          supplierMap[supplier].categories[cat] = 0;
        }
        supplierMap[supplier].categories[cat]++;
      });

      // Hitung transaksi pembelian (dari stock_history)
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const historyQuery = query(
        collection(db, 'stock_history'),
        where('timestamp', '>=', start),
        where('timestamp', '<=', end),
        where('type', '==', 'add'),
        orderBy('timestamp', 'desc')
      );

      let historySnapshot;
      try {
        historySnapshot = await getDocs(historyQuery);
      } catch (error) {
        console.log("Stock history collection may not exist");
        historySnapshot = { docs: [] };
      }

      const purchases = [];
      historySnapshot.forEach(doc => {
        purchases.push({ id: doc.id, ...doc.data() });
      });

      const suppliers = Object.values(supplierMap).sort((a, b) => b.totalValue - a.totalValue);

      setData({
        suppliers,
        products,
        purchases,
        summary: {
          totalSuppliers: suppliers.length,
          totalProducts: products.length,
          totalPurchaseValue: suppliers.reduce((acc, s) => acc + s.totalValue, 0),
          topSupplier: suppliers[0] || null
        }
      });
    } catch (error) {
      console.error("Error fetching supplier data:", error);
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

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Data Supplier
    const supplierData = [
      ['LAPORAN SUPPLIER'],
      [`Periode: ${startDate} s/d ${endDate}`],
      [],
      ['Nama Supplier', 'Jumlah Produk', 'Total Stok', 'Nilai Inventori', 'Kategori'],
      ...data.suppliers.map(s => [
        s.name,
        s.totalProducts,
        s.totalStock,
        s.totalValue,
        Object.keys(s.categories).join(', ')
      ])
    ];
    const wsSupplier = XLSX.utils.aoa_to_sheet(supplierData);
    XLSX.utils.book_append_sheet(wb, wsSupplier, 'Supplier');

    XLSX.writeFile(wb, `laporan_supplier_${startDate}_${endDate}.xlsx`);
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
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="month">Bulan Ini</option>
              <option value="3months">3 Bulan</option>
              <option value="year">Tahun Ini</option>
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
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Total Supplier</p>
          <p className="text-3xl font-bold mt-2">{data.summary.totalSuppliers}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Total Produk</p>
          <p className="text-3xl font-bold mt-2">{data.summary.totalProducts}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Nilai Inventori</p>
          <p className="text-2xl font-bold mt-2">{formatRupiah(data.summary.totalPurchaseValue)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Supplier Terbesar</p>
          <p className="text-xl font-bold mt-2 truncate">{data.summary.topSupplier?.name || '-'}</p>
        </div>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.suppliers.map(supplier => (
          <div key={supplier.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                {supplier.totalProducts} produk
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Total Stok</p>
                <p className="text-lg font-bold text-gray-900">{supplier.totalStock}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Nilai Inventori</p>
                <p className="text-lg font-bold text-green-600">{formatRupiah(supplier.totalValue)}</p>
              </div>
            </div>

            {/* Categories */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Kategori:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(supplier.categories).map(([cat, count]) => (
                  <span key={cat} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {cat} ({count})
                  </span>
                ))}
              </div>
            </div>

            {/* Top Products Preview */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Produk:</p>
              <div className="space-y-1">
                {supplier.products.slice(0, 3).map(p => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{p.name}</span>
                    <span className="text-gray-900">{p.stok} {p.unit}</span>
                  </div>
                ))}
                {supplier.products.length > 3 && (
                  <p className="text-xs text-gray-500 mt-1">
                    +{supplier.products.length - 3} produk lainnya
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Purchases */}
      {data.purchases.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Riwayat Pembelian Terbaru</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.purchases.map(purchase => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {purchase.timestamp?.toDate?.().toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {purchase.productName}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      +{purchase.adjustment}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {purchase.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierReport;
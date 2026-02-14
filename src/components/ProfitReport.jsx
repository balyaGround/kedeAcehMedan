// src/components/ProfitReport.jsx
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ProfitReport = () => {
  const [period, setPeriod] = useState('daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState({
    transactions: [],
    summary: {
      totalSales: 0,
      totalCost: 0,
      grossProfit: 0,
      operationalCost: 0,
      netProfit: 0,
      margin: 0,
      totalTransactions: 0
    },
    byCategory: [],
    byDay: []
  });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Ambil semua transaksi
      const q = query(
        collection(db, 'transactions'),
        where('timestamp', '>=', start),
        where('timestamp', '<=', end),
        where('type', '==', 'sale'),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      
      let totalSales = 0;
      let totalCost = 0;
      let totalTransactions = 0;
      const categoryMap = {};
      const dayMap = {};

      snapshot.forEach(doc => {
        const trans = doc.data();
        const transactionTotal = trans.total || 0;
        totalSales += transactionTotal;
        totalTransactions++;

        // Estimasi HPP (75% dari harga jual)
        const estimatedCost = transactionTotal * 0.75;
        totalCost += estimatedCost;

        // Group by category
        if (trans.items) {
          trans.items.forEach(item => {
            const cat = item.category || 'lainnya';
            if (!categoryMap[cat]) {
              categoryMap[cat] = {
                category: cat,
                sales: 0,
                cost: 0,
                profit: 0,
                quantity: 0
              };
            }
            const itemTotal = item.price * item.quantity;
            const itemCost = itemTotal * 0.75;
            categoryMap[cat].sales += itemTotal;
            categoryMap[cat].cost += itemCost;
            categoryMap[cat].profit += itemTotal - itemCost;
            categoryMap[cat].quantity += item.quantity;
          });
        }

        // Group by day
        const day = trans.timestamp?.toDate?.().toLocaleDateString('id-ID');
        if (day) {
          if (!dayMap[day]) {
            dayMap[day] = {
              date: day,
              sales: 0,
              cost: 0,
              profit: 0,
              transactions: 0
            };
          }
          dayMap[day].sales += transactionTotal;
          dayMap[day].cost += estimatedCost;
          dayMap[day].profit += transactionTotal - estimatedCost;
          dayMap[day].transactions++;
        }
      });

      const grossProfit = totalSales - totalCost;
      const operationalCost = totalSales * 0.05; // Estimasi biaya operasional 5%
      const netProfit = grossProfit - operationalCost;
      const margin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

      setData({
        transactions: snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().timestamp?.toDate?.()
        })),
        summary: {
          totalSales,
          totalCost,
          grossProfit,
          operationalCost,
          netProfit,
          margin,
          totalTransactions
        },
        byCategory: Object.values(categoryMap).sort((a, b) => b.profit - a.profit),
        byDay: Object.values(dayMap).sort((a, b) => new Date(b.date) - new Date(a.date))
      });
    } catch (error) {
      console.error("Error fetching profit data:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (period === 'daily') {
      setEndDate(startDate);
    }
    fetchData();
  }, [period, startDate, endDate, fetchData]);

  const formatRupiah = (angka) => {
    return `Rp ${angka.toLocaleString('id-ID')}`;
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Ringkasan
    const summaryData = [
      ['LAPORAN LABA RUGI'],
      [`Periode: ${startDate} s/d ${endDate}`],
      [],
      ['Deskripsi', 'Jumlah'],
      ['Total Penjualan', data.summary.totalSales],
      ['Total HPP (75%)', data.summary.totalCost],
      ['Laba Kotor', data.summary.grossProfit],
      ['Biaya Operasional (5%)', data.summary.operationalCost],
      ['Laba Bersih', data.summary.netProfit],
      ['Margin', `${data.summary.margin.toFixed(2)}%`],
      ['Jumlah Transaksi', data.summary.totalTransactions]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

    // Sheet 2: Per Kategori
    const categoryData = [
      ['Kategori', 'Penjualan', 'HPP', 'Laba', 'Quantity', 'Margin'],
      ...data.byCategory.map(c => [
        c.category,
        c.sales,
        c.cost,
        c.profit,
        c.quantity,
        `${((c.profit / c.sales) * 100).toFixed(2)}%`
      ])
    ];
    const wsCategory = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, wsCategory, 'Per Kategori');

    XLSX.writeFile(wb, `laba_rugi_${startDate}_${endDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Laporan Laba Rugi', 14, 22);
    doc.setFontSize(11);
    doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 32);

    // Ringkasan
    doc.setFontSize(14);
    doc.text('Ringkasan', 14, 45);
    doc.setFontSize(10);
    
    const summaryData = [
      ['Total Penjualan', formatRupiah(data.summary.totalSales)],
      ['Total HPP', formatRupiah(data.summary.totalCost)],
      ['Laba Kotor', formatRupiah(data.summary.grossProfit)],
      ['Biaya Operasional', formatRupiah(data.summary.operationalCost)],
      ['Laba Bersih', formatRupiah(data.summary.netProfit)],
      ['Margin', `${data.summary.margin.toFixed(2)}%`],
      ['Jumlah Transaksi', data.summary.totalTransactions]
    ];

    doc.autoTable({
      startY: 50,
      head: [['Deskripsi', 'Jumlah']],
      body: summaryData,
    });

    doc.save(`laba_rugi_${startDate}_${endDate}.pdf`);
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
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
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
              disabled={period === 'daily'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Total Penjualan</p>
          <p className="text-2xl font-bold mt-2">{formatRupiah(data.summary.totalSales)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Total HPP</p>
          <p className="text-2xl font-bold mt-2">{formatRupiah(data.summary.totalCost)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Laba Kotor</p>
          <p className="text-2xl font-bold mt-2">{formatRupiah(data.summary.grossProfit)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Biaya Operasional</p>
          <p className="text-2xl font-bold mt-2">{formatRupiah(data.summary.operationalCost)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Laba Bersih</p>
          <p className="text-2xl font-bold mt-2">{formatRupiah(data.summary.netProfit)}</p>
        </div>
      </div>

      {/* Profit by Category */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Laba per Kategori</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Penjualan</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">HPP</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Laba</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margin</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.byCategory.map(cat => (
                <tr key={cat.category} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">{cat.category}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">{formatRupiah(cat.sales)}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">{formatRupiah(cat.cost)}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-green-600">{formatRupiah(cat.profit)}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {((cat.profit / cat.sales) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">{cat.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Profit */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Laba per Hari</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Penjualan</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">HPP</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Laba</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margin</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.byDay.map(day => (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{day.date}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">{formatRupiah(day.sales)}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">{formatRupiah(day.cost)}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-green-600">{formatRupiah(day.profit)}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {((day.profit / day.sales) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">{day.transactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitReport;
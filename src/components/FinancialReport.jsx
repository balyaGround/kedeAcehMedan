// src/components/FinancialReport.jsx
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const FinancialReport = () => {
  const [period, setPeriod] = useState('daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalTransactions: 0,
    cashTotal: 0,
    transferTotal: 0,
    totalProfit: 0,
    averageTransaction: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Buat start date (00:00:00)
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      // Buat end date (23:59:59)
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      console.log('Fetching transactions from:', start.toISOString(), 'to:', end.toISOString());

      const q = query(
        collection(db, 'transactions'),
        where('timestamp', '>=', start),
        where('timestamp', '<=', end),
        where('type', '==', 'sale'),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      console.log('Found transactions:', snapshot.size);

      const transactions = [];
      let totalSales = 0;
      let cashTotal = 0;
      let transferTotal = 0;
      let totalProfit = 0;

      snapshot.forEach(doc => {
        const trans = doc.data();
        console.log('Transaction:', trans.id, trans.total, trans.timestamp?.toDate?.());
        
        transactions.push({
          id: doc.id,
          ...trans,
          date: trans.timestamp?.toDate?.() // Convert Timestamp ke Date
        });
        
        totalSales += trans.total || 0;
        cashTotal += trans.cash || 0;
        transferTotal += trans.transfer || 0;
        totalProfit += (trans.total || 0) * 0.2; // Estimasi profit 20%
      });

      setData(transactions);
      setSummary({
        totalSales,
        totalTransactions: transactions.length,
        cashTotal,
        transferTotal,
        totalProfit,
        averageTransaction: transactions.length > 0 ? totalSales / transactions.length : 0
      });
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Effect untuk daily period
  useEffect(() => {
    if (period === 'daily') {
      setEndDate(startDate);
    }
  }, [period, startDate]);

  // Effect untuk fetch data
  useEffect(() => {
    fetchData();
  }, [fetchData, period]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(t => ({
      'ID Transaksi': t.id?.substring(0, 8),
      'Tanggal': t.date?.toLocaleDateString('id-ID'),
      'Waktu': t.date?.toLocaleTimeString('id-ID'),
      'Kasir': t.kasir,
      'Jumlah Item': t.items?.length,
      'Total': t.total,
      'Tunai': t.cash,
      'Transfer': t.transfer,
      'Kembalian': t.change
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Keuangan');
    XLSX.writeFile(workbook, `laporan_keuangan_${startDate}_${endDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Laporan Keuangan KEDE ACEH', 14, 22);
    doc.setFontSize(11);
    doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 32);
    
    const tableData = data.map(t => [
      t.id?.substring(0, 8),
      t.date?.toLocaleDateString('id-ID'),
      t.kasir,
      t.items?.length,
      `Rp ${t.total?.toLocaleString('id-ID')}`,
      `Rp ${(t.cash || 0).toLocaleString('id-ID')}`,
      `Rp ${(t.transfer || 0).toLocaleString('id-ID')}`
    ]);

    doc.autoTable({
      startY: 40,
      head: [['ID', 'Tanggal', 'Kasir', 'Items', 'Total', 'Tunai', 'Transfer']],
      body: tableData,
    });

    doc.save(`laporan_keuangan_${startDate}_${endDate}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={period === 'daily'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
          <p className="text-sm opacity-90 mb-1">Total Penjualan</p>
          <p className="text-2xl font-bold">Rp {summary.totalSales.toLocaleString('id-ID')}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Total Transaksi</p>
          <p className="text-2xl font-bold">{summary.totalTransactions}</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Tunai</p>
          <p className="text-2xl font-bold">Rp {summary.cashTotal.toLocaleString('id-ID')}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Transfer</p>
          <p className="text-2xl font-bold">Rp {summary.transferTotal.toLocaleString('id-ID')}</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Estimasi Profit</p>
          <p className="text-2xl font-bold">Rp {summary.totalProfit.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Transactions Table */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Detail Transaksi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kasir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tunai</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transfer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kembalian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      Tidak ada transaksi untuk periode ini
                    </td>
                  </tr>
                ) : (
                  data.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{transaction.id?.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.date?.toLocaleDateString('id-ID')} {transaction.date?.toLocaleTimeString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.kasir}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.items?.length}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        Rp {transaction.total?.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Rp {transaction.cash?.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Rp {transaction.transfer?.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Rp {transaction.change?.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReport;
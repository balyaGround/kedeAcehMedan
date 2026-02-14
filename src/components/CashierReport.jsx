// src/components/CashierReport.jsx
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import * as XLSX from 'xlsx';

const CashierReport = () => {
  const [period, setPeriod] = useState('daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState({
    cashiers: [],
    transactions: [],
    summary: {
      totalCashiers: 0,
      totalTransactions: 0,
      totalSales: 0,
      averagePerCashier: 0,
      topCashier: null
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
        where('type', '==', 'sale'),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      
      const cashierMap = {};
      const transactions = [];

      snapshot.forEach(doc => {
        const trans = doc.data();
        const kasir = trans.kasir || 'Unknown';
        
        transactions.push({
          id: doc.id,
          ...trans,
          date: trans.timestamp?.toDate?.()
        });

        if (!cashierMap[kasir]) {
          cashierMap[kasir] = {
            name: kasir,
            transactions: 0,
            totalSales: 0,
            cashTotal: 0,
            transferTotal: 0,
            averageTransaction: 0,
            items: 0,
            firstTransaction: trans.timestamp?.toDate?.(),
            lastTransaction: trans.timestamp?.toDate?.()
          };
        }

        cashierMap[kasir].transactions++;
        cashierMap[kasir].totalSales += trans.total || 0;
        cashierMap[kasir].cashTotal += trans.cash || 0;
        cashierMap[kasir].transferTotal += trans.transfer || 0;
        cashierMap[kasir].items += trans.items?.length || 0;
        
        if (trans.timestamp?.toDate?.()) {
          if (!cashierMap[kasir].firstTransaction || 
              trans.timestamp.toDate() < cashierMap[kasir].firstTransaction) {
            cashierMap[kasir].firstTransaction = trans.timestamp.toDate();
          }
          if (!cashierMap[kasir].lastTransaction || 
              trans.timestamp.toDate() > cashierMap[kasir].lastTransaction) {
            cashierMap[kasir].lastTransaction = trans.timestamp.toDate();
          }
        }
      });

      // Hitung rata-rata
      Object.values(cashierMap).forEach(c => {
        c.averageTransaction = c.transactions > 0 ? c.totalSales / c.transactions : 0;
      });

      const cashiers = Object.values(cashierMap).sort((a, b) => b.totalSales - a.totalSales);
      const totalSales = cashiers.reduce((acc, c) => acc + c.totalSales, 0);
      const totalTransactions = cashiers.reduce((acc, c) => acc + c.transactions, 0);

      setData({
        cashiers,
        transactions,
        summary: {
          totalCashiers: cashiers.length,
          totalTransactions,
          totalSales,
          averagePerCashier: cashiers.length > 0 ? totalSales / cashiers.length : 0,
          topCashier: cashiers[0] || null
        }
      });
    } catch (error) {
      console.error("Error fetching cashier data:", error);
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

  const formatTime = (date) => {
    if (!date) return '-';
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Ringkasan Kasir
    const cashierData = [
      ['LAPORAN KINERJA KASIR'],
      [`Periode: ${startDate} s/d ${endDate}`],
      [],
      ['Nama Kasir', 'Transaksi', 'Total Penjualan', 'Rata-rata', 'Tunai', 'Transfer', 'Items', 'Jam Kerja'],
      ...data.cashiers.map(c => [
        c.name,
        c.transactions,
        c.totalSales,
        c.averageTransaction,
        c.cashTotal,
        c.transferTotal,
        c.items,
        c.firstTransaction && c.lastTransaction ? 
          `${formatTime(c.firstTransaction)} - ${formatTime(c.lastTransaction)}` : '-'
      ])
    ];
    const wsCashier = XLSX.utils.aoa_to_sheet(cashierData);
    XLSX.utils.book_append_sheet(wb, wsCashier, 'Kinerja Kasir');

    XLSX.writeFile(wb, `laporan_kasir_${startDate}_${endDate}.xlsx`);
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
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Total Kasir Aktif</p>
          <p className="text-3xl font-bold mt-2">{data.summary.totalCashiers}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Total Transaksi</p>
          <p className="text-3xl font-bold mt-2">{data.summary.totalTransactions}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Total Penjualan</p>
          <p className="text-2xl font-bold mt-2">{formatRupiah(data.summary.totalSales)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Rata-rata per Kasir</p>
          <p className="text-2xl font-bold mt-2">{formatRupiah(data.summary.averagePerCashier)}</p>
        </div>
      </div>

      {/* Top Cashier */}
      {data.summary.topCashier && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">🏆 Kasir Terbaik</p>
              <p className="text-3xl font-bold mt-2">{data.summary.topCashier.name}</p>
              <p className="mt-2">
                {data.summary.topCashier.transactions} transaksi · 
                {formatRupiah(data.summary.topCashier.totalSales)}
              </p>
            </div>
            <div className="text-6xl">👑</div>
          </div>
        </div>
      )}

      {/* Cashier Performance Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Kinerja Kasir</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kasir</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transaksi</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Penjualan</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rata-rata</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tunai</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transfer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jam Kerja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.cashiers.map((cashier, index) => (
                <tr key={cashier.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {index === 0 && <span className="text-yellow-500 mr-2">🥇</span>}
                      {index === 1 && <span className="text-gray-400 mr-2">🥈</span>}
                      {index === 2 && <span className="text-orange-500 mr-2">🥉</span>}
                      <span className="font-medium text-gray-900">{cashier.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{cashier.transactions}</td>
                  <td className="px-6 py-4 text-right font-medium text-green-600">{formatRupiah(cashier.totalSales)}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{formatRupiah(cashier.averageTransaction)}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{formatRupiah(cashier.cashTotal)}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{formatRupiah(cashier.transferTotal)}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{cashier.items}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    {cashier.firstTransaction && cashier.lastTransaction ? 
                      `${formatTime(cashier.firstTransaction)} - ${formatTime(cashier.lastTransaction)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Transaksi per Kasir */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Detail Transaksi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kasir</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Metode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.transactions.map(trans => (
                <tr key={trans.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    #{trans.id?.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {trans.date?.toLocaleDateString('id-ID')} {trans.date?.toLocaleTimeString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{trans.kasir}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">{trans.items?.length}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-green-600">
                    {formatRupiah(trans.total || 0)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {trans.cash > 0 && trans.transfer > 0 ? (
                      <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">Mixed</span>
                    ) : trans.cash > 0 ? (
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Tunai</span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Transfer</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashierReport;
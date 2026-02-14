// src/components/SalesTrendReport.jsx
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import * as XLSX from 'xlsx';

const SalesTrendReport = () => {
  const [period, setPeriod] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    yearly: [],
    summary: {
      totalYearSales: 0,
      averageMonthly: 0,
      bestMonth: null,
      growth: 0
    }
  });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const startOfYear = new Date(year, 0, 1);
      startOfYear.setHours(0, 0, 0, 0);
      const endOfYear = new Date(year, 11, 31);
      endOfYear.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, 'transactions'),
        where('timestamp', '>=', startOfYear),
        where('timestamp', '<=', endOfYear),
        where('type', '==', 'sale')
      );

      const snapshot = await getDocs(q);
      
      // Inisialisasi data per bulan
      const monthlyData = {};
      const dailyData = {};
      const weekdayData = {
        'Minggu': 0, 'Senin': 0, 'Selasa': 0, 'Rabu': 0, 'Kamis': 0, 'Jumat': 0, 'Sabtu': 0
      };

      for (let i = 0; i < 12; i++) {
        monthlyData[i] = {
          month: i,
          monthName: new Date(year, i, 1).toLocaleDateString('id-ID', { month: 'long' }),
          sales: 0,
          transactions: 0,
          items: 0
        };
      }

      let totalYearSales = 0;
      let totalTransactions = 0;

      snapshot.forEach(doc => {
        const trans = doc.data();
        const date = trans.timestamp?.toDate?.();
        
        if (date) {
          const month = date.getMonth();
          const day = date.toLocaleDateString('id-ID', { weekday: 'long' });
          const dateStr = date.toISOString().split('T')[0];
          
          // Monthly
          monthlyData[month].sales += trans.total || 0;
          monthlyData[month].transactions++;
          monthlyData[month].items += trans.items?.length || 0;
          
          // Daily
          if (!dailyData[dateStr]) {
            dailyData[dateStr] = {
              date: dateStr,
              sales: 0,
              transactions: 0
            };
          }
          dailyData[dateStr].sales += trans.total || 0;
          dailyData[dateStr].transactions++;
          
          // Weekday
          weekdayData[day] += trans.total || 0;
          
          totalYearSales += trans.total || 0;
          totalTransactions++;
        }
      });

      // Cari bulan terbaik
      const monthlyArray = Object.values(monthlyData);
      const bestMonth = monthlyArray.reduce((best, current) => 
        current.sales > best.sales ? current : best
      , monthlyArray[0]);

      // Hitung growth (bandingkan H1 vs H2)
      const firstHalf = monthlyArray.slice(0, 6).reduce((acc, m) => acc + m.sales, 0);
      const secondHalf = monthlyArray.slice(6).reduce((acc, m) => acc + m.sales, 0);
      const growth = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

      // Convert to array dan sort
      const dailyArray = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
      const weekdayArray = Object.entries(weekdayData).map(([day, sales]) => ({ day, sales }));

      setData({
        daily: dailyArray,
        monthly: monthlyArray,
        weekday: weekdayArray,
        summary: {
          totalYearSales,
          totalTransactions,
          averageMonthly: totalYearSales / 12,
          bestMonth,
          growth,
          bestDay: dailyArray.reduce((best, d) => d.sales > (best?.sales || 0) ? d : best, null),
          busiestWeekday: weekdayArray.reduce((best, d) => d.sales > (best?.sales || 0) ? d : best, null)
        }
      });
    } catch (error) {
      console.error("Error fetching sales trend:", error);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatRupiah = (angka) => {
    return `Rp ${angka.toLocaleString('id-ID')}`;
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tren Bulanan
    const monthlyData = [
      ['TREN PENJUALAN TAHUN ' + year],
      [],
      ['Bulan', 'Penjualan', 'Transaksi', 'Items Terjual', 'Rata-rata per Transaksi'],
      ...data.monthly.map(m => [
        m.monthName,
        m.sales,
        m.transactions,
        m.items,
        m.transactions > 0 ? m.sales / m.transactions : 0
      ])
    ];
    const wsMonthly = XLSX.utils.aoa_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(wb, wsMonthly, 'Tren Bulanan');

    XLSX.writeFile(wb, `tren_penjualan_${year}.xlsx`);
  };

  // Komponen grafik sederhana (bisa diganti dengan library chart seperti recharts)
  const SalesBarChart = ({ data }) => {
    const maxSales = Math.max(...data.map(d => d.sales));
    
    return (
      <div className="space-y-2">
        {data.map(item => (
          <div key={item.month} className="flex items-center">
            <span className="w-24 text-sm text-gray-600">{item.monthName}</span>
            <div className="flex-1 mx-4">
              <div className="relative h-10">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg opacity-75 transition-all duration-300"
                  style={{ width: `${(item.sales / maxSales) * 100}%` }}
                >
                  <div className="absolute inset-0 flex items-center px-3 text-white text-sm font-medium truncate">
                    {formatRupiah(item.sales)}
                  </div>
                </div>
              </div>
            </div>
            <span className="w-32 text-sm text-right text-gray-600">
              {item.transactions} trans
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex-1"></div>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Total Penjualan {year}</p>
          <p className="text-2xl font-bold mt-2">{formatRupiah(data.summary.totalYearSales)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Total Transaksi</p>
          <p className="text-3xl font-bold mt-2">{data.summary.totalTransactions}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Rata-rata Bulanan</p>
          <p className="text-xl font-bold mt-2">{formatRupiah(data.summary.averageMonthly)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Growth H1 ke H2</p>
          <p className={`text-2xl font-bold mt-2 ${data.summary.growth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {data.summary.growth >= 0 ? '+' : ''}{data.summary.growth.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Best Month Highlight */}
      {data.summary.bestMonth && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">🏆 Bulan Terbaik</p>
              <p className="text-3xl font-bold mt-2">{data.summary.bestMonth.monthName}</p>
              <p className="mt-2">
                {formatRupiah(data.summary.bestMonth.sales)} · 
                {data.summary.bestMonth.transactions} transaksi
              </p>
            </div>
            <div className="text-6xl">📈</div>
          </div>
        </div>
      )}

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Tren Penjualan Bulanan</h3>
        <SalesBarChart data={data.monthly} />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekday Analysis */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Analisis Hari</h3>
          <div className="space-y-3">
            {data.weekday?.map(day => (
              <div key={day.day} className="flex items-center">
                <span className="w-20 text-sm text-gray-600">{day.day}</span>
                <div className="flex-1 mx-4">
                  <div className="relative h-8">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-lg"
                      style={{ width: `${(day.sales / data.summary.totalYearSales) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="w-32 text-sm text-right text-gray-600">
                  {formatRupiah(day.sales)}
                </span>
              </div>
            ))}
          </div>
          {data.summary.busiestWeekday && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                <span className="font-bold">Hari tersibuk:</span> {data.summary.busiestWeekday.day}
              </p>
            </div>
          )}
        </div>

        {/* Quarterly Analysis */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Analisis Kuartal</h3>
          {[0, 3, 6, 9].map((start, idx) => {
            const quarterMonths = data.monthly.slice(start, start + 3);
            const quarterSales = quarterMonths.reduce((acc, m) => acc + m.sales, 0);
            const quarterTransactions = quarterMonths.reduce((acc, m) => acc + m.transactions, 0);
            
            return (
              <div key={idx} className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Kuartal {idx + 1}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-gray-500">Penjualan:</span>
                    <span className="ml-2 font-bold text-green-600">{formatRupiah(quarterSales)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Transaksi:</span>
                    <span className="ml-2 font-bold">{quarterTransactions}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best Day */}
      {data.summary.bestDay && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Hari dengan Penjualan Tertinggi</h3>
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <p className="text-xl font-bold text-gray-900">
                {new Date(data.summary.bestDay.date).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {data.summary.bestDay.transactions} transaksi
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {formatRupiah(data.summary.bestDay.sales)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTrendReport;
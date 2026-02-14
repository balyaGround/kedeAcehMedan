// src/components/PeakHoursReport.jsx
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

const PeakHoursReport = () => {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState({
    hourlyData: [],
    peakHours: [],
    summary: {
      totalTransactions: 0,
      busiestDay: '',
      busiestHour: '',
      averagePerHour: 0
    }
  });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else {
        startDate.setDate(endDate.getDate() - 30);
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, 'transactions'),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        where('type', '==', 'sale')
      );

      const snapshot = await getDocs(q);
      
      // Inisialisasi array untuk 24 jam
      const hourlyMap = {};
      const dayMap = {};
      
      for (let i = 0; i < 24; i++) {
        hourlyMap[i] = {
          hour: i,
          transactions: 0,
          totalSales: 0,
          averageValue: 0
        };
      }

      snapshot.forEach(doc => {
        const trans = doc.data();
        const date = trans.timestamp?.toDate?.();
        
        if (date) {
          const hour = date.getHours();
          const day = date.toLocaleDateString('id-ID', { weekday: 'long' });
          
          // Update hourly
          hourlyMap[hour].transactions++;
          hourlyMap[hour].totalSales += trans.total || 0;
          
          // Update daily
          if (!dayMap[day]) {
            dayMap[day] = {
              day,
              transactions: 0,
              totalSales: 0
            };
          }
          dayMap[day].transactions++;
          dayMap[day].totalSales += trans.total || 0;
        }
      });

      // Hitung rata-rata per jam
      Object.values(hourlyMap).forEach(h => {
        h.averageValue = h.transactions > 0 ? h.totalSales / h.transactions : 0;
      });

      // Convert to array dan sort
      const hourlyData = Object.values(hourlyMap);
      const peakHours = [...hourlyData].sort((a, b) => b.transactions - a.transactions).slice(0, 5);
      
      // Cari hari tersibuk
      const dayStats = Object.values(dayMap);
      const busiestDay = dayStats.sort((a, b) => b.transactions - a.transactions)[0];
      
      // Cari jam tersibuk
      const busiestHour = peakHours[0];

      const totalTransactions = snapshot.size;
      const averagePerHour = totalTransactions / 24;

      setData({
        hourlyData,
        peakHours,
        summary: {
          totalTransactions,
          busiestDay: busiestDay?.day || '-',
          busiestDayTransactions: busiestDay?.transactions || 0,
          busiestHour: busiestHour?.hour || 0,
          busiestHourTransactions: busiestHour?.transactions || 0,
          averagePerHour: Math.round(averagePerHour * 10) / 10
        }
      });
    } catch (error) {
      console.error("Error fetching peak hours data:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getHourLabel = (hour) => {
    if (hour === 0) return '00:00 - 01:00';
    if (hour === 23) return '23:00 - 00:00';
    return `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
  };

  const getPeakEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '📊';
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode Analisis</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
              <option value="3months">3 Bulan Terakhir</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Total Transaksi</p>
          <p className="text-3xl font-bold mt-2">{data.summary.totalTransactions}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Hari Tersibuk</p>
          <p className="text-2xl font-bold mt-2">{data.summary.busiestDay}</p>
          <p className="text-sm opacity-90 mt-1">{data.summary.busiestDayTransactions} transaksi</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Jam Tersibuk</p>
          <p className="text-2xl font-bold mt-2">{data.summary.busiestHour}:00</p>
          <p className="text-sm opacity-90 mt-1">{data.summary.busiestHourTransactions} transaksi</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Rata-rata per Jam</p>
          <p className="text-3xl font-bold mt-2">{data.summary.averagePerHour}</p>
        </div>
      </div>

      {/* Peak Hours Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Distribusi Transaksi per Jam</h3>
        <div className="space-y-3">
          {data.hourlyData.map(h => (
            <div key={h.hour} className="flex items-center">
              <span className="w-24 text-sm text-gray-600">{getHourLabel(h.hour)}</span>
              <div className="flex-1 mx-4">
                <div className="relative h-8">
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-lg opacity-75 transition-all duration-300"
                    style={{ 
                      width: `${(h.transactions / Math.max(...data.hourlyData.map(d => d.transactions), 1)) * 100}%`,
                      minWidth: '4px'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center px-3 text-white text-sm font-medium truncate">
                      {h.transactions} transaksi
                    </div>
                  </div>
                </div>
              </div>
              <span className="w-32 text-sm text-right text-gray-600">
                Rp {h.totalSales.toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 Jam Sibuk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Top 5 Jam Sibuk</h3>
          <div className="space-y-4">
            {data.peakHours.map((hour, index) => (
              <div key={hour.hour} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl mr-3">{getPeakEmoji(index)}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{getHourLabel(hour.hour)}</p>
                  <p className="text-sm text-gray-500">{hour.transactions} transaksi</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">Rp {hour.totalSales.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-gray-500">rata-rata Rp {Math.round(hour.averageValue).toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rekomendasi */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Rekomendasi</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="font-medium text-blue-800">🕐 Siapkan Staf Tambahan</p>
              <p className="text-sm text-blue-600 mt-1">
                Pada jam {data.summary.busiestHour}:00 terjadi lonjakan transaksi. 
                Siapkan minimal 2 kasir pada jam tersebut.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="font-medium text-green-800">📦 Stock Up Barang Populer</p>
              <p className="text-sm text-green-600 mt-1">
                Hari {data.summary.busiestDay} adalah hari tersibuk. 
                Pastikan stok barang populer mencukupi.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="font-medium text-yellow-800">⚡ Promosi Jam Sepi</p>
              <p className="text-sm text-yellow-600 mt-1">
                Buat promo khusus di jam-jam sepi untuk meningkatkan transaksi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeakHoursReport;
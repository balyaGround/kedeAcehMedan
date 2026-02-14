// pages/Owner.jsx
import { useState } from 'react';
import ProductManagement from '../components/ProductManagement';
import DailyReport from '../components/DailyReport';
import InventoryReport from '../components/InventoryReport';
import DashboardStats from '../components/DashboardStats';
import FinancialReport from '../components/FinancialReport';
import StockManagement from '../components/StockManagement';
import ProfitReport from '../components/ProfitReport';
import CashierReport from '../components/CashierReport';
import CategoryReport from '../components/CategoryReport';
import SupplierReport from '../components/SupplierReport';
import PeakHoursReport from '../components/PeakHoursReport';
import SalesTrendReport from '../components/SalesTrendReport';

const Owner = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Manajemen Barang', icon: '📦' },
    { id: 'stock', label: 'Manajemen Stok', icon: '📈' },
    { id: 'financial', label: 'Laporan Keuangan', icon: '💰' },
    { id: 'daily', label: 'Laporan Harian', icon: '📅' },
    { id: 'inventory', label: 'Laporan Stok', icon: '📋' },
    { id: 'reports', label: 'Laporan Lainnya', icon: '📑' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">KEDE ACEH</h1>
              <p className="text-sm opacity-90">Owner Dashboard - Grosiran Medan</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm">{user.displayName || user.email}</p>
                <p className="text-xs opacity-75">
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-2 flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <>
            <div className="mb-6">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <DashboardStats date={date} />
          </>
        )}

        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'stock' && <StockManagement />}
        {activeTab === 'financial' && <FinancialReport />}
        {activeTab === 'daily' && <DailyReport />}
        {activeTab === 'inventory' && <InventoryReport />}
        
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Laporan Profit */}
            <div 
              onClick={() => setActiveTab('profit')}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 hover:scale-[1.02]"
            >
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-bold text-gray-900">Laporan Profit</h3>
              <p className="text-sm text-gray-500 mt-1">Lihat laporan laba rugi</p>
              <div className="mt-4 text-blue-600 text-sm font-medium flex items-center">
                Lihat Detail <span className="ml-1">→</span>
              </div>
            </div>
            
            {/* Laporan Kasir */}
            <div 
              onClick={() => setActiveTab('cashier')}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 hover:scale-[1.02]"
            >
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-bold text-gray-900">Laporan Kasir</h3>
              <p className="text-sm text-gray-500 mt-1">Kinerja dan transaksi per kasir</p>
              <div className="mt-4 text-blue-600 text-sm font-medium flex items-center">
                Lihat Detail <span className="ml-1">→</span>
              </div>
            </div>
            
            {/* Laporan per Kategori */}
            <div 
              onClick={() => setActiveTab('category')}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 hover:scale-[1.02]"
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-bold text-gray-900">Laporan per Kategori</h3>
              <p className="text-sm text-gray-500 mt-1">Penjualan berdasarkan kategori</p>
              <div className="mt-4 text-blue-600 text-sm font-medium flex items-center">
                Lihat Detail <span className="ml-1">→</span>
              </div>
            </div>
            
            {/* Laporan Supplier */}
            <div 
              onClick={() => setActiveTab('supplier')}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 hover:scale-[1.02]"
            >
              <div className="text-4xl mb-4">🏭</div>
              <h3 className="text-lg font-bold text-gray-900">Laporan Supplier</h3>
              <p className="text-sm text-gray-500 mt-1">Data pembelian dari supplier</p>
              <div className="mt-4 text-blue-600 text-sm font-medium flex items-center">
                Lihat Detail <span className="ml-1">→</span>
              </div>
            </div>
            
            {/* Jam Sibuk */}
            <div 
              onClick={() => setActiveTab('peakhours')}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 hover:scale-[1.02]"
            >
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-lg font-bold text-gray-900">Jam Sibuk</h3>
              <p className="text-sm text-gray-500 mt-1">Analisis waktu transaksi terbanyak</p>
              <div className="mt-4 text-blue-600 text-sm font-medium flex items-center">
                Lihat Detail <span className="ml-1">→</span>
              </div>
            </div>
            
            {/* Tren Penjualan */}
            <div 
              onClick={() => setActiveTab('salestrend')}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 hover:scale-[1.02]"
            >
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-lg font-bold text-gray-900">Tren Penjualan</h3>
              <p className="text-sm text-gray-500 mt-1">Grafik pertumbuhan bulanan</p>
              <div className="mt-4 text-blue-600 text-sm font-medium flex items-center">
                Lihat Detail <span className="ml-1">→</span>
              </div>
            </div>
          </div>
        )}

        {/* Halaman-halaman baru - INI YANG DIPINDAHKAN KE LUAR */}
        {activeTab === 'profit' && <ProfitReport />}
        {activeTab === 'cashier' && <CashierReport />}
        {activeTab === 'category' && <CategoryReport />}
        {activeTab === 'supplier' && <SupplierReport />}
        {activeTab === 'peakhours' && <PeakHoursReport />}
        {activeTab === 'salestrend' && <SalesTrendReport />}
      </main>
    </div>
  );
};

export default Owner;
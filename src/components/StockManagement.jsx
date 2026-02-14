// src/components/StockManagement.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('semua');
  const [stockStatus, setStockStatus] = useState('semua');
  const [sortBy, setSortBy] = useState('name');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'add',
    quantity: 0,
    note: ''
  });

  const fetchProducts = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category !== 'semua') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (stockStatus === 'critical') {
      filtered = filtered.filter(p => p.stock <= (p.minStock || 10));
    } else if (stockStatus === 'low') {
      filtered = filtered.filter(p => p.stock > (p.minStock || 10) && p.stock <= (p.minStock || 10) * 2);
    } else if (stockStatus === 'good') {
      filtered = filtered.filter(p => p.stock > (p.minStock || 10) * 2);
    } else if (stockStatus === 'out') {
      filtered = filtered.filter(p => p.stock === 0);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'stock') return (a.stock || 0) - (b.stock || 0);
      if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
      return 0;
    });

    return filtered;
  }, [products, searchTerm, category, stockStatus, sortBy]);

  const handleStockAdjustment = async () => {
    if (!selectedProduct) return;

    try {
      const productRef = doc(db, 'products', selectedProduct.id);
      const newStock = stockAdjustment.type === 'add' 
        ? selectedProduct.stock + stockAdjustment.quantity
        : selectedProduct.stock - stockAdjustment.quantity;

      if (newStock < 0) {
        alert('Stok tidak boleh negatif!');
        return;
      }

      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: new Date()
      });

      await addDoc(collection(db, 'stock_history'), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        oldStock: selectedProduct.stock,
        newStock: newStock,
        adjustment: stockAdjustment.quantity,
        type: stockAdjustment.type,
        note: stockAdjustment.note,
        timestamp: new Date(),
        user: 'Owner'
      });

      alert('Stok berhasil disesuaikan!');
      setSelectedProduct(null);
      setStockAdjustment({ type: 'add', quantity: 0, note: '' });
      fetchProducts();
    } catch (error) {
      console.error("Error adjusting stock:", error);
      alert('Gagal menyesuaikan stok!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Cari nama/kode barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua Kategori</option>
              <option value="makanan">Makanan</option>
              <option value="minuman">Minuman</option>
              <option value="rokok">Rokok</option>
              <option value="gas">Gas</option>
              <option value="minyak">Minyak</option>
              <option value="sembako">Sembako</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          
          <div>
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua Stok</option>
              <option value="critical">Kritis (≤ Min)</option>
              <option value="low">Menipis</option>
              <option value="good">Aman</option>
              <option value="out">Habis</option>
            </select>
          </div>
          
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Urut: Nama</option>
              <option value="stock">Urut: Stok</option>
              <option value="price">Urut: Harga</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Produk</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Stok</p>
          <p className="text-2xl font-bold text-gray-900">
            {products.reduce((acc, p) => acc + (p.stock || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Stok Kritis</p>
          <p className="text-2xl font-bold text-red-600">
            {products.filter(p => p.stock <= (p.minStock || 10)).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Nilai Stok</p>
          <p className="text-2xl font-bold text-green-600">
            Rp {products.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0).toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Manajemen Stok</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(product => {
                const status = product.stock === 0 ? 'Habis' :
                              product.stock <= (product.minStock || 10) ? 'Kritis' :
                              product.stock <= (product.minStock || 10) * 2 ? 'Menipis' : 'Aman';
                
                const statusColor = product.stock === 0 ? 'bg-red-100 text-red-800' :
                                   product.stock <= (product.minStock || 10) ? 'bg-red-50 text-red-700' :
                                   product.stock <= (product.minStock || 10) * 2 ? 'bg-yellow-100 text-yellow-800' :
                                   'bg-green-100 text-green-800';

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className={product.stock <= (product.minStock || 10) ? 'text-red-600' : 'text-gray-900'}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.minStock || 10}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Rp {product.price?.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Atur Stok
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Sesuaikan Stok</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedProduct.name}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Stok Saat Ini</p>
                <p className="text-2xl font-bold text-gray-900">{selectedProduct.stock} {selectedProduct.unit}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Penyesuaian</label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setStockAdjustment({...stockAdjustment, type: 'add'})}
                    className={`flex-1 py-2 rounded-lg border ${
                      stockAdjustment.type === 'add' 
                        ? 'bg-green-500 text-white border-green-500' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    + Tambah
                  </button>
                  <button
                    onClick={() => setStockAdjustment({...stockAdjustment, type: 'remove'})}
                    className={`flex-1 py-2 rounded-lg border ${
                      stockAdjustment.type === 'remove' 
                        ? 'bg-red-500 text-white border-red-500' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    - Kurangi
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                <input
                  type="number"
                  min="0"
                  value={stockAdjustment.quantity}
                  onChange={(e) => setStockAdjustment({...stockAdjustment, quantity: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={stockAdjustment.note}
                  onChange={(e) => setStockAdjustment({...stockAdjustment, note: e.target.value})}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Restock dari supplier, barang rusak, dll"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  Stok setelah penyesuaian: <span className="font-bold">
                    {stockAdjustment.type === 'add' 
                      ? selectedProduct.stock + stockAdjustment.quantity
                      : selectedProduct.stock - stockAdjustment.quantity
                    } {selectedProduct.unit}
                  </span>
                </p>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex space-x-3">
              <button
                onClick={handleStockAdjustment}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Simpan
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
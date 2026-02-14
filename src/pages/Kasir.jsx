// src/pages/Kasir.jsx
import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import KasirCart from '../components/KasirCart';
import ProductGrid from '../components/ProductGrid';
import ReceiptModal from '../components/ReceiptModal';

const Kasir = ({ user, onLogout }) => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [payment, setPayment] = useState({
    cash: 0,
    transfer: 0,
    total: 0,
    change: 0
  });

  const fetchProducts = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products: ", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    const categoriesList = [
      'semua', 'makanan', 'minuman', 'rokok', 'gas', 'minyak', 'sembako', 'lainnya'
    ];
    setCategories(categoriesList);
  }, [fetchProducts]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePayment = async () => {
    const total = calculateTotal();
    const change = (payment.cash + payment.transfer) - total;
    
    if (change < 0) {
      alert('Pembayaran kurang!');
      return;
    }

    const transactionData = {
      items: cart,
      total,
      cash: payment.cash,
      transfer: payment.transfer,
      change,
      timestamp: serverTimestamp(),
      kasir: user.displayName || user.email,
      type: 'sale'
    };

    try {
      // Save transaction
      const docRef = await addDoc(collection(db, 'transactions'), transactionData);
      
      // Update stock
      for (const item of cart) {
        const productRef = doc(db, 'products', item.id);
        await updateDoc(productRef, {
          stock: item.stock - item.quantity
        });
      }

      setLastTransaction({ id: docRef.id, ...transactionData });
      setShowReceipt(true);
      
      // Reset
      setCart([]);
      setPayment({ cash: 0, transfer: 0, total: 0, change: 0 });
      
      // Refresh products
      fetchProducts();
      
    } catch (error) {
      console.error("Error saving transaction: ", error);
      alert('Gagal menyimpan transaksi!');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'semua' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && product.stock > 0;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-lg">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">KEDE ACEH</h1>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
          <div className="mt-4">
            <p className="text-gray-600">Kasir: {user.displayName || user.email}</p>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('id-ID')}</p>
          </div>
        </div>

        <KasirCart 
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onPayment={handlePayment}
          payment={payment}
          setPayment={setPayment}
          total={calculateTotal()}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Category Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg capitalize ${selectedCategory === category 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Cari barang..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Products Grid */}
        <ProductGrid 
          products={filteredProducts}
          onAddToCart={addToCart}
        />
      </div>

      {showReceipt && lastTransaction && (
        <ReceiptModal
          transaction={lastTransaction}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};

export default Kasir;
// components/KasirCart.jsx


const KasirCart = ({ cart, onUpdateQuantity, onRemoveItem, onPayment, payment, setPayment, total }) => {
  const calculateChange = () => {
    return (payment.cash + payment.transfer) - total;
  };

  const handlePaymentChange = (type, value) => {
    const numValue = parseFloat(value) || 0;
    setPayment(prev => ({
      ...prev,
      [type]: numValue
    }));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Keranjang</h2>
      
      {/* Cart Items */}
      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Keranjang kosong</p>
            <p className="text-sm">Tambahkan barang dari daftar produk</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    Rp {item.price.toLocaleString('id-ID')} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200 ml-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Total</span>
          <span className="text-2xl font-bold text-gray-900">
            Rp {total.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Payment Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tunai</label>
          <input
            type="number"
            value={payment.cash || ''}
            onChange={(e) => handlePaymentChange('cash', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transfer</label>
          <input
            type="number"
            value={payment.transfer || ''}
            onChange={(e) => handlePaymentChange('transfer', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        {/* Change */}
        {total > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Kembalian</span>
              <span className={`text-lg font-bold ${calculateChange() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rp {Math.abs(calculateChange()).toLocaleString('id-ID')}
                {calculateChange() < 0 && ' (Kurang)'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        {cart.length > 0 && (
          <button
            onClick={() => {
              if (cart.length === 0) return;
              onPayment();
            }}
            disabled={calculateChange() < 0}
            className={`w-full py-3 rounded-lg font-bold ${calculateChange() >= 0 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            BAYAR
          </button>
        )}
        
        <button
          onClick={() => {
            if (cart.length === 0) return;
            if (window.confirm('Kosongkan keranjang?')) {
              // Clear cart by removing all items
              cart.forEach(item => onRemoveItem(item.id));
            }
          }}
          disabled={cart.length === 0}
          className={`w-full py-2 rounded-lg ${cart.length > 0 
            ? 'bg-red-100 hover:bg-red-200 text-red-700' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          Kosongkan Keranjang
        </button>
      </div>
    </div>
  );
};

export default KasirCart;
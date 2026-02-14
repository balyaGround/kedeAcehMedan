// components/ProductGrid.jsx


const ProductGrid = ({ products, onAddToCart }) => {
  const getCategoryColor = (category) => {
    const colors = {
      makanan: 'bg-orange-100 text-orange-800',
      minuman: 'bg-blue-100 text-blue-800',
      rokok: 'bg-red-100 text-red-800',
      gas: 'bg-purple-100 text-purple-800',
      minyak: 'bg-yellow-100 text-yellow-800',
      sembako: 'bg-green-100 text-green-800',
      lainnya: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.lainnya;
  };

  const getStockColor = (stock, minStock) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock <= minStock) return 'bg-red-50 text-red-700';
    if (stock <= minStock * 2) return 'bg-yellow-50 text-yellow-700';
    return 'bg-green-50 text-green-700';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">Tidak ada produk ditemukan</p>
        </div>
      ) : (
        products.map(product => (
          <div
            key={product.id}
            onClick={() => onAddToCart(product)}
            className="product-card bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
          >
            {/* Stock Indicator */}
            <div className="relative">
              {product.stock === 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  HABIS
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(product.category)}`}>
                    {product.category}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getStockColor(product.stock, product.minStock || 10)}`}>
                  Stok: {product.stock}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">Kode: {product.code}</p>

              {/* Price */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500">/ {product.unit}</p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  disabled={product.stock === 0}
                  className={`p-2 rounded-lg ${product.stock === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>

              {/* Supplier Info */}
              {product.supplier && (
                <p className="text-xs text-gray-500 mt-2">Supplier: {product.supplier}</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProductGrid;
// src/components/ReceiptModal.jsx
import React, { useEffect, useRef } from 'react';

const ReceiptModal = ({ transaction, onClose }) => {
  const modalRef = useRef(null);
  const printContentRef = useRef(null);

  useEffect(() => {
    // Prevent scrolling on body when modal is open
    document.body.style.overflow = 'hidden';
    
    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const formatDate = (timestamp) => {
    if (!timestamp) return new Date().toLocaleString('id-ID');
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocker mencegah pencetakan. Izinkan popup untuk website ini.');
      return;
    }

    const receiptContent = printContentRef.current.innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Pembayaran - KEDE ACEH</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 20px;
              width: 80mm;
              margin: 0 auto;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #000;
            }
            .receipt-header h1 {
              font-size: 18px;
              margin: 0;
              font-weight: bold;
            }
            .receipt-header p {
              margin: 5px 0;
              font-size: 12px;
            }
            .receipt-info {
              margin-bottom: 15px;
              font-size: 12px;
            }
            .receipt-items {
              margin-bottom: 15px;
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 10px 0;
            }
            .receipt-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 12px;
            }
            .receipt-total {
              margin-top: 10px;
              font-size: 14px;
              font-weight: bold;
            }
            .receipt-footer {
              text-align: center;
              margin-top: 20px;
              font-size: 11px;
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
            .text-right {
              text-align: right;
            }
            .flex {
              display: flex;
            }
            .justify-between {
              justify-content: space-between;
            }
            .mb-2 {
              margin-bottom: 5px;
            }
            .mt-4 {
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Print after content is loaded
    printWindow.onload = function() {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Struk Pembayaran</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm opacity-90 mt-1">Transaksi #{transaction.id?.substring(0, 8).toUpperCase()}</p>
        </div>

        {/* Receipt Content - Scrollable */}
        <div className="overflow-y-auto max-h-[60vh] p-6">
          <div ref={printContentRef}>
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">KEDE ACEH</h1>
              <p className="text-sm text-gray-600">Grosiran Medan</p>
              <p className="text-xs text-gray-500">Jl. Contoh No. 123, Medan</p>
              <p className="text-xs text-gray-500">Telp: 061-1234567</p>
            </div>

            <div className="border-t border-b border-gray-300 py-3 my-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">No. Transaksi</span>
                <span className="font-medium">{transaction.id?.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Tanggal</span>
                <span className="font-medium">{formatDate(transaction.timestamp)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kasir</span>
                <span className="font-medium">{transaction.kasir || 'N/A'}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="mb-4">
              <div className="grid grid-cols-12 text-xs font-bold text-gray-600 mb-2 pb-1 border-b">
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Harga</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              
              {transaction.items?.map((item, index) => (
                <div key={index} className="grid grid-cols-12 text-sm mb-2 py-1 border-b border-gray-100">
                  <div className="col-span-6">
                    <p className="font-medium truncate" title={item.name}>{item.name}</p>
                    <p className="text-xs text-gray-500">{item.code}</p>
                  </div>
                  <div className="col-span-2 text-center">{item.quantity}</div>
                  <div className="col-span-2 text-right">
                    Rp {item.price.toLocaleString('id-ID')}
                  </div>
                  <div className="col-span-2 text-right font-medium">
                    Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rp {transaction.total.toLocaleString('id-ID')}</span>
                </div>
                
                {transaction.cash > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tunai</span>
                    <span>Rp {transaction.cash.toLocaleString('id-ID')}</span>
                  </div>
                )}
                
                {transaction.transfer > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transfer</span>
                    <span>Rp {transaction.transfer.toLocaleString('id-ID')}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-300">
                  <span>Kembalian</span>
                  <span className="text-green-600">
                    Rp {transaction.change.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center text-gray-500 text-xs space-y-1">
              <p>Terima kasih telah berbelanja</p>
              <p>di KEDE ACEH</p>
              <p className="text-gray-400">Barang yang sudah dibeli</p>
              <p className="text-gray-400">tidak dapat ditukar/dikembalikan</p>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={printReceipt}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Cetak Struk</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Tutup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
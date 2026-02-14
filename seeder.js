// seeder.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://login-suti-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.firestore();

// Data dummy produk
const dummyProducts = [
  // Makanan
  { 
    code: "MAK001", 
    name: "Indomie Goreng", 
    category: "makanan", 
    price: 3500, 
    stock: 50, 
    unit: "pcs", 
    purchasePrice: 2800, 
    minStock: 10, 
    supplier: "PT Indofood",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    code: "MAK002", 
    name: "Roti Aoka", 
    category: "makanan", 
    price: 5500, 
    stock: 30, 
    unit: "pcs", 
    purchasePrice: 4500, 
    minStock: 10, 
    supplier: "Aoka Bakery",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    code: "MAK003", 
    name: "Chitato", 
    category: "makanan", 
    price: 12500, 
    stock: 20, 
    unit: "pack", 
    purchasePrice: 10500, 
    minStock: 5, 
    supplier: "PT Indofood",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    code: "MAK004", 
    name: "Oreo", 
    category: "makanan", 
    price: 11000, 
    stock: 25, 
    unit: "pack", 
    purchasePrice: 9000, 
    minStock: 5, 
    supplier: "Mondelez",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Minuman
  { 
    code: "MIN001", 
    name: "Aqua 600ml", 
    category: "minuman", 
    price: 4500, 
    stock: 100, 
    unit: "pcs", 
    purchasePrice: 3500, 
    minStock: 20, 
    supplier: "Danone",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    code: "MIN002", 
    name: "Coca Cola 1.5L", 
    category: "minuman", 
    price: 16000, 
    stock: 30, 
    unit: "pcs", 
    purchasePrice: 13000, 
    minStock: 10, 
    supplier: "Coca Cola",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    code: "MIN003", 
    name: "Teh Botol Sosro", 
    category: "minuman", 
    price: 5500, 
    stock: 40, 
    unit: "pcs", 
    purchasePrice: 4500, 
    minStock: 15, 
    supplier: "Sosro",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    code: "MIN004", 
    name: "Kopi Kapal Api", 
    category: "minuman", 
    price: 2500, 
    stock: 60, 
    unit: "sachet", 
    purchasePrice: 2000, 
    minStock: 20, 
    supplier: "Kapal Api",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Rokok
  { 
    code: "ROK001", 
    name: "Sampoerna Mild", 
    category: "rokok", 
    price: 32000, 
    stock: 25, 
    unit: "pack", 
    purchasePrice: 29500, 
    minStock: 10, 
    supplier: "HM Sampoerna",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    code: "ROK002", 
    name: "Marlboro Red", 
    category: "rokok", 
    price: 36000, 
    stock: 20, 
    unit: "pack", 
    purchasePrice: 33000, 
    minStock: 10, 
    supplier: "Philip Morris",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    code: "ROK003", 
    name: "Dji Sam Soe", 
    category: "rokok", 
    price: 27000, 
    stock: 15, 
    unit: "pack", 
    purchasePrice: 25000, 
    minStock: 5, 
    supplier: "Gudang Garam",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    code: "ROK004", 
    name: "LA Bold", 
    category: "rokok", 
    price: 21000, 
    stock: 30, 
    unit: "pack", 
    purchasePrice: 19000, 
    minStock: 10, 
    supplier: "Bentoel",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Gas
  { 
    code: "GAS001", 
    name: "Gas 3kg Bright", 
    category: "gas", 
    price: 27000, 
    stock: 10, 
    unit: "tabung", 
    purchasePrice: 24000, 
    minStock: 3, 
    supplier: "Bright Gas",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    code: "GAS002", 
    name: "Gas 12kg", 
    category: "gas", 
    price: 155000, 
    stock: 5, 
    unit: "tabung", 
    purchasePrice: 145000, 
    minStock: 2, 
    supplier: "Bright Gas",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Minyak
  { 
    code: "MNY001", 
    name: "Minyak Bimoli 1L", 
    category: "minyak", 
    price: 22000, 
    stock: 20, 
    unit: "pcs", 
    purchasePrice: 19500, 
    minStock: 5, 
    supplier: "Sinar Mas",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    code: "MNY002", 
    name: "Minyak Sunco 2L", 
    category: "minyak", 
    price: 38000, 
    stock: 15, 
    unit: "pcs", 
    purchasePrice: 34000, 
    minStock: 5, 
    supplier: "Wings",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Sembako
  { 
    code: "SEM001", 
    name: "Beras Rojolele 5kg", 
    category: "sembako", 
    price: 75000, 
    stock: 10, 
    unit: "pack", 
    purchasePrice: 68000, 
    minStock: 3, 
    supplier: "Beras Sejahtera",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    code: "SEM002", 
    name: "Gula Pasir 1kg", 
    category: "sembako", 
    price: 16000, 
    stock: 25, 
    unit: "pack", 
    purchasePrice: 14000, 
    minStock: 5, 
    supplier: "Gula Makmur",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    code: "SEM003", 
    name: "Micin Sasa", 
    category: "sembako", 
    price: 3500, 
    stock: 40, 
    unit: "pcs", 
    purchasePrice: 2800, 
    minStock: 10, 
    supplier: "Sasa",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Lainnya
  { 
    code: "LAI001", 
    name: "Baterai ABC", 
    category: "lainnya", 
    price: 12000, 
    stock: 30, 
    unit: "pcs", 
    purchasePrice: 9000, 
    minStock: 10, 
    supplier: "ABC Battery",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    code: "LAI002", 
    name: "Sabun Lifebuoy", 
    category: "lainnya", 
    price: 5500, 
    stock: 25, 
    unit: "pcs", 
    purchasePrice: 4500, 
    minStock: 10, 
    supplier: "Unilever",
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

// Data dummy users
const dummyUsers = [
  {
    email: "owner@kedeaceh.com",
    role: "owner",
    displayName: "Pemilik Kede Aceh",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: "kasir@kedeaceh.com",
    role: "kasir",
    displayName: "Kasir 1",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: "kasir2@kedeaceh.com",
    role: "kasir",
    displayName: "Kasir 2",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Data dummy transactions (untuk testing)
const dummyTransactions = [
  {
    items: [
      { code: "MAK001", name: "Indomie Goreng", price: 3500, quantity: 2, unit: "pcs" },
      { code: "MIN001", name: "Aqua 600ml", price: 4500, quantity: 1, unit: "pcs" }
    ],
    total: 11500,
    cash: 20000,
    transfer: 0,
    change: 8500,
    kasir: "kasir@kedeaceh.com",
    type: "sale",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // Kemarin
  },
  {
    items: [
      { code: "ROK001", name: "Sampoerna Mild", price: 32000, quantity: 1, unit: "pack" },
      { code: "MIN002", name: "Coca Cola 1.5L", price: 16000, quantity: 1, unit: "pcs" }
    ],
    total: 48000,
    cash: 0,
    transfer: 50000,
    change: 2000,
    kasir: "kasir2@kedeaceh.com",
    type: "sale",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 jam lalu
  },
  {
    items: [
      { code: "GAS001", name: "Gas 3kg Bright", price: 27000, quantity: 1, unit: "tabung" },
      { code: "SEM002", name: "Gula Pasir 1kg", price: 16000, quantity: 2, unit: "pack" }
    ],
    total: 59000,
    cash: 60000,
    transfer: 0,
    change: 1000,
    kasir: "kasir@kedeaceh.com",
    type: "sale",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 jam lalu
  }
];

async function seedDatabase() {
  try {
    console.log('🚀 Mulai seeding database...\n');

    // 1. Seed Users
    console.log('📝 Menambahkan users...');
    for (const user of dummyUsers) {
      await db.collection('users').doc(user.email.replace('@', '_at_')).set(user);
      console.log(`✓ User ${user.email} ditambahkan`);
    }
    console.log('✅ Users berhasil ditambahkan\n');

    // 2. Seed Products
    console.log('📦 Menambahkan produk...');
    for (const product of dummyProducts) {
      const productRef = await db.collection('products').add(product);
      console.log(`✓ Produk ${product.code} - ${product.name} ditambahkan (ID: ${productRef.id})`);
    }
    console.log('✅ Produk berhasil ditambahkan\n');

    // 3. Seed Transactions
    console.log('💰 Menambahkan transaksi...');
    for (const transaction of dummyTransactions) {
      const transactionRef = await db.collection('transactions').add(transaction);
      console.log(`✓ Transaksi ${transactionRef.id} ditambahkan (Total: Rp ${transaction.total.toLocaleString('id-ID')})`);
    }
    console.log('✅ Transaksi berhasil ditambahkan\n');

    // 4. Tambahkan daily closing
    console.log('📊 Menambahkan daily closing...');
    const dailyClosing = {
      date: new Date().toISOString().split('T')[0],
      totalSales: 118500, // Total dari 3 transaksi
      totalTransactions: 3,
      cashTotal: 80000,
      transferTotal: 50000,
      closedBy: "owner@kedeaceh.com",
      closedAt: new Date()
    };
    
    await db.collection('daily_closings').add(dailyClosing);
    console.log('✅ Daily closing berhasil ditambahkan\n');

    console.log('🎉 SEEDING SELESAI!');
    console.log('\n📊 Data yang telah ditambahkan:');
    console.log(`   - ${dummyUsers.length} users`);
    console.log(`   - ${dummyProducts.length} produk`);
    console.log(`   - ${dummyTransactions.length} transaksi`);
    console.log(`   - 1 daily closing`);
    
    console.log('\n🔑 Login credentials:');
    console.log('   Owner: owner@kedeaceh.com / owner123');
    console.log('   Kasir: kasir@kedeaceh.com / kasir123');
    console.log('   Kasir 2: kasir2@kedeaceh.com / kasir123');
    
    console.log('\n📱 Akses aplikasi di: http://localhost:3000');

  } catch (error) {
    console.error('❌ Error saat seeding:', error);
  } finally {
    process.exit(0);
  }
}

// Jalankan seeding
seedDatabase();
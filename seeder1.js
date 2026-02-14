// seeder.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://login-suti-default-rtdb.asia-southeast1.firebasedatabase.app"
});


const db = admin.firestore();

// Data dummy products (24 produk)
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
    soldCount: 14, // Dari transaksi: 3+5+6 = 14
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 7, // Dari transaksi: 2+3+2 = 7
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 5, // Dari transaksi: 1+2+2 = 5
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 2,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  { 
    code: "MAK005", 
    name: "Beng Beng", 
    category: "makanan", 
    price: 2500, 
    stock: 45, 
    unit: "pcs", 
    purchasePrice: 2000, 
    minStock: 15, 
    supplier: "Mayora",
    soldCount: 6,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 12, // 2+3+4+3 = 12
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 4, // 2+1+1 = 4
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 10, // 4+3+3 = 10
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 13, // 5+8 = 13
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  { 
    code: "MIN005", 
    name: "Pocari Sweat 500ml", 
    category: "minuman", 
    price: 8000, 
    stock: 25, 
    unit: "pcs", 
    purchasePrice: 6500, 
    minStock: 8, 
    supplier: "Otsuka",
    soldCount: 6, // 4+2 = 6
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 3, // 1+1+1 = 3
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 4, // 1+2+1 = 4
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 2,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 1,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 3, // 2+1 = 3
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 1,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 6, // 2+2+3 = 6
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 1,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 3, // 1+2 = 3
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 7, // 3+2+2 = 7
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 6, // 3+3 = 6
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  { 
    code: "SEM004", 
    name: "Telur 1kg", 
    category: "sembako", 
    price: 28000, 
    stock: 15, 
    unit: "kg", 
    purchasePrice: 25000, 
    minStock: 5, 
    supplier: "Peternak Lokal",
    soldCount: 2,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 3,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    soldCount: 4, // 2+2 = 4
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  { 
    code: "LAI003", 
    name: "Shampo Sunsilk", 
    category: "lainnya", 
    price: 15000, 
    stock: 20, 
    unit: "pcs", 
    purchasePrice: 12000, 
    minStock: 5, 
    supplier: "Unilever",
    soldCount: 2,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
];
// Data dummy users
const dummyUsers = [
  {
    email: "owner@kedeaceh.com",
    role: "owner",
    displayName: "Pemilik Kede Aceh",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    email: "kasir@kedeaceh.com",
    role: "kasir",
    displayName: "Kasir 1 (Budi)",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    email: "kasir2@kedeaceh.com",
    role: "kasir",
    displayName: "Kasir 2 (Ani)",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    email: "kasir3@kedeaceh.com",
    role: "kasir",
    displayName: "Kasir 3 (Citra)",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Helper function to create date
const getDate = (daysAgo, hours = 10, minutes = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Data dummy transactions untuk 5 hari
const generateTransactions = () => {
  const transactions = [];
  
  // Hari ke-5: 10 Februari 2026 (H+5)
  transactions.push(
    {
      items: [
        { code: "MAK001", name: "Indomie Goreng", price: 3500, quantity: 3, unit: "pcs" },
        { code: "MIN001", name: "Aqua 600ml", price: 4500, quantity: 2, unit: "pcs" },
        { code: "ROK001", name: "Sampoerna Mild", price: 32000, quantity: 1, unit: "pack" }
      ],
      total: 51500,
      cash: 60000,
      transfer: 0,
      change: 8500,
      kasir: "Kasir 1 (Budi)",
      type: "sale",
      timestamp: getDate(5, 8, 30)
    },
    {
      items: [
        { code: "MIN002", name: "Coca Cola 1.5L", price: 16000, quantity: 2, unit: "pcs" },
        { code: "MAK003", name: "Chitato", price: 12500, quantity: 1, unit: "pack" }
      ],
      total: 44500,
      cash: 0,
      transfer: 50000,
      change: 5500,
      kasir: "Kasir 2 (Ani)",
      type: "sale",
      timestamp: getDate(5, 12, 15)
    },
    {
      items: [
        { code: "GAS001", name: "Gas 3kg Bright", price: 27000, quantity: 2, unit: "tabung" },
        { code: "SEM002", name: "Gula Pasir 1kg", price: 16000, quantity: 3, unit: "pack" }
      ],
      total: 102000,
      cash: 102000,
      transfer: 0,
      change: 0,
      kasir: "Kasir 3 (Citra)",
      type: "sale",
      timestamp: getDate(5, 16, 45)
    }
  );

  // Hari ke-4: 11 Februari 2026 (H+4)
  transactions.push(
    {
      items: [
        { code: "ROK002", name: "Marlboro Red", price: 36000, quantity: 1, unit: "pack" },
        { code: "MIN004", name: "Kopi Kapal Api", price: 2500, quantity: 5, unit: "sachet" },
        { code: "LAI002", name: "Sabun Lifebuoy", price: 5500, quantity: 2, unit: "pcs" }
      ],
      total: 56500,
      cash: 60000,
      transfer: 0,
      change: 3500,
      kasir: "Kasir 1 (Budi)",
      type: "sale",
      timestamp: getDate(4, 9, 20)
    },
    {
      items: [
        { code: "MAK004", name: "Oreo", price: 11000, quantity: 2, unit: "pack" },
        { code: "MIN003", name: "Teh Botol Sosro", price: 5500, quantity: 4, unit: "pcs" },
        { code: "MAK002", name: "Roti Aoka", price: 5500, quantity: 3, unit: "pcs" }
      ],
      total: 58500,
      cash: 60000,
      transfer: 0,
      change: 1500,
      kasir: "Kasir 2 (Ani)",
      type: "sale",
      timestamp: getDate(4, 14, 30)
    },
    {
      items: [
        { code: "SEM001", name: "Beras Rojolele 5kg", price: 75000, quantity: 1, unit: "pack" },
        { code: "MNY001", name: "Minyak Bimoli 1L", price: 22000, quantity: 2, unit: "pcs" },
        { code: "SEM003", name: "Micin Sasa", price: 3500, quantity: 3, unit: "pcs" }
      ],
      total: 129500,
      cash: 130000,
      transfer: 0,
      change: 500,
      kasir: "Kasir 3 (Citra)",
      type: "sale",
      timestamp: getDate(4, 18, 10)
    }
  );

  // Hari ke-3: 12 Februari 2026 (H+3)
  transactions.push(
    {
      items: [
        { code: "MIN005", name: "Pocari Sweat 500ml", price: 8000, quantity: 4, unit: "pcs" },
        { code: "MAK005", name: "Beng Beng", price: 2500, quantity: 6, unit: "pcs" }
      ],
      total: 47000,
      cash: 50000,
      transfer: 0,
      change: 3000,
      kasir: "Kasir 1 (Budi)",
      type: "sale",
      timestamp: getDate(3, 10, 5)
    },
    {
      items: [
        { code: "ROK003", name: "Dji Sam Soe", price: 27000, quantity: 2, unit: "pack" },
        { code: "ROK004", name: "LA Bold", price: 21000, quantity: 1, unit: "pack" },
        { code: "MIN001", name: "Aqua 600ml", price: 4500, quantity: 3, unit: "pcs" }
      ],
      total: 88500,
      cash: 0,
      transfer: 90000,
      change: 1500,
      kasir: "Kasir 2 (Ani)",
      type: "sale",
      timestamp: getDate(3, 15, 20)
    },
    {
      items: [
        { code: "LAI001", name: "Baterai ABC", price: 12000, quantity: 3, unit: "pcs" },
        { code: "LAI003", name: "Shampo Sunsilk", price: 15000, quantity: 2, unit: "pcs" }
      ],
      total: 66000,
      cash: 70000,
      transfer: 0,
      change: 4000,
      kasir: "Kasir 3 (Citra)",
      type: "sale",
      timestamp: getDate(3, 19, 45)
    }
  );

  // Hari ke-2: 13 Februari 2026 (H+2)
  transactions.push(
    {
      items: [
        { code: "MAK001", name: "Indomie Goreng", price: 3500, quantity: 5, unit: "pcs" },
        { code: "MIN002", name: "Coca Cola 1.5L", price: 16000, quantity: 1, unit: "pcs" },
        { code: "ROK001", name: "Sampoerna Mild", price: 32000, quantity: 1, unit: "pack" }
      ],
      total: 65500,
      cash: 70000,
      transfer: 0,
      change: 4500,
      kasir: "Kasir 1 (Budi)",
      type: "sale",
      timestamp: getDate(2, 8, 45)
    },
    {
      items: [
        { code: "SEM004", name: "Telur 1kg", price: 28000, quantity: 2, unit: "kg" },
        { code: "MNY002", name: "Minyak Sunco 2L", price: 38000, quantity: 1, unit: "pcs" }
      ],
      total: 94000,
      cash: 0,
      transfer: 100000,
      change: 6000,
      kasir: "Kasir 2 (Ani)",
      type: "sale",
      timestamp: getDate(2, 12, 30)
    },
    {
      items: [
        { code: "GAS002", name: "Gas 12kg", price: 155000, quantity: 1, unit: "tabung" },
        { code: "SEM002", name: "Gula Pasir 1kg", price: 16000, quantity: 2, unit: "pack" }
      ],
      total: 187000,
      cash: 200000,
      transfer: 0,
      change: 13000,
      kasir: "Kasir 3 (Citra)",
      type: "sale",
      timestamp: getDate(2, 17, 15)
    },
    {
      items: [
        { code: "MIN004", name: "Kopi Kapal Api", price: 2500, quantity: 8, unit: "sachet" },
        { code: "MAK002", name: "Roti Aoka", price: 5500, quantity: 2, unit: "pcs" }
      ],
      total: 31000,
      cash: 35000,
      transfer: 0,
      change: 4000,
      kasir: "Kasir 1 (Budi)",
      type: "sale",
      timestamp: getDate(2, 20, 5)
    }
  );

  // Hari ke-1: 14 Februari 2026 (Hari Ini)
  transactions.push(
    {
      items: [
        { code: "MAK003", name: "Chitato", price: 12500, quantity: 2, unit: "pack" },
        { code: "MIN003", name: "Teh Botol Sosro", price: 5500, quantity: 3, unit: "pcs" },
        { code: "LAI002", name: "Sabun Lifebuoy", price: 5500, quantity: 2, unit: "pcs" }
      ],
      total: 53500,
      cash: 60000,
      transfer: 0,
      change: 6500,
      kasir: "Kasir 1 (Budi)",
      type: "sale",
      timestamp: getDate(0, 9, 30)
    },
    {
      items: [
        { code: "ROK002", name: "Marlboro Red", price: 36000, quantity: 2, unit: "pack" },
        { code: "MIN001", name: "Aqua 600ml", price: 4500, quantity: 4, unit: "pcs" }
      ],
      total: 90000,
      cash: 0,
      transfer: 100000,
      change: 10000,
      kasir: "Kasir 2 (Ani)",
      type: "sale",
      timestamp: getDate(0, 11, 15)
    },
    {
      items: [
        { code: "SEM001", name: "Beras Rojolele 5kg", price: 75000, quantity: 2, unit: "pack" },
        { code: "MNY001", name: "Minyak Bimoli 1L", price: 22000, quantity: 3, unit: "pcs" }
      ],
      total: 216000,
      cash: 220000,
      transfer: 0,
      change: 4000,
      kasir: "Kasir 3 (Citra)",
      type: "sale",
      timestamp: getDate(0, 14, 45)
    },
    {
      items: [
        { code: "MAK001", name: "Indomie Goreng", price: 3500, quantity: 6, unit: "pcs" },
        { code: "ROK001", name: "Sampoerna Mild", price: 32000, quantity: 1, unit: "pack" },
        { code: "MIN005", name: "Pocari Sweat 500ml", price: 8000, quantity: 2, unit: "pcs" }
      ],
      total: 71000,
      cash: 75000,
      transfer: 0,
      change: 4000,
      kasir: "Kasir 1 (Budi)",
      type: "sale",
      timestamp: getDate(0, 16, 20)
    }
  );

  return transactions.flat();
};

// Data dummy daily closings
const generateDailyClosings = () => {
  const closings = [];
  
  // 10 Februari 2026
  closings.push({
    date: "2026-02-10",
    totalSales: 198000,
    totalTransactions: 3,
    cashTotal: 162000,
    transferTotal: 50000,
    profit: 39600,
    closedBy: "Pemilik Kede Aceh",
    closedAt: new Date("2026-02-10T22:00:00")
  });

  // 11 Februari 2026
  closings.push({
    date: "2026-02-11",
    totalSales: 244500,
    totalTransactions: 3,
    cashTotal: 250000,
    transferTotal: 0,
    profit: 48900,
    closedBy: "Pemilik Kede Aceh",
    closedAt: new Date("2026-02-11T22:00:00")
  });

  // 12 Februari 2026
  closings.push({
    date: "2026-02-12",
    totalSales: 201500,
    totalTransactions: 3,
    cashTotal: 120000,
    transferTotal: 90000,
    profit: 40300,
    closedBy: "Pemilik Kede Aceh",
    closedAt: new Date("2026-02-12T22:00:00")
  });

  // 13 Februari 2026
  closings.push({
    date: "2026-02-13",
    totalSales: 377500,
    totalTransactions: 4,
    cashTotal: 305000,
    transferTotal: 100000,
    profit: 75500,
    closedBy: "Pemilik Kede Aceh",
    closedAt: new Date("2026-02-13T22:00:00")
  });

  // 14 Februari 2026
  closings.push({
    date: "2026-02-14",
    totalSales: 430500,
    totalTransactions: 4,
    cashTotal: 355000,
    transferTotal: 100000,
    profit: 86100,
    closedBy: "Pemilik Kede Aceh",
    closedAt: new Date("2026-02-14T20:30:00")
  });

  return closings;
};

const dummyTransactions = generateTransactions();
const dummyDailyClosings = generateDailyClosings();

async function seedDatabase() {
  try {
    console.log('🚀 Mulai seeding database KEDE ACEH...\n');

    // 1. Hapus data lama
    console.log('🗑️  Membersihkan data lama...');
    
    const collections = ['products', 'users', 'transactions', 'daily_closings', 'stock_history'];
    for (const collectionName of collections) {
      const ref = db.collection(collectionName);
      const snapshot = await ref.get();
      const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      console.log(`✓ Collection ${collectionName} dibersihkan`);
    }
    console.log('✅ Semua data lama berhasil dihapus\n');

    // 2. Seed Products
    console.log('📦 Menambahkan produk...');
    for (const product of dummyProducts) {
      await db.collection('products').add(product);
      console.log(`✓ Produk ${product.code} - ${product.name} ditambahkan`);
    }
    console.log(`✅ ${dummyProducts.length} produk berhasil ditambahkan\n`);

    // 3. Seed Users
    console.log('👤 Menambahkan users...');
    for (const user of dummyUsers) {
      await db.collection('users').doc(user.email.replace('@', '_at_')).set(user);
      console.log(`✓ User ${user.email} (${user.displayName}) ditambahkan`);
    }
    console.log(`✅ ${dummyUsers.length} users berhasil ditambahkan\n`);

    // 4. Seed Transactions
    console.log('💰 Menambahkan transaksi...');
    let totalAllSales = 0;
    for (const transaction of dummyTransactions) {
      await db.collection('transactions').add(transaction);
      console.log(`✓ Transaksi Rp ${transaction.total.toLocaleString('id-ID')} - ${transaction.timestamp.toLocaleDateString('id-ID')} (${transaction.kasir})`);
      totalAllSales += transaction.total;
    }
    console.log(`✅ ${dummyTransactions.length} transaksi berhasil ditambahkan`);
    console.log(`   Total penjualan 5 hari: Rp ${totalAllSales.toLocaleString('id-ID')}\n`);

    // 5. Seed Daily Closings
    console.log('📊 Menambahkan laporan tutup buku harian...');
    for (const closing of dummyDailyClosings) {
      await db.collection('daily_closings').add(closing);
      console.log(`✓ Tutup buku ${closing.date} - Rp ${closing.totalSales.toLocaleString('id-ID')} (${closing.totalTransactions} transaksi)`);
    }
    console.log(`✅ ${dummyDailyClosings.length} laporan tutup buku berhasil ditambahkan\n`);

    // 6. Seed Stock History (opsional)
    console.log('📈 Menambahkan history stok...');
    const stockHistory = [
      {
        productId: "demo",
        productName: "Indomie Goreng",
        oldStock: 45,
        newStock: 50,
        adjustment: 5,
        type: "add",
        note: "Restock dari supplier",
        timestamp: new Date("2026-02-10T09:00:00"),
        user: "Pemilik Kede Aceh"
      },
      {
        productId: "demo",
        productName: "Gas 3kg",
        oldStock: 8,
        newStock: 10,
        adjustment: 2,
        type: "add",
        note: "Restock",
        timestamp: new Date("2026-02-12T14:30:00"),
        user: "Pemilik Kede Aceh"
      }
    ];
    
    for (const history of stockHistory) {
      await db.collection('stock_history').add(history);
    }
    console.log(`✓ ${stockHistory.length} history stok ditambahkan\n`);

    // Summary
    console.log('🎉 SEEDING SELESAI!');
    console.log('\n📊 RINGKASAN DATA:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 Produk            : ${dummyProducts.length} item`);
    console.log(`👥 Users             : ${dummyUsers.length} orang`);
    console.log(`💰 Transaksi         : ${dummyTransactions.length} transaksi (5 hari)`);
    console.log(`📈 Total Penjualan   : Rp ${totalAllSales.toLocaleString('id-ID')}`);
    console.log(`📊 Rata-rata/hari    : Rp ${Math.round(totalAllSales/5).toLocaleString('id-ID')}`);
    console.log(`📅 Tutup Buku        : ${dummyDailyClosings.length} hari`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Owner    : owner@kedeaceh.com / owner123');
    console.log('💼 Kasir 1  : kasir@kedeaceh.com / kasir123 (Budi)');
    console.log('💼 Kasir 2  : kasir2@kedeaceh.com / kasir123 (Ani)');
    console.log('💼 Kasir 3  : kasir3@kedeaceh.com / kasir123 (Citra)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n📅 DATA PER HARI:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    dummyDailyClosings.forEach(day => {
      console.log(`${day.date} : Rp ${day.totalSales.toLocaleString('id-ID')} (${day.totalTransactions} transaksi)`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error saat seeding:', error);
  } finally {
    process.exit(0);
  }
}

// Jalankan seeding
seedDatabase();
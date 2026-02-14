// dataDummy.js - Untuk mengisi data dummy ke Firestore
export const dummyProducts = [
  // Makanan
  { code: "MAK001", name: "Indomie Goreng", category: "makanan", price: 3000, stock: 50, unit: "pcs", purchasePrice: 2500, minStock: 10 },
  { code: "MAK002", name: "Roti Aoka", category: "makanan", price: 5000, stock: 30, unit: "pcs", purchasePrice: 4000, minStock: 10 },
  { code: "MAK003", name: "Chitato", category: "makanan", price: 12000, stock: 20, unit: "pack", purchasePrice: 10000, minStock: 5 },
  { code: "MAK004", name: "Oreo", category: "makanan", price: 10000, stock: 25, unit: "pack", purchasePrice: 8500, minStock: 5 },
  
  // Minuman
  { code: "MIN001", name: "Aqua 600ml", category: "minuman", price: 4000, stock: 100, unit: "pcs", purchasePrice: 3000, minStock: 20 },
  { code: "MIN002", name: "Coca Cola 1.5L", category: "minuman", price: 15000, stock: 30, unit: "pcs", purchasePrice: 12000, minStock: 10 },
  { code: "MIN003", name: "Teh Botol Sosro", category: "minuman", price: 5000, stock: 40, unit: "pcs", purchasePrice: 4000, minStock: 15 },
  { code: "MIN004", name: "Kopi Kapal Api", category: "minuman", price: 2000, stock: 60, unit: "sachet", purchasePrice: 1500, minStock: 20 },
  
  // Rokok
  { code: "ROK001", name: "Sampoerna Mild", category: "rokok", price: 30000, stock: 25, unit: "pack", purchasePrice: 28000, minStock: 10 },
  { code: "ROK002", name: "Marlboro Red", category: "rokok", price: 35000, stock: 20, unit: "pack", purchasePrice: 32000, minStock: 10 },
  { code: "ROK003", name: "Dji Sam Soe", category: "rokok", price: 25000, stock: 15, unit: "pack", purchasePrice: 23000, minStock: 5 },
  { code: "ROK004", name: "LA Bold", category: "rokok", price: 20000, stock: 30, unit: "pack", purchasePrice: 18000, minStock: 10 },
  
  // Gas
  { code: "GAS001", name: "Gas 3kg Bright", category: "gas", price: 25000, stock: 10, unit: "tabung", purchasePrice: 22000, minStock: 3 },
  { code: "GAS002", name: "Gas 12kg", category: "gas", price: 150000, stock: 5, unit: "tabung", purchasePrice: 140000, minStock: 2 },
  
  // Minyak
  { code: "MNY001", name: "Minyak Bimoli 1L", category: "minyak", price: 20000, stock: 20, unit: "pcs", purchasePrice: 18000, minStock: 5 },
  { code: "MNY002", name: "Minyak Sunco 2L", category: "minyak", price: 35000, stock: 15, unit: "pcs", purchasePrice: 32000, minStock: 5 },
  
  // Sembako
  { code: "SEM001", name: "Beras Rojolele 5kg", category: "sembako", price: 70000, stock: 10, unit: "pack", purchasePrice: 65000, minStock: 3 },
  { code: "SEM002", name: "Gula Pasir 1kg", category: "sembako", price: 15000, stock: 25, unit: "pack", purchasePrice: 13000, minStock: 5 },
  { code: "SEM003", name: "Micin Sasa", category: "sembako", price: 3000, stock: 40, unit: "pcs", purchasePrice: 2500, minStock: 10 },
  
  // Lainnya
  { code: "LAI001", name: "Baterai ABC", category: "lainnya", price: 10000, stock: 30, unit: "pcs", purchasePrice: 8000, minStock: 10 },
  { code: "LAI002", name: "Sabun Lifebuoy", category: "lainnya", price: 5000, stock: 25, unit: "pcs", purchasePrice: 4000, minStock: 10 },
];
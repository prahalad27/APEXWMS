export interface Product {
  id: string;
  name: string;
  sku: string; // Barcode / SKU
  category: string;
  price: number; // Selling price
  cost: number; // Purchase cost
  stock: number;
  reorderLevel: number;
  location: {
    aisle: string; // e.g. "A", "B", "C"
    shelf: string; // e.g. "1", "2", "3"
  };
  supplierId: string;
  imageUrl?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
}

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string; // ISO String
  customerName: string;
  customerPhone?: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'On Account';
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO String
  type: 'stock_update' | 'sale' | 'low_stock' | 'new_product' | 'supplier';
  message: string;
  severity: 'info' | 'warning' | 'success';
}

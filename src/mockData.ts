import { Product, Supplier, Transaction, ActivityLog } from './types';

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_1',
    name: 'Apex Logistics India Pvt. Ltd.',
    contactName: 'Sarah Jenkins',
    email: 'sarah.j@apexlogistics.in',
    phone: '+91 98765 43210',
    address: 'Plot 48, Industrial Area Phase II, Bengaluru, Karnataka - 560066'
  },
  {
    id: 'sup_2',
    name: 'ByteTech Hardware Distributors',
    contactName: 'David Chen',
    email: 'dchen@bytetech-dist.in',
    phone: '+91 87654 32109',
    address: '101, Silicon Towers, Sector V, Salt Lake, Kolkata, West Bengal - 700091'
  },
  {
    id: 'sup_3',
    name: 'EcoPack India Sourcing',
    contactName: 'Elena Rostova',
    email: 'eco.orders@ecopack.org.in',
    phone: '+91 76543 21098',
    address: '77, Green Lane, MIDC Industrial Area, Pune, Maharashtra - 411018'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Logitech MX Master 3S Mouse',
    sku: '097855171122',
    category: 'Electronics',
    price: 8999.00,
    cost: 5500.00,
    stock: 42,
    reorderLevel: 15,
    location: { aisle: 'A', shelf: '2' },
    supplierId: 'sup_2',
  },
  {
    id: 'prod_2',
    name: 'Keychron Q1 Mechanical Keyboard',
    sku: '693302251144',
    category: 'Electronics',
    price: 14999.00,
    cost: 11000.00,
    stock: 8, // Low Stock Alert
    reorderLevel: 10,
    location: { aisle: 'A', shelf: '3' },
    supplierId: 'sup_2',
  },
  {
    id: 'prod_3',
    name: 'UltraWide Curved Monitor 34"',
    sku: '887276554123',
    category: 'Electronics',
    price: 32999.00,
    cost: 25000.00,
    stock: 12,
    reorderLevel: 5,
    location: { aisle: 'B', shelf: '1' },
    supplierId: 'sup_2',
  },
  {
    id: 'prod_4',
    name: 'Ergonomic Desk Chair',
    sku: '441029384756',
    category: 'Furniture',
    price: 18499.00,
    cost: 11500.00,
    stock: 4, // Low Stock Alert
    reorderLevel: 8,
    location: { aisle: 'C', shelf: '1' },
    supplierId: 'sup_1',
  },
  {
    id: 'prod_5',
    name: 'Bamboo Wooden Monitor Stand',
    sku: '729011234567',
    category: 'Furniture',
    price: 2499.00,
    cost: 1500.00,
    stock: 25,
    reorderLevel: 8,
    location: { aisle: 'C', shelf: '4' },
    supplierId: 'sup_3',
  },
  {
    id: 'prod_6',
    name: 'Heavy Duty Storage Box (5-pack)',
    sku: '315264879012',
    category: 'Packaging',
    price: 1299.00,
    cost: 800.00,
    stock: 85,
    reorderLevel: 20,
    location: { aisle: 'D', shelf: '2' },
    supplierId: 'sup_3',
  },
  {
    id: 'prod_7',
    name: 'Anker PowerPort USB-C Hub',
    sku: '848061075322',
    category: 'Electronics',
    price: 3499.00,
    cost: 2200.00,
    stock: 0, // Out of Stock Alert
    reorderLevel: 10,
    location: { aisle: 'A', shelf: '1' },
    supplierId: 'sup_2',
  },
  {
    id: 'prod_8',
    name: 'Smart RGB LED Strip Light (5m)',
    sku: '190198765432',
    category: 'Home Goods',
    price: 1899.00,
    cost: 1200.00,
    stock: 50,
    reorderLevel: 15,
    location: { aisle: 'B', shelf: '4' },
    supplierId: 'sup_1',
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    invoiceNumber: 'INV-2026-001',
    date: '2026-07-10T14:32:00Z',
    customerName: 'Aarav Sharma',
    customerPhone: '+91 99887 76655',
    items: [
      { productId: 'prod_1', name: 'Logitech MX Master 3S Mouse', quantity: 2, price: 8999.00, total: 17998.00 },
      { productId: 'prod_5', name: 'Bamboo Wooden Monitor Stand', quantity: 1, price: 2499.00, total: 2499.00 }
    ],
    subtotal: 20497.00,
    discount: 1000.00,
    tax: 3509.46, // 18% GST on (20497 - 1000) = 19497
    total: 23006.46,
    paymentMethod: 'Card'
  },
  {
    id: 'tx_2',
    invoiceNumber: 'INV-2026-002',
    date: '2026-07-12T10:15:00Z',
    customerName: 'Priya Patel',
    customerPhone: '+91 98765 12345',
    items: [
      { productId: 'prod_2', name: 'Keychron Q1 Mechanical Keyboard', quantity: 1, price: 14999.00, total: 14999.00 }
    ],
    subtotal: 14999.00,
    discount: 0,
    tax: 2699.82, // 18% GST on 14999
    total: 17698.82,
    paymentMethod: 'UPI'
  },
  {
    id: 'tx_3',
    invoiceNumber: 'INV-2026-003',
    date: '2026-07-14T16:45:00Z',
    customerName: 'Rahul Verma',
    customerPhone: '+91 95432 10987',
    items: [
      { productId: 'prod_6', name: 'Heavy Duty Storage Box (5-pack)', quantity: 3, price: 1299.00, total: 3897.00 },
      { productId: 'prod_8', name: 'Smart RGB LED Strip Light (5m)', quantity: 2, price: 1899.00, total: 3798.00 }
    ],
    subtotal: 7695.00,
    discount: 500.00,
    tax: 1295.10, // 18% GST on (7695 - 500) = 7195
    total: 8490.10,
    paymentMethod: 'Cash'
  },
  {
    id: 'tx_4',
    invoiceNumber: 'INV-2026-004',
    date: '2026-07-15T11:20:00Z',
    customerName: 'Vikram Singh',
    customerPhone: '+91 91112 22333',
    items: [
      { productId: 'prod_3', name: 'UltraWide Curved Monitor 34"', quantity: 1, price: 32999.00, total: 32999.00 },
      { productId: 'prod_4', name: 'Ergonomic Desk Chair', quantity: 1, price: 18499.00, total: 18499.00 }
    ],
    subtotal: 51498.00,
    discount: 3000.00,
    tax: 8729.64, // 18% GST on (51498 - 3000) = 48498
    total: 57227.64,
    paymentMethod: 'On Account'
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log_1',
    timestamp: '2026-07-15T09:00:00Z',
    type: 'new_product',
    message: 'New product added: Logitech MX Master 3S Mouse',
    severity: 'info'
  },
  {
    id: 'log_2',
    timestamp: '2026-07-15T11:20:00Z',
    type: 'sale',
    message: 'Invoice INV-2026-004 generated for customer Vikram Singh (₹57,227.64)',
    severity: 'success'
  },
  {
    id: 'log_3',
    timestamp: '2026-07-15T11:20:01Z',
    type: 'low_stock',
    message: 'Low stock alert: Ergonomic Desk Chair stock dropped to 4 (threshold 8)',
    severity: 'warning'
  },
  {
    id: 'log_4',
    timestamp: '2026-07-15T13:40:00Z',
    type: 'stock_update',
    message: 'Supplier ByteTech delivered 20 units of Logitech MX Master 3S Mouse',
    severity: 'success'
  }
];

import React, { useState, useEffect } from 'react';
import { Product, Supplier, Transaction, ActivityLog, TransactionItem } from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_SUPPLIERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_LOGS 
} from './mockData';

// Subcomponents
import WarehouseMap from './components/WarehouseMap';
import SuppliersList from './components/SuppliersList';
import BarcodeScanner from './components/BarcodeScanner';
import InventoryList from './components/InventoryList';
import BillingSystem from './components/BillingSystem';
import SalesReport from './components/SalesReport';

// Icons
import { 
  LayoutDashboard, 
  Warehouse, 
  Scan, 
  ShoppingCart, 
  BarChart3, 
  Truck, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  IndianRupee, 
  Package, 
  Plus, 
  Layers, 
  Mail, 
  RefreshCw 
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'warehouse' | 'scanner' | 'inventory' | 'billing' | 'reports' | 'suppliers'>('dashboard');

  // Unified State with localStorage persistence
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [cart, setCart] = useState<TransactionItem[]>([]);

  // Load state on startup
  useEffect(() => {
    const cachedProducts = localStorage.getItem('apex_products');
    const cachedSuppliers = localStorage.getItem('apex_suppliers');
    const cachedTransactions = localStorage.getItem('apex_transactions');
    const cachedLogs = localStorage.getItem('apex_logs');

    if (cachedProducts) setProducts(JSON.parse(cachedProducts));
    else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('apex_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (cachedSuppliers) setSuppliers(JSON.parse(cachedSuppliers));
    else {
      setSuppliers(INITIAL_SUPPLIERS);
      localStorage.setItem('apex_suppliers', JSON.stringify(INITIAL_SUPPLIERS));
    }

    if (cachedTransactions) setTransactions(JSON.parse(cachedTransactions));
    else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem('apex_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    }

    if (cachedLogs) setLogs(JSON.parse(cachedLogs));
    else {
      setLogs(INITIAL_LOGS);
      localStorage.setItem('apex_logs', JSON.stringify(INITIAL_LOGS));
    }
  }, []);

  // Sync state helpers
  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('apex_products', JSON.stringify(updatedProducts));
  };

  const saveSuppliers = (updatedSuppliers: Supplier[]) => {
    setSuppliers(updatedSuppliers);
    localStorage.setItem('apex_suppliers', JSON.stringify(updatedSuppliers));
  };

  const saveTransactions = (updatedTransactions: Transaction[]) => {
    setTransactions(updatedTransactions);
    localStorage.setItem('apex_transactions', JSON.stringify(updatedTransactions));
  };

  const saveLogs = (updatedLogs: ActivityLog[]) => {
    setLogs(updatedLogs);
    localStorage.setItem('apex_logs', JSON.stringify(updatedLogs));
  };

  const pushLog = (type: ActivityLog['type'], message: string, severity: ActivityLog['severity'] = 'info') => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      severity
    };
    const updated = [newLog, ...logs];
    saveLogs(updated);
  };

  // PRODUCT ACTIONS
  const handleAddProduct = (newProduct: Product) => {
    const updated = [newProduct, ...products];
    saveProducts(updated);
    pushLog('new_product', `Added new product: ${newProduct.name} (SKU: ${newProduct.sku})`, 'success');
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    saveProducts(updated);
    pushLog('stock_update', `Updated product settings: ${updatedProduct.name}`, 'info');
  };

  const handleDeleteProduct = (productId: string) => {
    const target = products.find(p => p.id === productId);
    const updated = products.filter(p => p.id !== productId);
    saveProducts(updated);
    if (target) {
      pushLog('stock_update', `Deleted product from catalog: ${target.name}`, 'warning');
    }
  };

  // INVENTORY OPERATIONS
  const handleQuickAddStock = (productId: string, amount: number) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const newStock = p.stock + amount;
        pushLog('stock_update', `Restocked "${p.name}": +${amount} units (New total: ${newStock})`, 'success');
        return { ...p, stock: newStock };
      }
      return p;
    });
    saveProducts(updated);
  };

  const handleQuickDeductStock = (productId: string, amount: number) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock - amount);
        pushLog('stock_update', `Deducted "${p.name}": -${amount} units (New total: ${newStock})`, 'warning');
        return { ...p, stock: newStock };
      }
      return p;
    });
    saveProducts(updated);
  };

  // TRANSACTIONS & BILLING
  const handleProcessSale = (transaction: Transaction) => {
    // 1. Deduct stock from products
    const updatedProducts = products.map(p => {
      const cartItem = transaction.items.find(item => item.productId === p.id);
      if (cartItem) {
        const remaining = p.stock - cartItem.quantity;
        
        // Log telemetry warnings on crossover
        if (remaining <= p.reorderLevel && p.stock > p.reorderLevel) {
          setTimeout(() => {
            pushLog('low_stock', `Low stock warning! "${p.name}" has dipped below reorder level (Remaining: ${remaining} units)`, 'warning');
          }, 500);
        }
        
        return { ...p, stock: Math.max(0, remaining) };
      }
      return p;
    });

    saveProducts(updatedProducts);

    // 2. Save transaction ledger
    const updatedTransactions = [...transactions, transaction];
    saveTransactions(updatedTransactions);

    // 3. Log sale activity
    pushLog('sale', `Completed transaction ${transaction.invoiceNumber} for ${transaction.customerName} - Total: ₹${transaction.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'success');
  };

  const handleVoidTransaction = (transactionId: string) => {
    const targetTx = transactions.find(t => t.id === transactionId);
    if (!targetTx) return;

    // 1. Replenish product stocks
    const updatedProducts = products.map(p => {
      const returnedItem = targetTx.items.find(item => item.productId === p.id);
      if (returnedItem) {
        return { ...p, stock: p.stock + returnedItem.quantity };
      }
      return p;
    });
    saveProducts(updatedProducts);

    // 2. Remove transaction
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    saveTransactions(updatedTransactions);

    // 3. Log void
    pushLog('sale', `Voided invoice ${targetTx.invoiceNumber}. Replenished ${targetTx.items.reduce((sum, i) => sum + i.quantity, 0)} items to warehouse shelves.`, 'warning');
  };

  // SUPPLIERS
  const handleAddSupplier = (newSupplier: Supplier) => {
    const updated = [...suppliers, newSupplier];
    saveSuppliers(updated);
    pushLog('supplier', `Registered supplier partner: ${newSupplier.name}`, 'success');
  };

  // Direct dispatch cart adder from other tabs
  const handleDirectToCartAdder = (product: Product) => {
    const existingIndex = cart.findIndex(item => item.productId === product.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= product.stock) {
        alert(`Insufficient stock! Only ${product.stock} units are available.`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * product.price;
      setCart(updated);
    } else {
      const newItem: TransactionItem = {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        total: product.price
      };
      setCart([...cart, newItem]);
    }
  };

  // ANALYTICS CALCULATIONS FOR DASHBOARD
  const totalValuation = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalProductLines = products.length;
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.reorderLevel);
  const outOfStockItems = products.filter(p => p.stock === 0);

  // Trigger quick reorder email mailto helper
  const triggerReorderFromDashboard = (product: Product) => {
    const supplier = suppliers.find(s => s.id === product.supplierId) || suppliers[0];
    if (!supplier) {
      alert('No suppliers registered for this product.');
      return;
    }
    const subject = encodeURIComponent(`Reorder request: ${product.name}`);
    const body = encodeURIComponent(
      `Hi ${supplier.contactName},\n\n` +
      `We require a restock order for the following low-level item:\n\n` +
      `Item: ${product.name}\n` +
      `SKU: ${product.sku}\n` +
      `Current stock count: ${product.stock} units\n` +
      `Requested quantity: 50 units\n\n` +
      `Please issue dispatch details.\n\n` +
      `Warm regards,\n` +
      `Warehouse Manager`
    );
    window.open(`mailto:${supplier.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-hidden font-sans text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Left Sidebar: Systematic Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0 select-none">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 flex items-center justify-center font-black text-lg text-white">A</div>
            <h1 className="font-bold tracking-tight text-lg text-white">APEX WAREHOUSE</h1>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-mono">System v4.2.1</p>
        </div>
        
        <nav className="flex-1 py-6 space-y-0.5">
          <div className="px-6 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operations</div>
          
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white border-r-4 border-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <span className="w-5 h-5 mr-3 flex items-center shrink-0"><LayoutDashboard className="h-4 w-4" /></span> Dashboard
          </button>

          <button
            id="tab-warehouse"
            onClick={() => setActiveTab('warehouse')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all ${
              activeTab === 'warehouse' ? 'bg-blue-600 text-white border-r-4 border-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <span className="w-5 h-5 mr-3 flex items-center shrink-0"><Layers className="h-4 w-4" /></span> Zone Tracker
          </button>

          <button
            id="tab-scanner"
            onClick={() => setActiveTab('scanner')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all ${
              activeTab === 'scanner' ? 'bg-blue-600 text-white border-r-4 border-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <span className="w-5 h-5 mr-3 flex items-center shrink-0"><Scan className="h-4 w-4" /></span> Scanning Hub
          </button>

          <button
            id="tab-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all ${
              activeTab === 'inventory' ? 'bg-blue-600 text-white border-r-4 border-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <span className="w-5 h-5 mr-3 flex items-center shrink-0"><Warehouse className="h-4 w-4" /></span> Stock Catalog
          </button>

          <div className="px-6 pt-6 pb-2 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Finance & Logistics</div>

          <button
            id="tab-billing"
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all ${
              activeTab === 'billing' ? 'bg-blue-600 text-white border-r-4 border-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <span className="w-5 h-5 mr-3 flex items-center shrink-0"><ShoppingCart className="h-4 w-4" /></span> Billing & Sales
            {cart.length > 0 && (
              <span className="ml-auto bg-blue-500 text-white font-extrabold text-[9px] py-0.5 px-2 tracking-wider">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </button>

          <button
            id="tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all ${
              activeTab === 'reports' ? 'bg-blue-600 text-white border-r-4 border-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <span className="w-5 h-5 mr-3 flex items-center shrink-0"><BarChart3 className="h-4 w-4" /></span> Performance
          </button>

          <button
            id="tab-suppliers"
            onClick={() => setActiveTab('suppliers')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all ${
              activeTab === 'suppliers' ? 'bg-blue-600 text-white border-r-4 border-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <span className="w-5 h-5 mr-3 flex items-center shrink-0"><Truck className="h-4 w-4" /></span> Suppliers
          </button>
        </nav>

        <div className="p-6 bg-slate-950 border-t border-slate-900">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            Live Sync Active
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Facility</span>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Central Warehouse [CW-01]</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right text-xs font-semibold text-slate-500 hidden md:block">
              Total Valuation: <span className="font-bold font-mono text-slate-900">₹{totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
            <div className="w-10 h-10 bg-slate-200 flex items-center justify-center font-bold border border-slate-300 text-slate-700 font-mono text-sm">
              JD
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 flex-1 space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Telemetry row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-5 border border-slate-200 flex flex-col justify-between shadow-none">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Stock Valuation</span>
                      <span className="text-2xl font-bold font-mono text-slate-900 mt-2 block">
                        ₹{totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 text-slate-600 border border-slate-200">
                      <IndianRupee className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-2">Active cost sum calculations</span>
                </div>

                <div className="bg-white p-5 border border-slate-200 flex flex-col justify-between shadow-none">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Physical Stock</span>
                      <span className="text-2xl font-bold font-mono text-slate-900 mt-2 block">
                        {products.reduce((sum, p) => sum + p.stock, 0).toLocaleString()} units
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 text-slate-600 border border-slate-200">
                      <Package className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-2">Across {totalProductLines} SKU listings</span>
                </div>

                <div className="bg-amber-50 p-5 border border-amber-200 flex flex-col justify-between shadow-none">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Low Stock Alerts</span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-bold text-amber-900 font-mono">
                          {lowStockItems.length} Items
                        </span>
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="p-2 bg-white text-amber-700 border border-amber-200">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-600 font-semibold block mt-2">Threshold violations</span>
                </div>

                <div className="bg-rose-50 p-5 border border-rose-200 flex flex-col justify-between shadow-none">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">Out of Stock</span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-bold text-rose-900 font-mono">
                          {outOfStockItems.length} Lines
                        </span>
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                      </div>
                    </div>
                    <div className="p-2 bg-white text-rose-700 border border-rose-200">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="text-[10px] text-rose-600 font-semibold block mt-2">Requires inward logistics</span>
                </div>
              </div>

              {/* Alert Center & Dynamic logs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Out / Low stock alerts */}
                <div className="lg:col-span-7 bg-white border border-slate-200 p-6 shadow-none flex flex-col justify-between">
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Low-Stock Notification Center
                    </h2>

                    {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 border border-slate-150">
                        <Package className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">All Items Fully Stocked</h4>
                        <p className="text-[11px] text-slate-500 mt-1">No products reside below reorder configurations.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                        {/* Out of Stock first */}
                        {outOfStockItems.map(p => (
                          <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-rose-200 bg-rose-50/50 p-3 gap-2">
                            <div>
                              <p className="text-xs font-bold text-slate-900">{p.name}</p>
                              <p className="text-[10px] text-rose-800 font-mono mt-0.5">
                                [OUT OF STOCK] • Bay Aisle {p.location.aisle}-{p.location.shelf}
                              </p>
                            </div>
                            <div className="flex gap-1.5 self-end sm:self-auto">
                              <button
                                id={`dash-restock-out-${p.id}`}
                                onClick={() => handleQuickAddStock(p.id, 25)}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] py-1 px-2.5 transition-colors"
                              >
                                +25 Inward
                              </button>
                              <button
                                id={`dash-email-out-${p.id}`}
                                onClick={() => triggerReorderFromDashboard(p)}
                                title="Draft supply email"
                                className="bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] py-1 px-2 flex items-center gap-1 font-bold transition-colors"
                              >
                                <Mail className="h-3 w-3" /> Supplier
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Low stock next */}
                        {lowStockItems.map(p => (
                          <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-amber-200 bg-amber-50/50 p-3 gap-2">
                            <div>
                              <p className="text-xs font-bold text-slate-900">{p.name}</p>
                              <p className="text-[10px] text-amber-800 font-mono mt-0.5">
                                Current Stock: {p.stock} units (Threshold: {p.reorderLevel})
                              </p>
                            </div>
                            <div className="flex gap-1.5 self-end sm:self-auto">
                              <button
                                id={`dash-restock-low-${p.id}`}
                                onClick={() => handleQuickAddStock(p.id, 20)}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] py-1 px-2.5 transition-colors"
                              >
                                +20 Inward
                              </button>
                              <button
                                id={`dash-email-low-${p.id}`}
                                onClick={() => triggerReorderFromDashboard(p)}
                                className="bg-white hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] py-1 px-2 flex items-center gap-1 font-bold transition-colors"
                              >
                                <Mail className="h-3 w-3" /> Supplier
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Restocking Advice Simulated Widget */}
                  <div className="border-t border-slate-150 pt-5 mt-6 bg-slate-50 p-4 border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5 tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                      AI Stock Forecaster (Simulated)
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-2">
                      Based on recent checkout velocity, <span className="font-extrabold text-slate-900">Keychron Mechanical Keyboard</span> demand is outstripping supply. An additional restock shipment of 30 units is suggested prior to weekend deliveries.
                    </p>
                  </div>
                </div>

                {/* Operations logs timeline */}
                <div className="lg:col-span-5 bg-white border border-slate-200 p-6 shadow-none flex flex-col h-[480px]">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4 shrink-0">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Real-Time Activity Matrix
                  </h2>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-mono">
                    {logs.map((log, idx) => {
                      const colors = {
                        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                        warning: 'bg-rose-50 border-rose-200 text-rose-800',
                        info: 'bg-slate-50 border-slate-200 text-slate-700'
                      };
                      return (
                        <div key={log.id || idx} className={`p-2.5 border flex items-start gap-2.5 ${colors[log.severity] || colors.info}`}>
                          <span className="text-[9px] bg-white px-1.5 py-0.5 border text-slate-400 font-bold shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-sans text-xs leading-relaxed">{log.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'warehouse' && (
            <WarehouseMap products={products} onQuickAddStock={handleQuickAddStock} />
          )}

          {activeTab === 'scanner' && (
            <BarcodeScanner 
              products={products} 
              onQuickAddStock={handleQuickAddStock} 
              onQuickDeductStock={handleQuickDeductStock}
              onAddToBill={(product) => {
                handleDirectToCartAdder(product);
                setActiveTab('billing');
              }}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryList 
              products={products} 
              suppliers={suppliers} 
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'billing' && (
            <BillingSystem 
              products={products} 
              onProcessSale={handleProcessSale}
              cart={cart}
              setCart={setCart}
            />
          )}

          {activeTab === 'reports' && (
            <SalesReport 
              transactions={transactions} 
              products={products} 
              onVoidTransaction={handleVoidTransaction}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersList 
              suppliers={suppliers} 
              products={products} 
              onAddSupplier={handleAddSupplier}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 shrink-0 mt-auto">
          <div className="max-w-7xl mx-auto px-8 text-center text-[11px] text-slate-400 font-mono">
            <p>© 2026 Apex Warehouse Systems Inc. Real-time telemetry connection established.</p>
            <p className="mt-1">Licensed under Apache-2.0 • Designed for high performance warehouse environments.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

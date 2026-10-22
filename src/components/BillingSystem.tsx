import React, { useState } from 'react';
import { Product, Transaction, TransactionItem } from '../types';
import { ShoppingCart, Search, User, Trash2, Tag, Percent, Receipt, ChevronRight, AlertCircle, Printer, Download, CreditCard, Banknote, Smartphone, ShieldCheck, CheckCircle } from 'lucide-react';

interface BillingSystemProps {
  products: Product[];
  onProcessSale: (transaction: Transaction) => void;
  cart: TransactionItem[];
  setCart: React.Dispatch<React.SetStateAction<TransactionItem[]>>;
}

export default function BillingSystem({ products, onProcessSale, cart, setCart }: BillingSystemProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxRate] = useState(18); // Default 18% GST (9% CGST + 9% SGST)
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'On Account'>('Cash');

  // Completed Invoice Modal state
  const [completedInvoice, setCompletedInvoice] = useState<Transaction | null>(null);

  // Filter products for quick search adder
  const searchResults = products.filter(product => {
    if (!searchProductQuery.trim()) return false;
    return product.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
           product.sku.includes(searchProductQuery);
  });

  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      alert('This item is currently out of stock in the warehouse!');
      return;
    }

    const existingIndex = cart.findIndex(item => item.productId === product.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= product.stock) {
        alert(`Insufficient stock! Only ${product.stock} units are available in the warehouse.`);
        return;
      }
      
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      updatedCart[existingIndex].total = updatedCart[existingIndex].quantity * product.price;
      setCart(updatedCart);
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
    setSearchProductQuery('');
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    const mainProduct = products.find(p => p.id === productId);
    if (mainProduct && newQty > mainProduct.stock) {
      alert(`Insufficient stock! Only ${mainProduct.stock} units are available.`);
      return;
    }

    setCart(cart.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: newQty,
          total: newQty * item.price
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  // Math totals (GST is calculated on taxable value after discount)
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const calculatedTax = taxableAmount * (taxRate / 100);
  const cgst = calculatedTax / 2;
  const sgst = calculatedTax / 2;
  const finalTotal = taxableAmount + calculatedTax;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Check inventory levels once more to prevent double sell
    for (const item of cart) {
      const originalProduct = products.find(p => p.id === item.productId);
      if (!originalProduct || originalProduct.stock < item.quantity) {
        alert(`Stock conflict for "${item.name}". Please review warehouse levels.`);
        return;
      }
    }

    const invoice: Transaction = {
      id: `tx_${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      customerName: customerName.trim() || 'Walk-in Retail Customer',
      customerPhone: customerPhone.trim() || undefined,
      items: cart,
      subtotal,
      discount: discountAmount,
      tax: calculatedTax,
      total: finalTotal,
      paymentMethod
    };

    onProcessSale(invoice);
    setCompletedInvoice(invoice);

    // Reset checkout form
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountAmount(0);
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-none shadow-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="h-4.5 w-4.5 text-blue-600" />
            POS Billing Terminal & Dispatch
          </h2>
          <p className="text-xs text-slate-500">Draft commercial invoices, check real-time stock holds, and dispatch customer order sets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Shopping Cart Drafting on left */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div>
            {/* Quick search to add items */}
            <div className="relative mb-5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Search className="h-3 w-3" /> Quick Search & Add Stock Item
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type product name description or barcode SKU..."
                  value={searchProductQuery}
                  onChange={e => setSearchProductQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-sans"
                />
                <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
              </div>

              {/* Instant suggestions overlay */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-300 rounded-none shadow-none max-h-56 overflow-y-auto z-20 divide-y divide-slate-150">
                  {searchResults.map(prod => (
                    <button
                      key={prod.id}
                      type="button"
                      id={`billing-search-${prod.id}`}
                      onClick={() => addToCart(prod)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors rounded-none"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{prod.name}</p>
                        <p className="text-[10px] text-slate-450 font-mono mt-0.5">SKU: {prod.sku} • Coordinates: Aisle {prod.location.aisle}-{prod.location.shelf}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 font-mono">₹{prod.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-wider ${prod.stock === 0 ? 'text-rose-600' : prod.stock <= prod.reorderLevel ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {prod.stock === 0 ? 'Out of Stock' : `${prod.stock} in store`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Table list */}
            <div className="border border-slate-200 rounded-none overflow-hidden mb-6 shadow-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                    <th className="p-3">Product Description</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3 text-center">Qty / Available</th>
                    <th className="p-3">Subtotal</th>
                    <th className="p-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs font-medium">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-14 text-slate-400">
                        <ShoppingCart className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-slate-900 uppercase text-xs tracking-wider">Checkout Cart Empty</p>
                        <p className="text-[11px] text-slate-500 mt-1">Simulate a barcode scan or search products above to draft orders.</p>
                      </td>
                    </tr>
                  ) : (
                    cart.map(item => {
                      const warehouseProd = products.find(p => p.id === item.productId);
                      const maxStock = warehouseProd ? warehouseProd.stock : 999;

                      return (
                        <tr key={item.productId} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <span className="font-bold text-slate-950 block">{item.name}</span>
                            <span className="text-[9px] text-slate-455 font-mono uppercase tracking-wide">ID: {item.productId}</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-800">₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-3 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-slate-50 rounded-none p-1 border border-slate-200">
                              <button
                                type="button"
                                id={`cart-dec-${item.productId}`}
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="w-5 h-5 text-xs bg-white text-slate-700 rounded-none border border-slate-200 hover:bg-slate-100 font-bold cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold font-mono px-1 w-6 text-center text-slate-900">{item.quantity}</span>
                              <button
                                type="button"
                                id={`cart-inc-${item.productId}`}
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="w-5 h-5 text-xs bg-white text-slate-700 rounded-none border border-slate-200 hover:bg-slate-100 font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            <span className="block text-[9px] text-slate-400 font-mono mt-1">Aisle limit: {maxStock} units</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900">₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              id={`cart-del-${item.productId}`}
                              onClick={() => removeFromCart(item.productId)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-slate-200 rounded-none cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Notice */}
          {cart.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 p-4 flex items-start gap-3 rounded-none shadow-none">
              <ShieldCheck className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Database Lock Checked</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Confirming actual physical shelf holds. Checking out will update stock matrices and auto-generate low-stock dashboard notifications.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Customer & Totals form right */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 p-5 rounded-none shadow-none">
          <form onSubmit={handleCheckoutSubmit} className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-2 uppercase tracking-wider">
                <User className="h-4 w-4 text-blue-600" />
                Customer Matrix
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name Description</label>
                  <input
                    type="text"
                    placeholder="Walk-in Retail Customer"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-white px-3 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full bg-white px-3 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Billing Payment method */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-2 uppercase tracking-wider">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Payment Dispatch Channel
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  id="pay-cash"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`p-3 border rounded-none flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'Cash' ? 'border-blue-600 bg-white text-blue-700 font-extrabold ring-1 ring-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Banknote className="h-4 w-4" /> Cash
                </button>
                <button
                  type="button"
                  id="pay-card"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-3 border rounded-none flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'Card' ? 'border-blue-600 bg-white text-blue-700 font-extrabold ring-1 ring-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="h-4 w-4" /> Card
                </button>
                <button
                  type="button"
                  id="pay-upi"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 border rounded-none flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'UPI' ? 'border-blue-600 bg-white text-blue-700 font-extrabold ring-1 ring-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="h-4 w-4" /> UPI Scan
                </button>
                <button
                  type="button"
                  id="pay-account"
                  onClick={() => setPaymentMethod('On Account')}
                  className={`p-3 border rounded-none flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'On Account' ? 'border-blue-600 bg-white text-blue-700 font-extrabold ring-1 ring-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <User className="h-4 w-4" /> On Account
                </button>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-slate-200 pt-4 space-y-2.5 text-xs text-slate-500 font-sans">
              <div className="flex justify-between">
                <span>Total Cart Cost:</span>
                <span className="font-mono font-bold text-slate-800">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span>Discount Deduction (₹):</span>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discountAmount || ''}
                  onChange={e => setDiscountAmount(Math.min(subtotal, Number(e.target.value)))}
                  className="w-20 bg-white border border-slate-300 px-1.5 py-0.5 text-xs font-mono font-bold text-right focus:outline-hidden focus:ring-1 focus:ring-blue-600 rounded-none"
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pl-2">
                <span>CGST @ 9%:</span>
                <span className="font-mono">₹{(calculatedTax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pl-2">
                <span>SGST @ 9%:</span>
                <span className="font-mono">₹{(calculatedTax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between">
                <span>Integrated GST ({taxRate}%):</span>
                <span className="font-mono text-slate-800">₹{calculatedTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-950 font-bold border-t border-slate-200 pt-3">
                <span className="flex items-center gap-1 uppercase tracking-wide">
                  <Receipt className="h-4 w-4 text-slate-400" />
                  Net Total Invoice:
                </span>
                <span className="text-base text-blue-600 font-mono font-bold">₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Checkout Action button */}
            <button
              type="submit"
              id="checkout-btn"
              disabled={cart.length === 0}
              className={`w-full py-3.5 rounded-none text-white text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                cart.length === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Dispatch & Invoice <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Completed Printable Invoice Overlay Modal */}
      {completedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-none border border-slate-300 w-full max-w-2xl overflow-hidden shadow-none">
            {/* Header toolbar */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 border border-emerald-200 flex items-center gap-1 uppercase tracking-wider">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Dispatch Registry Complete
              </span>

              <div className="flex gap-2">
                <button
                  id="print-invoice-btn"
                  onClick={() => window.print()}
                  className="bg-white hover:bg-slate-150 text-slate-700 text-xs font-bold px-3 py-1.5 border border-slate-300 flex items-center gap-1 rounded-none cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Invoice
                </button>
                <button
                  id="close-invoice-btn"
                  onClick={() => setCompletedInvoice(null)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-1 rounded-none cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Formatted Invoice Body */}
            <div className="p-8 space-y-6 bg-white overflow-y-auto max-h-[500px]" id="invoice-print-section">
              {/* Warehouse Logo and Meta info */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-950 flex items-center gap-1.5 tracking-wider uppercase">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    APEX WAREHOUSE SYSTEMS
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1.5">Main Storage & Dispatch Complex, Bay 4</p>
                  <p className="text-[11px] text-slate-500">commercial-ops@apexlogistics.com</p>
                </div>

                <div className="text-right">
                  <h3 className="text-base font-bold text-slate-900 tracking-wider uppercase">COMMERCIAL INVOICE</h3>
                  <p className="text-xs font-mono font-bold text-slate-600 mt-1">{completedInvoice.invoiceNumber}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    {new Date(completedInvoice.date).toLocaleDateString()} {new Date(completedInvoice.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Client & Billing channel parameters */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 border border-slate-200 text-xs">
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Bill To Client:</p>
                  <p className="text-xs font-bold text-slate-900 mt-1">{completedInvoice.customerName}</p>
                  {completedInvoice.customerPhone && (
                    <p className="text-slate-500 mt-0.5 font-mono">Phone: {completedInvoice.customerPhone}</p>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Payment Specifications:</p>
                  <p className="text-xs font-bold text-blue-700 mt-1 uppercase">Method: {completedInvoice.paymentMethod}</p>
                  <p className="text-slate-500 mt-0.5">Payment Status: Settled / Confirmed</p>
                </div>
              </div>

              {/* Items grid */}
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Product Descriptor</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {completedInvoice.items.map(item => (
                    <tr key={item.productId} className="text-slate-800">
                      <td className="py-3 font-semibold">{item.name}</td>
                      <td className="py-3 text-right font-mono">₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 text-center font-bold font-mono">{item.quantity}</td>
                      <td className="py-3 text-right font-bold font-mono">₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* invoice math summary */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <div className="w-72 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-slate-800">₹{completedInvoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  {completedInvoice.discount > 0 && (
                    <div className="flex justify-between text-rose-700 font-bold">
                      <span>Discount deduction:</span>
                      <span className="font-mono">-₹{completedInvoice.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400 pl-2">
                    <span>CGST @ 9%:</span>
                    <span className="font-mono">₹{(completedInvoice.tax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between text-slate-400 pl-2">
                    <span>SGST @ 9%:</span>
                    <span className="font-mono">₹{(completedInvoice.tax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>GST Tax Surcharge (18%):</span>
                    <span className="font-mono font-bold text-slate-800">₹{completedInvoice.tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-950 font-bold border-t border-slate-200 pt-2.5">
                    <span className="uppercase tracking-wider">Total Invoice Due:</span>
                    <span className="font-mono text-blue-600 text-sm font-bold">₹{completedInvoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* footer note */}
              <div className="text-center text-[10px] text-slate-400 border-t border-slate-150 pt-6 font-mono">
                <p className="font-bold uppercase tracking-wider text-slate-500">Apex System Dispatch Notice</p>
                <p className="mt-1">Verify all package seal counts at the dock before dispatching. Returns must occur within 14 business days.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

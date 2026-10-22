import React, { useState } from 'react';
import { Transaction, Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, IndianRupee, Receipt, ShoppingBag, Eye, Trash2, ArrowRight, Printer, RefreshCw, Layers } from 'lucide-react';

interface SalesReportProps {
  transactions: Transaction[];
  products: Product[];
  onVoidTransaction: (transactionId: string) => void;
}

export default function SalesReport({ transactions, products, onVoidTransaction }: SalesReportProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);

  // Math totals
  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
  const totalInvoices = transactions.length;
  const avgOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

  // Calculate profit margin
  let totalCostOfSales = 0;
  transactions.forEach(tx => {
    tx.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        totalCostOfSales += (prod.cost * item.quantity);
      } else {
        // Fallback default 60% cost if product deleted
        totalCostOfSales += (item.price * 0.6 * item.quantity);
      }
    });
  });
  const grossProfit = totalRevenue - totalCostOfSales;

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => 
    tx.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Chart 1: Revenue by Invoice data
  const barChartData = transactions.slice(-8).map(tx => ({
    name: tx.invoiceNumber.replace('INV-2026-', 'INV-'),
    Revenue: Number(tx.total.toFixed(2)),
    Profit: Number((tx.total - tx.items.reduce((sum, item) => {
      const prod = products.find(p => p.id === item.productId);
      return sum + ((prod?.cost || item.price * 0.6) * item.quantity);
    }, 0)).toFixed(2))
  }));

  // Chart 2: Category sales breakdown
  const categorySalesMap: { [key: string]: number } = {};
  transactions.forEach(tx => {
    tx.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const cat = prod?.category || 'Deleted Items';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.total;
    });
  });

  const pieColors = ['#0f172a', '#2563eb', '#10b981', '#f59e0b', '#64748b', '#0284c7'];
  const pieChartData = Object.keys(categorySalesMap).map((cat, idx) => ({
    name: cat,
    value: Number(categorySalesMap[cat].toFixed(2)),
    color: pieColors[idx % pieColors.length]
  }));

  // Calculate top products
  const productQuantityMap: { [key: string]: { name: string; qty: number; revenue: number } } = {};
  transactions.forEach(tx => {
    tx.items.forEach(item => {
      if (!productQuantityMap[item.productId]) {
        productQuantityMap[item.productId] = { name: item.name, qty: 0, revenue: 0 };
      }
      productQuantityMap[item.productId].qty += item.quantity;
      productQuantityMap[item.productId].revenue += item.total;
    });
  });

  const topProducts = Object.values(productQuantityMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const handleVoidInvoice = (id: string, invNum: string) => {
    if (window.confirm(`Are you absolutely sure you want to VOID invoice ${invNum}? This will replenish all deducted stock items back into the warehouse and delete this sales transaction record.`)) {
      onVoidTransaction(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 KPI Metric boxes with sharp left borders for geometric balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rev */}
        <div className="bg-white p-5 border-l-4 border-l-blue-600 border border-slate-200 rounded-none shadow-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Revenue Stream</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1.5 font-mono">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-2 bg-slate-100 text-slate-700">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Operational Target Active</span>
          </div>
        </div>

        {/* Profit */}
        <div className="bg-white p-5 border-l-4 border-l-emerald-600 border border-slate-200 rounded-none shadow-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Net Profit Yield</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1.5 font-mono">₹{grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-2 bg-slate-100 text-slate-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[10px] text-slate-600 font-bold font-mono uppercase tracking-wider">
            <span className="bg-slate-100 border border-slate-200 text-slate-800 px-1.5 py-0.5">
              {totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(0) : 0}% Net Margins
            </span>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white p-5 border-l-4 border-l-slate-900 border border-slate-200 rounded-none shadow-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Invoices Processed</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1.5 font-mono">{totalInvoices} Bills</h3>
            </div>
            <div className="p-2 bg-slate-100 text-slate-700">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-4 flex items-center gap-1.5 font-mono uppercase tracking-wider">
            <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
            Real-Time Sync Active
          </div>
        </div>

        {/* Avg Value */}
        <div className="bg-white p-5 border-l-4 border-l-amber-500 border border-slate-200 rounded-none shadow-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average Ticket Value</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1.5 font-mono">₹{avgOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-2 bg-slate-100 text-slate-700">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-wider font-mono">
            Qty Factor: ~2.4 Units
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts & Top Selling Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar chart - Revenue trends */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-none shadow-none">
          <h3 className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Billing Revenue Dispatch Stream
          </h3>
          
          <div className="h-64 mt-2">
            {barChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs uppercase tracking-wider font-mono">
                Awaiting sales transactions to map trends
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={9} stroke="#64748b" tickLine={false} />
                  <YAxis fontSize={9} stroke="#64748b" tickLine={false} />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '']} />
                  <Bar dataKey="Revenue" fill="#2563eb" barSize={35} />
                  <Bar dataKey="Profit" fill="#10b981" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie chart / Category breakdown */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-none shadow-none">
          <h3 className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
            <Layers className="h-4 w-4 text-blue-600" />
            Category Revenue Share
          </h3>

          <div className="h-64 relative flex flex-col justify-between">
            {pieChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs uppercase tracking-wider font-mono">
                No categorization logs recorded yet
              </div>
            ) : (
              <>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom legends for labels */}
                <div className="space-y-1 max-h-24 overflow-y-auto mt-2 text-[10px]">
                  {pieChartData.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between font-bold text-slate-500 uppercase tracking-wide">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 shrink-0 rounded-none" style={{ backgroundColor: entry.color }}></span>
                        <span className="truncate max-w-[120px]">{entry.name}</span>
                      </div>
                      <span className="font-mono text-slate-900 font-bold">₹{entry.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Top Products & Historical invoices panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 items */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-none shadow-none flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
              <ShoppingBag className="h-4 w-4 text-blue-600" />
              Top Products Sold
            </h3>

            <div className="space-y-2">
              {topProducts.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center font-mono uppercase tracking-wide">Process sales to index volume stats.</p>
              ) : (
                topProducts.map((prod, idx) => {
                  const medalColors = [
                    'bg-slate-900 text-white font-extrabold border-slate-950', 
                    'bg-slate-100 text-slate-700 font-extrabold border-slate-300', 
                    'bg-slate-50 text-slate-600 border-slate-200', 
                    'bg-white text-slate-500 border-slate-200', 
                    'bg-white text-slate-400 border-slate-200'
                  ];
                  return (
                    <div key={idx} className="flex items-center justify-between p-2.5 border border-slate-200 rounded-none text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5.5 h-5.5 rounded-none flex items-center justify-center text-[10px] border ${medalColors[idx] || 'bg-slate-100'}`}>
                          {idx + 1}
                        </span>
                        <p className="font-bold text-slate-900 truncate max-w-[130px]" title={prod.name}>
                          {prod.name}
                        </p>
                      </div>

                      <div className="text-right text-[11px] font-mono font-bold text-slate-800">
                        <p>{prod.qty} units</p>
                        <p className="text-[9px] text-slate-400 font-normal mt-0.5">₹{prod.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="text-[9px] text-slate-400 text-center border-t border-slate-150 pt-4 mt-4 font-mono uppercase tracking-wider">
            Computed Dynamically Across Logs
          </div>
        </div>

        {/* Full Ledger invoices list */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-none shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Receipt className="h-4 w-4 text-blue-600" />
              Invoices Sales Ledger
            </h3>

            <input
              type="text"
              placeholder="Search ledger by client, method, or invoice..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600 w-full sm:w-64 rounded-none"
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-none">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Invoice / Timestamp</th>
                  <th className="p-3">Client Account</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Volume Dispatch</th>
                  <th className="p-3 font-mono text-right">Invoice Total</th>
                  <th className="p-3 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 font-mono uppercase tracking-wide">
                      No invoices found in sales database.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/55">
                      <td className="p-3">
                        <p className="font-bold font-mono text-blue-600">{tx.invoiceNumber}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                          {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      <td className="p-3 font-bold text-slate-900">{tx.customerName}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-none">
                          {tx.paymentMethod}
                        </span>
                      </td>

                      <td className="p-3 text-slate-650">
                        {tx.items.reduce((sum, i) => sum + i.quantity, 0)} units
                        <span className="block text-[10px] text-slate-400">({tx.items.length} lines)</span>
                      </td>

                      <td className="p-3 font-bold font-mono text-right text-slate-950">₹{tx.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>

                      <td className="p-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <button
                             id={`view-invoice-ledg-${tx.id}`}
                            onClick={() => setSelectedInvoice(tx)}
                            title="View Invoice Receipt"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 rounded-none cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`void-invoice-ledg-${tx.id}`}
                            onClick={() => handleVoidInvoice(tx.id, tx.invoiceNumber)}
                            title="Void and Replenish Stock"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-slate-200 rounded-none cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Selected Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-none border border-slate-300 w-full max-w-lg overflow-hidden shadow-none">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="text-[10px] font-bold font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 uppercase tracking-wider">
                Ledger replica: {selectedInvoice.invoiceNumber}
              </span>
              <button
                id="close-ledger-modal"
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between border-b border-slate-100 pb-3 text-xs">
                <div>
                  <p className="font-bold text-slate-900 uppercase tracking-wide">Client: {selectedInvoice.customerName}</p>
                  <p className="text-slate-500 mt-1 font-mono">Date: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-700 uppercase">Payment: {selectedInvoice.paymentMethod}</p>
                  <p className="text-slate-500 mt-1">Status: Paid / Cleared</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Items Breakdown</p>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-none p-2.5 space-y-1.5 bg-slate-50">
                  {selectedInvoice.items.map(item => (
                    <div key={item.productId} className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.name} (x{item.quantity})</span>
                      <span className="font-mono font-bold text-slate-800">₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1 border-t border-slate-100 pt-3 text-xs text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{selectedInvoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-rose-700 font-bold">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{selectedInvoice.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>GST Surcharge (18%):</span>
                  <span className="font-mono">₹{selectedInvoice.tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-950 text-xs font-bold border-t border-slate-200 pt-1.5 mt-1.5 uppercase tracking-wider">
                  <span>Total Settled:</span>
                  <span className="font-mono text-blue-600 font-extrabold text-sm">₹{selectedInvoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                id="ledger-print-btn"
                onClick={() => window.print()}
                className="bg-white hover:bg-slate-150 text-slate-700 text-xs font-bold px-3 py-2 border border-slate-300 flex items-center gap-1.5 rounded-none cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" /> Print Copy
              </button>
              <button
                id="ledger-done-btn"
                onClick={() => setSelectedInvoice(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-none cursor-pointer"
              >
                Close Replica
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

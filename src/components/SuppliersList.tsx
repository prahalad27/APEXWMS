import React, { useState } from 'react';
import { Supplier, Product } from '../types';
import { Truck, Plus, Mail, Phone, MapPin, Package, AlertCircle, RefreshCw } from 'lucide-react';

interface SuppliersListProps {
  suppliers: Supplier[];
  products: Product[];
  onAddSupplier: (supplier: Supplier) => void;
}

export default function SuppliersList({ suppliers, products, onAddSupplier }: SuppliersListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: ''
  });

  // Calculate stats for each supplier
  const getSupplierStats = (supplierId: string) => {
    const supplierProducts = products.filter(p => p.supplierId === supplierId);
    const lowStockCount = supplierProducts.filter(p => p.stock <= p.reorderLevel).length;
    return {
      totalProducts: supplierProducts.length,
      lowStockCount
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.email) return;

    onAddSupplier({
      id: `sup_${Date.now()}`,
      ...newSupplier
    });

    setNewSupplier({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: ''
    });
    setShowAddModal(false);
  };

  const triggerReorderEmail = (supplier: Supplier, product: Product) => {
    const subject = encodeURIComponent(`Purchase Order request: ${product.name}`);
    const body = encodeURIComponent(
      `Hi ${supplier.contactName},\n\n` +
      `We would like to place an urgent restocking order for the following item due to low warehouse levels:\n\n` +
      `Product: ${product.name}\n` +
      `SKU: ${product.sku}\n` +
      `Current Stock in Warehouse: ${product.stock} units\n` +
      `Reorder Unit Quantity: 50 units (Standard Pack)\n\n` +
      `Please confirm dispatch details, estimated delivery time, and issue the corresponding invoice to our accounts team.\n\n` +
      `Best regards,\n` +
      `Warehouse Operations Manager`
    );
    window.open(`mailto:${supplier.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-none shadow-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Truck className="h-4.5 w-4.5 text-blue-600" />
            Supplier Partnership Hub
          </h2>
          <p className="text-xs text-slate-500">Manage supply chain partners, contact accounts, and coordinate reorder dispatches</p>
        </div>

        <button
          id="add-supplier-btn"
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-none inline-flex items-center gap-2 transition-colors duration-150"
        >
          <Plus className="h-4 w-4" /> Add Partner Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(supplier => {
          const stats = getSupplierStats(supplier.id);
          const lowStockProducts = products.filter(
            p => p.supplierId === supplier.id && p.stock <= p.reorderLevel
          );

          return (
            <div key={supplier.id} className="border border-slate-200 rounded-none p-5 bg-white flex flex-col justify-between transition-all duration-150 hover:bg-slate-50/40">
              <div>
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div>
                    <h3 className="font-bold text-slate-950 text-sm leading-tight uppercase tracking-wide">{supplier.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Rep: {supplier.contactName}</p>
                  </div>
                  <span className="bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-none tracking-wider uppercase shrink-0">
                    {stats.totalProducts} {stats.totalProducts === 1 ? 'line' : 'lines'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-5 font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-450 shrink-0" />
                    <span className="truncate text-[11px]" title={supplier.email}>{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-455 shrink-0" />
                    <span className="text-[11px] font-mono">{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-450 shrink-0" />
                    <span className="truncate text-[11px]" title={supplier.address}>{supplier.address}</span>
                  </div>
                </div>
              </div>

              {/* Warnings and dispatch links */}
              <div className="border-t border-slate-200 pt-4 mt-auto">
                {stats.lowStockCount > 0 ? (
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-3">
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                      <span>{stats.lowStockCount} lines trigger reorder alerts!</span>
                    </div>

                    <div className="space-y-1.5">
                      {lowStockProducts.map(prod => (
                        <div key={prod.id} className="flex items-center justify-between bg-amber-50/50 p-2 border border-amber-200 rounded-none">
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">Inward: {prod.stock} / {prod.reorderLevel}</p>
                          </div>
                          <button
                            id={`reorder-${prod.id}`}
                            onClick={() => triggerReorderEmail(supplier, prod)}
                            className="bg-white hover:bg-amber-100 border border-amber-200 text-amber-900 text-[9px] font-bold py-1 px-2 rounded-none flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="h-2.5 w-2.5" /> Reorder
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1.5 py-1">
                    <span className="w-2 h-2 bg-emerald-500"></span>
                    All lines fully stocked
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-none border border-slate-300 w-full max-w-md overflow-hidden shadow-none">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider text-xs">
                <Truck className="h-4.5 w-4.5 text-blue-600" />
                Add Partner Company
              </h3>
              <button
                id="close-supplier-modal"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Company Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Globex Global Corp"
                  value={newSupplier.name}
                  onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Representative *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Smith"
                  value={newSupplier.contactName}
                  onChange={e => setNewSupplier({ ...newSupplier, contactName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Coordinates *</label>
                  <input
                    type="email"
                    required
                    placeholder="sales@company.com"
                    value={newSupplier.email}
                    onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={newSupplier.phone}
                    onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Physical Address Directory</label>
                <textarea
                  placeholder="123 Industrial Dr, Suite 500"
                  value={newSupplier.address}
                  onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 resize-none font-medium"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-none shadow-none cursor-pointer"
                >
                  Create Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

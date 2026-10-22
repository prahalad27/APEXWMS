import React, { useState } from 'react';
import { Product, Supplier } from '../types';
import { Search, Plus, Edit2, Trash2, Filter, AlertTriangle, AlertCircle, ArrowUpDown, ChevronDown, CheckCircle, Tag, Warehouse, Mail } from 'lucide-react';

interface InventoryListProps {
  products: Product[];
  suppliers: Supplier[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

type StockFilter = 'all' | 'low' | 'out' | 'healthy';

export default function InventoryList({ products, suppliers, onAddProduct, onUpdateProduct, onDeleteProduct }: InventoryListProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Add/Edit Product Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const [formFields, setFormFields] = useState({
    name: '',
    sku: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    reorderLevel: 5,
    aisle: 'A',
    shelf: '1',
    supplierId: ''
  });

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Sorting and Filtering
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          product.sku.includes(search) || 
                          product.category.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = product.stock > 0 && product.stock <= product.reorderLevel;
    } else if (stockFilter === 'out') {
      matchesStock = product.stock === 0;
    } else if (stockFilter === 'healthy') {
      matchesStock = product.stock > product.reorderLevel;
    }

    return matchesSearch && matchesCategory && matchesStock;
  }).sort((a, b) => {
    let fieldA: any = a[sortBy];
    let fieldB: any = b[sortBy];

    if (sortBy === 'name') {
      fieldA = a.name.toLowerCase();
      fieldB = b.name.toLowerCase();
    }

    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: 'name' | 'stock' | 'price') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormFields({
      name: '',
      sku: '',
      category: 'Electronics',
      price: 0,
      cost: 0,
      stock: 10,
      reorderLevel: 5,
      aisle: 'A',
      shelf: '1',
      supplierId: suppliers[0]?.id || ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setFormFields({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      reorderLevel: product.reorderLevel,
      aisle: product.location.aisle,
      shelf: product.location.shelf,
      supplierId: product.supplierId
    });
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.name || !formFields.sku || !formFields.category) return;

    const productPayload: Product = {
      id: isEditing && currentProduct ? currentProduct.id : `prod_${Date.now()}`,
      name: formFields.name,
      sku: formFields.sku,
      category: formFields.category,
      price: Number(formFields.price),
      cost: Number(formFields.cost),
      stock: Number(formFields.stock),
      reorderLevel: Number(formFields.reorderLevel),
      location: {
        aisle: formFields.aisle,
        shelf: formFields.shelf
      },
      supplierId: formFields.supplierId
    };

    if (isEditing) {
      onUpdateProduct(productPayload);
    } else {
      onAddProduct(productPayload);
    }

    setShowModal(false);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to remove this product from the warehouse inventory?')) {
      onDeleteProduct(productId);
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-none shadow-none">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Warehouse className="h-4.5 w-4.5 text-blue-600" />
            Stock Catalog Registry
          </h2>
          <p className="text-xs text-slate-500">Record, organize, locate, and monitor enterprise physical assets</p>
        </div>

        <button
          id="add-product-btn"
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-none inline-flex items-center gap-2 transition-colors duration-150"
        >
          <Plus className="h-4 w-4" /> Add Product SKU
        </button>
      </div>

      {/* Searching & Filters Controls */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6 bg-slate-50 p-4 border border-slate-200 rounded-none shadow-none">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search database by description, UPC, category, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-sans"
          />
          <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap gap-4 text-xs font-semibold">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Tag className="h-3 w-3" /> Type:
            </span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-none py-1.5 px-2.5 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600 capitalize"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="h-3 w-3" /> Stock level:
            </span>
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as StockFilter)}
              className="bg-white border border-slate-300 rounded-none py-1.5 px-2.5 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All listings</option>
              <option value="low">Low Stock alerts</option>
              <option value="out">Out of Stock lines</option>
              <option value="healthy">In Stock (Healthy)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Table Grid */}
      <div className="overflow-x-auto border border-slate-200 rounded-none shadow-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none font-sans">
              <th className="py-4 px-4">Product Descriptor & SKU</th>
              <th className="py-4 px-4">Category</th>
              <th className="py-4 px-4 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('price')}>
                <div className="flex items-center gap-1">
                  Value <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-4 px-4 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('stock')}>
                <div className="flex items-center gap-1">
                  Qty / Alert <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-4 px-4">Warehouse Location</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs font-medium">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  <AlertCircle className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="font-bold text-slate-900 uppercase text-xs tracking-wide">No inventory matches found</p>
                  <p className="text-[11px] text-slate-500 mt-1">Refine your query coordinates or create a new entry.</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock > 0 && product.stock <= product.reorderLevel;
                const stockPct = Math.min((product.stock / (product.reorderLevel * 3)) * 100, 100);

                return (
                  <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Item and SKU */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-sm leading-snug">{product.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wide">SKU ID: {product.sku}</div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
                        {product.category}
                      </span>
                    </td>

                    {/* Price & Cost */}
                    <td className="py-4 px-4 font-mono">
                      <div className="font-bold text-slate-900">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div className="text-[10px] text-slate-450 mt-0.5">Cost: ₹{product.cost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </td>

                    {/* Stock status bar */}
                    <td className="py-4 px-4 min-w-[160px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold font-mono text-xs ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-700'}`}>
                          {product.stock} units
                        </span>
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 text-[9px] bg-rose-50 font-bold px-1.5 py-0.2 border border-rose-200 uppercase tracking-wider">
                            <AlertCircle className="h-2.5 w-2.5" /> Out
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 text-[9px] bg-amber-50 font-bold px-1.5 py-0.2 border border-amber-200 uppercase tracking-wider">
                            <AlertTriangle className="h-2.5 w-2.5" /> Low
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-800 text-[9px] bg-emerald-50 font-bold px-1.5 py-0.2 border border-emerald-200 uppercase tracking-wider">
                            <CheckCircle className="h-2.5 w-2.5" /> OK
                          </span>
                        )}
                      </div>
                      
                      {/* Visual progress alert bar */}
                      <div className="w-full bg-slate-100 h-1 rounded-none overflow-hidden border border-slate-200/50">
                        <div
                          className={`h-full ${isOutOfStock ? 'bg-slate-300' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${isOutOfStock ? 0 : stockPct}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* Location mapping */}
                    <td className="py-4 px-4">
                      <div className="font-mono text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Warehouse className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        Aisle {product.location.aisle} • Shelf {product.location.shelf}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          id={`edit-prod-${product.id}`}
                          onClick={() => handleOpenEdit(product)}
                          title="Edit Stock Information"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors rounded-none border border-transparent hover:border-slate-200"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          id={`delete-prod-${product.id}`}
                          onClick={() => handleDelete(product.id)}
                          title="Purge Stock Line"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors rounded-none border border-transparent hover:border-slate-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-none border border-slate-300 w-full max-w-lg overflow-hidden shadow-none">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider text-xs">
                <Warehouse className="h-4.5 w-4.5 text-blue-600" />
                {isEditing ? 'Modify Warehouse Product' : 'Add New Warehouse Product'}
              </h3>
              <button
                id="close-product-modal"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Product Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell Curved LED Display 27 inch"
                  value={formFields.name}
                  onChange={e => setFormFields({ ...formFields, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Barcode & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Barcode / SKU UPC *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 741029384852"
                    value={formFields.sku}
                    onChange={e => setFormFields({ ...formFields, sku: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electronics, Furniture"
                    value={formFields.category}
                    onChange={e => setFormFields({ ...formFields, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Price, Cost, Stock, Reorder */}
              <div className="grid grid-cols-4 gap-3 font-mono">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formFields.price || ''}
                    onChange={e => setFormFields({ ...formFields, price: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formFields.cost || ''}
                    onChange={e => setFormFields({ ...formFields, cost: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Inward Qty *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formFields.stock === 0 ? '0' : formFields.stock}
                    onChange={e => setFormFields({ ...formFields, stock: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Low Alert *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formFields.reorderLevel || ''}
                    onChange={e => setFormFields({ ...formFields, reorderLevel: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-amber-700 font-bold"
                  />
                </div>
              </div>

              {/* Warehouse coordinate allocation */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Aisle Locator</label>
                  <select
                    value={formFields.aisle}
                    onChange={e => setFormFields({ ...formFields, aisle: e.target.value })}
                    className="w-full px-2 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="A">Aisle A (Tech)</option>
                    <option value="B">Aisle B (Screen/Wire)</option>
                    <option value="C">Aisle C (Large Items)</option>
                    <option value="D">Aisle D (Dispatch/Box)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Shelf Level</label>
                  <select
                    value={formFields.shelf}
                    onChange={e => setFormFields({ ...formFields, shelf: e.target.value })}
                    className="w-full px-2 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="1">Shelf 1 (Bottom)</option>
                    <option value="2">Shelf 2 (Mid-Low)</option>
                    <option value="3">Shelf 3 (Mid-High)</option>
                    <option value="4">Shelf 4 (Top High)</option>
                  </select>
                </div>

                {/* Primary Supplier linkage */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Linked Supplier</label>
                  <select
                    value={formFields.supplierId}
                    onChange={e => setFormFields({ ...formFields, supplierId: e.target.value })}
                    className="w-full px-2 py-2 text-xs border border-slate-350 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  >
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-none shadow-none cursor-pointer"
                >
                  {isEditing ? 'Commit Changes' : 'Register SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

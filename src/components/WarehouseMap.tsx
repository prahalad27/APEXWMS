import React, { useState } from 'react';
import { Product } from '../types';
import { Grid, Layers, MapPin, Package, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface WarehouseMapProps {
  products: Product[];
  onQuickAddStock: (productId: string, amount: number) => void;
}

export default function WarehouseMap({ products, onQuickAddStock }: WarehouseMapProps) {
  const aisles = ['A', 'B', 'C', 'D'];
  const shelves = ['1', '2', '3', '4'];
  const [selectedSlot, setSelectedSlot] = useState<{ aisle: string; shelf: string } | null>(null);

  // Get products in a specific slot
  const getProductsInSlot = (aisle: string, shelf: string) => {
    return products.filter(p => p.location.aisle === aisle && p.location.shelf === shelf);
  };

  // Determine slot status color
  const getSlotStatus = (aisle: string, shelf: string) => {
    const slotProducts = getProductsInSlot(aisle, shelf);
    if (slotProducts.length === 0) return { bg: 'bg-slate-50 border-slate-200 text-slate-400', label: 'Empty' };
    
    const hasOutOfStock = slotProducts.some(p => p.stock === 0);
    const hasLowStock = slotProducts.some(p => p.stock > 0 && p.stock <= p.reorderLevel);

    if (hasOutOfStock) return { bg: 'bg-rose-50 border-rose-200 text-rose-700', label: 'Out of Stock' };
    if (hasLowStock) return { bg: 'bg-amber-50 border-amber-200 text-amber-700', label: 'Low Stock' };
    return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', label: 'In Stock' };
  };

  const selectedSlotProducts = selectedSlot 
    ? getProductsInSlot(selectedSlot.aisle, selectedSlot.shelf)
    : [];

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-none shadow-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-blue-600" />
            Zone Tracker & Locator
          </h2>
          <p className="text-xs text-slate-500">Physical layout map and real-time bay utilization indices</p>
        </div>
        
        {/* Legends */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-emerald-50 border border-emerald-200 rounded-none"></div>
            <span className="text-slate-600">Stock OK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-amber-50 border border-amber-200 rounded-none"></div>
            <span className="text-slate-600">Low Stock</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-rose-50 border border-rose-200 rounded-none"></div>
            <span className="text-slate-600">Out of Stock</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-slate-50 border border-slate-200 rounded-none"></div>
            <span className="text-slate-600">Empty Bay</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual Map Grid */}
        <div className="lg:col-span-8 overflow-x-auto">
          <div className="min-w-[480px]">
            {/* Shelf Headers */}
            <div className="grid grid-cols-5 mb-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
              <div>Aisles</div>
              {shelves.map(shelf => (
                <div key={shelf}>Shelf {shelf}</div>
              ))}
            </div>

            {/* Aisle Rows */}
            <div className="space-y-3">
              {aisles.map(aisle => (
                <div key={aisle} className="grid grid-cols-5 gap-3 items-center">
                  {/* Aisle Label */}
                  <div className="bg-slate-100 py-4 font-bold text-center text-slate-700 border border-slate-200 text-xs tracking-wider uppercase rounded-none">
                    Aisle {aisle}
                  </div>

                  {/* Shelves for this Aisle */}
                  {shelves.map(shelf => {
                    const status = getSlotStatus(aisle, shelf);
                    const slotProducts = getProductsInSlot(aisle, shelf);
                    const isSelected = selectedSlot?.aisle === aisle && selectedSlot?.shelf === shelf;

                    return (
                      <button
                        key={shelf}
                        id={`slot-${aisle}-${shelf}`}
                        onClick={() => setSelectedSlot({ aisle, shelf })}
                        className={`p-3 h-24 border text-left transition-all duration-150 flex flex-col justify-between rounded-none ${status.bg} ${
                          isSelected ? 'ring-2 ring-blue-600 bg-white shadow-none' : 'hover:border-slate-450'
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-xs font-bold font-mono text-slate-900 bg-white/70 px-1.5 py-0.5 border border-slate-200/40">
                            {aisle}{shelf}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">
                            {status.label}
                          </span>
                        </div>
                        <div className="text-xs mt-2 truncate w-full">
                          {slotProducts.length === 0 ? (
                            <span className="italic opacity-60 text-[11px]">Empty slot</span>
                          ) : (
                            <div className="font-bold text-slate-900">
                              {slotProducts.length} {slotProducts.length === 1 ? 'item' : 'items'}
                              <span className="block text-[10px] font-normal text-slate-500 truncate mt-0.5">
                                {slotProducts.map(p => p.name).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Slot Drawer / Panel */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 p-5 flex flex-col justify-between min-h-[300px] rounded-none shadow-none">
          {selectedSlot ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4.5 w-4.5 text-blue-600" />
                <h3 className="font-bold text-slate-950 uppercase text-xs tracking-wider">
                  Location Bay {selectedSlot.aisle}{selectedSlot.shelf}
                </h3>
              </div>

              {selectedSlotProducts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Package className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-700">No items assigned</p>
                  <p className="text-[11px] mt-1 text-slate-500">Go to Stock Catalog tab to assign items to Aisle {selectedSlot.aisle}, Shelf {selectedSlot.shelf}.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                  {selectedSlotProducts.map(product => {
                    const isLow = product.stock <= product.reorderLevel;
                    const isOut = product.stock === 0;

                    return (
                      <div key={product.id} className="bg-white p-3.5 border border-slate-200 rounded-none shadow-none">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate max-w-[160px]" title={product.name}>
                            {product.name}
                          </h4>
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 text-[9px] px-1.5 py-0.5 font-bold tracking-wider uppercase">
                              Out
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] px-1.5 py-0.5 font-bold tracking-wider uppercase">
                              Low
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] px-1.5 py-0.5 font-bold tracking-wider uppercase">
                              OK
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 text-[11px] text-slate-500 mb-3 gap-y-1 font-mono">
                          <div>SKU: <span className="font-bold text-slate-700">{product.sku}</span></div>
                          <div>Type: <span className="text-slate-700">{product.category}</span></div>
                          <div>Stock: <span className="font-bold text-slate-800">{product.stock} pcs</span></div>
                          <div>Price: <span className="font-bold text-slate-800">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                        </div>

                        <div className="flex items-center gap-1.5 border-t border-slate-100 pt-2.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mr-1">Inward:</span>
                          <button
                            id={`add-1-${product.id}`}
                            onClick={() => onQuickAddStock(product.id, 5)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-none border border-slate-200"
                          >
                            +5
                          </button>
                          <button
                            id={`add-2-${product.id}`}
                            onClick={() => onQuickAddStock(product.id, 10)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-none border border-slate-200"
                          >
                            +10
                          </button>
                          <button
                            id={`add-3-${product.id}`}
                            onClick={() => onQuickAddStock(product.id, 25)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-1 rounded-none ml-auto"
                          >
                            +25 Pack
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <Info className="h-6 w-6 mx-auto text-slate-400 mb-3" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">No Bay Selected</p>
              <p className="text-[11px] text-slate-500">Select a bay on the warehouse map grid to inspect inventory levels and restock units instantly.</p>
            </div>
          )}

          {selectedSlot && selectedSlotProducts.length > 0 && (
            <div className="border-t border-slate-200 mt-4 pt-3 text-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                Aisle {selectedSlot.aisle} • Shelf {selectedSlot.shelf} Locator Active
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

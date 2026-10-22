import React, { useState } from 'react';
import { Product } from '../types';
import { Scan, Package, PlusCircle, MinusCircle, ShoppingCart, Search, AlertCircle, Sparkles, Check } from 'lucide-react';

interface BarcodeScannerProps {
  products: Product[];
  onQuickAddStock: (productId: string, amount: number) => void;
  onQuickDeductStock: (productId: string, amount: number) => void;
  onAddToBill: (product: Product) => void;
}

export default function BarcodeScanner({ products, onQuickAddStock, onQuickDeductStock, onAddToBill }: BarcodeScannerProps) {
  const [skuInput, setSkuInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [searchError, setSearchError] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Handle a barcode scan trigger
  const handleScanSKU = (sku: string) => {
    const found = products.find(p => p.sku === sku || p.id === sku);
    if (found) {
      setScannedProduct(found);
      setSkuInput(sku);
      setSearchError(false);
      triggerSuccessMessage('Product identified successfully!');
    } else {
      setScannedProduct(null);
      setSearchError(true);
      setTimeout(() => setSearchError(false), 3000);
    }
  };

  const triggerSuccessMessage = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleManualSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuInput.trim()) return;
    handleScanSKU(skuInput.trim());
  };

  const executeInward = (amount: number) => {
    if (!scannedProduct) return;
    onQuickAddStock(scannedProduct.id, amount);
    // update state in screen
    setScannedProduct({
      ...scannedProduct,
      stock: scannedProduct.stock + amount
    });
    triggerSuccessMessage(`Inward shipment logged: +${amount} units`);
  };

  const executeOutward = (amount: number) => {
    if (!scannedProduct) return;
    if (scannedProduct.stock < amount) {
      alert('Insufficient warehouse stock for this outward shipment!');
      return;
    }
    onQuickDeductStock(scannedProduct.id, amount);
    // update state in screen
    setScannedProduct({
      ...scannedProduct,
      stock: scannedProduct.stock - amount
    });
    triggerSuccessMessage(`Outward shipment logged: -${amount} units`);
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-none shadow-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Scan className="h-4.5 w-4.5 text-blue-600" />
            Barcode & SKU Hub
          </h2>
          <p className="text-xs text-slate-500">Scan product SKU barcodes, simulate laser feeds, and process fast inventory shipments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scanning Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main search bar simulating physical scanner reading */}
          <div className="bg-slate-50 p-5 border border-slate-200 rounded-none shadow-none">
            <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Scan className="h-4 w-4 text-slate-500" />
              Physical Scanner Interface
            </h3>
            
            <form onSubmit={handleManualSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Scan or enter barcode SKU..."
                  value={skuInput}
                  onChange={e => setSkuInput(e.target.value)}
                  className="w-full bg-white pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono"
                />
                <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
              </div>
              <button
                type="submit"
                id="search-sku-btn"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 rounded-none transition-colors duration-150 shrink-0"
              >
                Scan SKU
              </button>
            </form>

            {searchError && (
              <div className="mt-3 flex items-center gap-2 text-rose-700 bg-rose-50 text-[11px] font-bold p-2.5 rounded-none border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>SKU/Barcode not found in database.</span>
              </div>
            )}
          </div>

          {/* Rapid Simulation Panel - Extremely helpful for test reviews */}
          <div className="bg-slate-50 p-5 border border-slate-200 rounded-none shadow-none">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-blue-500" />
                Handheld Laser Simulator
              </h3>
              <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 font-bold tracking-widest uppercase">Demo Tool</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Click a box component below to simulate pulling a handheld laser gun trigger against its physical SKU barcode label:
            </p>

            <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {products.map(product => (
                <button
                  key={product.id}
                  id={`simulate-scan-${product.id}`}
                  onClick={() => handleScanSKU(product.sku)}
                  className={`p-2.5 bg-white hover:bg-slate-100 text-left border rounded-none text-xs transition-all duration-150 flex flex-col justify-between h-20 ${
                    scannedProduct?.id === product.id ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200'
                  }`}
                >
                  <div className="font-bold text-slate-950 truncate w-full" title={product.name}>
                    {product.name}
                  </div>
                  <div className="flex justify-between items-center w-full mt-1.5 font-mono">
                    <span className="text-[9px] text-slate-450 truncate max-w-[80px]">{product.sku}</span>
                    <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2">
                      {product.stock} units
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scan Results Screen */}
        <div className="lg:col-span-7 flex flex-col h-full">
          {scannedProduct ? (
            <div className="border border-slate-200 p-6 bg-white flex-1 flex flex-col justify-between rounded-none shadow-none">
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[9px] bg-blue-50 border border-blue-200 text-blue-700 font-bold px-2 py-0.5 tracking-wider uppercase">
                      Barcode Decoded
                    </span>
                    <h3 className="text-base font-bold text-slate-950 mt-1.5">{scannedProduct.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      SKU barcode: <span className="font-mono font-bold text-slate-700">{scannedProduct.sku}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Physical Coordinates</p>
                    <p className="text-sm font-bold text-blue-600 font-mono mt-0.5 uppercase">
                      Aisle {scannedProduct.location.aisle} • Shelf {scannedProduct.location.shelf}
                    </p>
                  </div>
                </div>

                {actionSuccess && (
                  <div className="mt-4 flex items-center gap-1.5 text-emerald-800 bg-emerald-50 text-xs font-bold p-2.5 rounded-none border border-emerald-100">
                    <Check className="h-4 w-4" />
                    <span>{actionSuccess}</span>
                  </div>
                )}

                {/* Technical Product Parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="bg-slate-50 p-3 border border-slate-150 rounded-none">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current Stock</p>
                    <p className={`text-base font-bold mt-1 font-mono ${scannedProduct.stock === 0 ? 'text-rose-600' : scannedProduct.stock <= scannedProduct.reorderLevel ? 'text-amber-600' : 'text-slate-900'}`}>
                      {scannedProduct.stock}
                    </p>
                    <span className="text-[9px] text-slate-500 block mt-0.5">units in store</span>
                  </div>

                  <div className="bg-slate-50 p-3 border border-slate-150 rounded-none">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Retail Price</p>
                    <p className="text-base font-bold text-slate-900 mt-1 font-mono">
                      ₹{scannedProduct.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-[9px] text-slate-500 block mt-0.5">per unit selling</span>
                  </div>

                  <div className="bg-slate-50 p-3 border border-slate-150 rounded-none">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Supply Cost</p>
                    <p className="text-base font-bold text-slate-900 mt-1 font-mono">
                      ₹{scannedProduct.cost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
                      +{(((scannedProduct.price - scannedProduct.cost) / scannedProduct.cost) * 100).toFixed(0)}% Margin
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 border border-slate-150 rounded-none">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reorder Line</p>
                    <p className="text-base font-bold text-slate-900 mt-1 font-mono">
                      {scannedProduct.reorderLevel}
                    </p>
                    <span className="text-[9px] text-slate-500 block mt-0.5">low alert point</span>
                  </div>
                </div>
              </div>

              {/* Inward/Outward Warehouse Actions */}
              <div className="mt-8 border-t border-slate-150 pt-5 space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inward & Outward Logistics</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Stock Inward Action */}
                  <div className="bg-emerald-50/40 p-3 border border-emerald-100 flex flex-col justify-between gap-3 rounded-none">
                    <div>
                      <h5 className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 uppercase tracking-wide">
                        <PlusCircle className="h-3.5 w-3.5" /> Stock Inward
                      </h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">Receive new supplies</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        id="inward-10"
                        onClick={() => executeInward(10)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 flex-1 rounded-none transition-colors"
                      >
                        +10
                      </button>
                      <button
                        id="inward-50"
                        onClick={() => executeInward(50)}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-1.5 flex-1 rounded-none transition-colors"
                      >
                        +50
                      </button>
                    </div>
                  </div>

                  {/* Stock Outward Action */}
                  <div className="bg-rose-50/40 p-3 border border-rose-100 flex flex-col justify-between gap-3 rounded-none">
                    <div>
                      <h5 className="text-[11px] font-bold text-rose-800 flex items-center gap-1 uppercase tracking-wide">
                        <MinusCircle className="h-3.5 w-3.5" /> Stock Outward
                      </h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">Deduct warehouse count</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        id="outward-5"
                        onClick={() => executeOutward(5)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-1.5 flex-1 rounded-none transition-colors"
                      >
                        -5
                      </button>
                      <button
                        id="outward-20"
                        onClick={() => executeOutward(20)}
                        className="bg-rose-800 hover:bg-rose-900 text-white font-bold text-xs py-1.5 flex-1 rounded-none transition-colors"
                      >
                        -20
                      </button>
                    </div>
                  </div>

                  {/* Dispatch / POS Bill Addition */}
                  <div className="bg-blue-50/40 p-3 border border-blue-100 flex flex-col justify-between gap-3 rounded-none">
                    <div>
                      <h5 className="text-[11px] font-bold text-blue-800 flex items-center gap-1 uppercase tracking-wide">
                        <ShoppingCart className="h-3.5 w-3.5" /> Billing Terminal
                      </h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">Queue items for checkout</p>
                    </div>
                    
                    <button
                      id="direct-to-billing-btn"
                      onClick={() => {
                        onAddToBill(scannedProduct);
                        triggerSuccessMessage('Added to checkout cart successfully!');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-none transition-colors w-full flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="h-3 w-3" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-slate-200 p-12 text-center flex flex-col items-center justify-center flex-1 bg-slate-50 rounded-none shadow-none">
              <div className="bg-white p-4 border border-slate-200 mb-4 rounded-none">
                <Scan className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Awaiting Scan Feeds</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
                Aim the handheld laser or type a catalog barcode. Click any simulated listing on the left panel to trigger automatic UPC readings.
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center mt-6 text-[10px] text-slate-400 font-mono">
                <span className="bg-white px-2 py-1 border border-slate-200">Logitech MX: 097855171122</span>
                <span className="bg-white px-2 py-1 border border-slate-200">Keychron: 693302251144</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

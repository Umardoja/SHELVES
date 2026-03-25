"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Loader2, CheckCircle, Download, Search, X } from "lucide-react";
import { useStore, Product, Sale } from "@/hooks/useStore";
import { useToast } from "@/context/ToastContext";

export default function SalesPage() {
  const { products, sales, isLoading, recordSale } = useStore();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [salesSearch, setSalesSearch] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isRecording, setIsRecording] = useState(false);
  const [showProductResults, setShowProductResults] = useState(false);

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast("Select a product first", "error");
      return;
    }

    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      toast("Enter a valid quantity", "error");
      return;
    }

    setIsRecording(true);
    try {
      const result = await recordSale(selectedProduct, qty);
      toast(`Sale recorded! Revenue: ₦${result.totalRevenue?.toLocaleString()} 🎉`, "success");
      setSelectedProduct("");
      setProductSearch("");
      setQuantity("1");
    } catch (err: any) {
      toast(err.message || "Could not record sale", "error");
    } finally {
      setIsRecording(false);
    }
  };

  const downloadCSV = () => {
    if (sales.length === 0) return;

    const headers = ["Date", "Product Name", "Quantity Sold", "Revenue (NGN)"];
    
    const rows = sales.map((sale: Sale) => [
      new Date(sale.date).toLocaleString("en-NG").replace(/,/g, ""), // Remove inner commas for CSV
      `"${sale.productName}"`, // Escape quotes
      sale.quantity,
      sale.totalRevenue
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r: any[]) => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter((p: Product) => 
    p.stock > 0 && 
    (p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
     p.productCode.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const filteredSales = sales.filter((s: Sale) => 
    s.productName.toLowerCase().includes(salesSearch.toLowerCase()) ||
    new Date(s.date).toLocaleDateString().includes(salesSearch)
  );

  const selectedProductData = products.find((p: Product) => p._id === selectedProduct);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-blue)] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[var(--color-text-primary)] mb-1">Record Sale</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">Sell an item and track your money</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-8">
        {/* Record Sale Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--color-surface)]/30 border border-[var(--color-border)] rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[var(--color-blue)]" />
              New Sale
            </h2>

            <form onSubmit={handleRecordSale} className="space-y-5">
              <div className="relative">
                <label className="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-2">
                  Search & Select Product
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Search by name or code..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductResults(true);
                      if (!e.target.value) setSelectedProduct("");
                    }}
                    onFocus={() => setShowProductResults(true)}
                    className="w-full bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-3 text-[var(--color-text-primary)] placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  {productSearch && (
                    <button 
                      type="button"
                      onClick={() => { setProductSearch(""); setSelectedProduct(""); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showProductResults && productSearch && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute z-50 w-full mt-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                    >
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((p) => (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => {
                              setSelectedProduct(p._id);
                              setProductSearch(p.name);
                              setShowProductResults(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:text-white bg-[var(--color-surface)] transition-colors border-b border-[var(--color-border)] last:border-0 ${selectedProduct === p._id ? 'bg-[var(--color-orange)]' : ''}`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-[var(--color-text-primary)]">{p.name}</span>
                              <span className="text-[10px] font-black text-[var(--color-blue)]">₦{p.sellingPrice?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[10px] text-[var(--color-text-secondary)]">Code: {p.productCode}</span>
                              <span className="text-[10px] text-[var(--color-text-secondary)]">{p.stock} in stock</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-[var(--color-text-secondary)] italic">No products found</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-2">
                  How Many?
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProductData?.stock || 999}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  required
                />
              </div>

              {selectedProductData && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-white bg-[var(--color-orange)] border border-[var(--color-border)]/10 rounded-xl p-4 space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">Price each</span>
                    <span className="text-[var(--color-text-primary)] font-bold">₦{selectedProductData.sellingPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">Qty</span>
                    <span className="text-[var(--color-text-primary)] font-bold">×{quantity}</span>
                  </div>
                  <div className="border-t border-[var(--color-border)] pt-2 flex justify-between">
                    <span className="text-[var(--color-text-secondary)] font-bold">Total</span>
                    <span className="text-[var(--color-blue)] font-black text-lg">
                      ₦{(selectedProductData.sellingPrice * parseInt(quantity || "0")).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isRecording || !selectedProduct}
                className="w-full py-4 bg-gradient-brand rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-[var(--color-purple)]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isRecording ? (
                  <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Record Sale
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Recent Sales */}
        <div className="lg:col-span-3">
          <div className="bg-[var(--color-surface)]/30 border border-[var(--color-border)] rounded-2xl overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-[var(--color-border)] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Recent Sales</h2>
                {sales.length > 0 && (
                  <button
                    onClick={downloadCSV}
                    className="px-4 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-primary)] transition-all flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download All
                  </button>
                )}
              </div>

              {/* Sales Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                <input
                  type="text"
                  placeholder="Filter recent sales by product or date..."
                  value={salesSearch}
                  onChange={(e) => setSalesSearch(e.target.value)}
                  className="w-full bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-2.5 text-xs text-[var(--color-text-primary)] placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[500px]">
              {filteredSales.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingCart className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-[var(--color-text-secondary)] text-sm">{salesSearch ? "No sales match your search" : "No sales recorded yet"}</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredSales.slice(0, 7).map((sale: Sale, i: number) => (
                    <motion.div
                      key={sale._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="px-6 py-4 flex items-center justify-between hover:bg-[var(--color-surface)]/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg text-white bg-[var(--color-green)]/10 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-[var(--color-green)]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--color-text-primary)]">{sale.productName}</p>
                          <p className="text-[10px] text-slate-600">
                            {new Date(sale.date).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[var(--color-green)]">+₦{sale.totalRevenue?.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-600 font-medium">{sale.quantity} sold</p>
                      </div>
                    </motion.div>
                  ))}
                  {filteredSales.length > 7 && (
                    <div className="px-6 py-3 text-center bg-[var(--color-surface)]/[0.01]">
                        <p className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-widest">Showing last 7 transactions</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

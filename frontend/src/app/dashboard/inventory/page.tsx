"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, Package, Loader2, AlertCircle } from "lucide-react";
import { useStore, Product } from "@/hooks/useStore";
import InventoryModal from "@/components/dashboard/InventoryModal";
import { useToast } from "@/context/ToastContext";

export default function InventoryPage() {
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filtered = products.filter((p: Product) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.productCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (data: any) => {
    try {
      await addProduct(data);
      toast("Product added successfully! ✅", "success");
    } catch (err: any) {
      toast(err.message || "Could not add product", "error");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (editingProduct) {
      try {
        await updateProduct(editingProduct._id, data);
        toast("Product updated! ✅", "success");
        setEditingProduct(null);
      } catch (err: any) {
        toast(err.message || "Could not update product", "error");
      }
    } else {
      await handleAdd(data);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(product._id);
      toast("Product deleted", "success");
    } catch (err: any) {
      toast(err.message || "Could not delete product", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-blue)] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-[var(--color-text-primary)] mb-1">Your Stock</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">{products.length} items total</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
            <input
              placeholder="Search stock..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="h-11 px-4 md:px-5 md:py-2.5 bg-gradient-brand rounded-xl text-[10px] md:text-xs font-bold text-white flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-[var(--color-purple)]/20"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[var(--color-text-secondary)] mb-2">No stock yet</h3>
          <p className="text-slate-600 text-sm mb-6">Add your first product to get started</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-[var(--color-orange)] rounded-xl text-sm font-bold text-white"
          >
            Add Your First Item
          </button>
        </motion.div>
      ) : (
        <div className="bg-[var(--color-surface)]/30 border border-[var(--color-border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-3 md:px-6 py-3 md:py-4 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Name</th>
                  <th className="text-left px-3 md:px-6 py-3 md:py-4 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest hidden md:table-cell">Code</th>
                  <th className="text-right px-3 md:px-6 py-3 md:py-4 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Stock</th>
                  <th className="text-right px-3 md:px-6 py-3 md:py-4 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest hidden md:table-cell">Cost (₦)</th>
                  <th className="text-right px-3 md:px-6 py-3 md:py-4 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Selling (₦)</th>
                  <th className="text-center px-3 md:px-6 py-3 md:py-4 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Status</th>
                  <th className="text-right px-3 md:px-6 py-3 md:py-4 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product: Product, i: number) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface)]/[0.02] transition-colors"
                  >
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">{product.name}</p>
                      <p className="text-[10px] text-slate-600">{product.category}</p>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs font-mono text-[var(--color-text-secondary)] hidden md:table-cell">{product.productCode}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right text-sm font-bold text-[var(--color-text-primary)]">{product.stock}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right text-sm text-[var(--color-text-secondary)] hidden md:table-cell">₦{product.costPrice?.toLocaleString()}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right text-sm font-bold text-[var(--color-text-primary)]">₦{product.sellingPrice?.toLocaleString()}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        product.status === "In Stock"
                          ? "text-white bg-[var(--color-green)]/10 text-[var(--color-green)]"
                          : product.status === "Low Stock"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {product.status === "Low Stock" && <AlertCircle className="w-3 h-3" />}
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-blue)] transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
        onSave={handleSave}
        initialData={editingProduct}
      />
    </div>
  );
}

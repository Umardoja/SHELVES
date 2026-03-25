"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Save, PackagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore, Product } from "@/hooks/useStore";
import { useToast } from "@/context/ToastContext";

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  product?: Product | null;
}

export function ProductDialog({
  isOpen,
  onClose,
  title,
  product,
}: ProductDialogProps) {
  const { addProduct, updateProduct } = useStore();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (product) {
        const isCustom = ![
          "Building Materials",
          "Food Stuff",
          "Clothing",
          "Shoes",
          "Bags",
          "Cars",
          "Gadgets",
        ].includes(product.category);
        setShowCustomCategory(isCustom);
      } else {
        setShowCustomCategory(false);
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const name = formData.get("name") as string;
    const stock = parseInt(formData.get("stock") as string);
    const price = parseInt(formData.get("price") as string);
    const description = formData.get("description") as string;
    let category = formData.get("category") as string;
    const customCategory = formData.get("customCategory") as string;

    if (category === "Others" && customCategory) {
      category = customCategory;
    }

    if (!name || isNaN(stock) || isNaN(price) || !category) {
      toast("Please fill all fields correctly", "error");
      return;
    }

    try {
      if (product) {
        updateProduct(product._id, {
          name,
          stock,
          sellingPrice: price,
          category,
          description,
        });
        toast("Updated successfully", "success");
      } else {
        addProduct({
          name,
          stock,
          sellingPrice: price,
          costPrice: 0,
          category,
          description,
        });
        toast("Item added successfully", "success");
      }
      onClose();
    } catch (err: any) {
      toast(err.message || "Something went wrong", "error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto md:flex md:items-center md:justify-center md:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[var(--color-bg)]/80 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full md:max-w-lg md:max-h-[90vh] md:rounded-[2.5rem] rounded-none bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl shadow-[var(--color-purple)]/10 flex flex-col min-h-screen md:h-auto"
          >
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="flex flex-col h-full overflow-hidden"
            >
              <div className="p-8 pb-4 shrink-0">
                <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
                  {title}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-2 space-y-6">
                {/* Item Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--color-text-secondary)]">
                    Item Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={product?.name || ""}
                    className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)]"
                  />
                </div>

                {/* Description - SINGLE ROW */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">
                    Description
                  </label>

                  <textarea
                    name="description"
                    rows={1}
                    defaultValue={product?.description || ""}
                    placeholder="Enter short description..."
                    className="w-full px-5 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl text-sm text-[var(--color-text-primary)] 
               focus:outline-none focus:border-[var(--color-border)] focus:ring-1 focus:ring-indigo-500/50 
               transition-all placeholder:text-slate-700 resize-none"
                  />
                </div>

                {/* Quantity + Price */}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="stock"
                    type="number"
                    defaultValue={product?.stock || ""}
                    placeholder="Quantity"
                    className="px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)]"
                  />
                  <input
                    name="price"
                    type="number"
                    defaultValue={product?.sellingPrice || ""}
                    placeholder="Price"
                    className="px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)]"
                  />
                </div>
              </div>

              <div className="p-8 border-t border-[var(--color-border)]">
                <button
                  type="submit"
                  className="w-full py-3 bg-[var(--color-orange)] text-white rounded-xl font-semibold"
                >
                  {product ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

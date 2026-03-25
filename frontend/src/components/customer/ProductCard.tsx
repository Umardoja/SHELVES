"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, Store, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    _id: string;
    productCode: string;
    name: string;
    sellingPrice: number;
    category: string;
    stock: number;
    merchant?: {
      _id: string;
      businessName: string;
      phone: string;
    };
    description?: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amt);
  };

  return (
    <div className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-[var(--color-border)]/50 hover:bg-[var(--color-surface)]/[0.07] transition-all duration-300">
      <div className="mb-3 md:mb-4">
        <div className="text-white bg-[var(--color-purple)]/10 text-[var(--color-blue)] px-2 py-1 rounded inline-block text-[10px] font-black uppercase tracking-widest border border-[var(--color-purple)]/20 mb-2">
          {product.category}
        </div>
      </div>

      <div className="space-y-1 mb-4 md:mb-6">
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-wider mb-1">
          <Store className="w-3 h-3" />
          <span className="truncate">{product.merchant?.businessName || "Verified Merchant"}</span>
        </div>
        <Link href={`/shop/product/${product._id}`}>
          <h3 className="font-extrabold text-[var(--color-text-primary)] text-lg md:text-xl line-clamp-2 leading-tight group-hover:text-[var(--color-blue)] transition-colors">
            {product.name}
          </h3>
        </Link>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--color-border)]">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Price</span>
          <span className="text-lg md:text-xl font-black text-[var(--color-text-primary)]">
            {formatCurrency(product.sellingPrice)}
          </span>
        </div>
        <button
          onClick={() => {
            addToCart(product, 1);
            toast(`${product.name} added to cart!`, "success");
          }}
          className="bg-[var(--color-orange)] text-white p-2.5 md:p-3 rounded-lg md:rounded-xl hover:bg-[var(--color-orange)] transition-colors shadow-lg shadow-[var(--color-orange)]/20 active:scale-95"
          title="Add to cart"
        >
          <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

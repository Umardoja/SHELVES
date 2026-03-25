"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

// ==================== TYPES (aligned to MongoDB schemas) ====================

export interface Product {
    _id: string;
    productCode: string;
    name: string;
    category: string;
    stock: number;
    sellingPrice: number;
    costPrice: number;
    merchant: string;
    createdAt: string;
    updatedAt: string;
    description?: string;
    // Computed on frontend
    status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface Sale {
    _id: string;
    merchantId: string;
    productId: string;
    productName: string;
    quantity: number;
    totalRevenue: number;
    totalProfit: number;
    date: string;
}

export interface Report {
    totalRevenue: number;
    totalItems: number;
    totalProfit: number;
    totalProducts: number;
    totalStockValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    salesCount: number;
}

function computeStatus(stock: number): Product["status"] {
    if (stock <= 0) return "Out of Stock";
    if (stock <= 10) return "Low Stock";
    return "In Stock";
}

// ==================== HOOK ====================

export function useStore() {
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [report, setReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const fetchedRef = useRef(false);

    // ---- FETCH PRODUCTS ----
    const fetchProducts = useCallback(async () => {
        try {
            const res = await apiGet("/api/products");
            const items = (res.data || []).map((p: any) => ({
                ...p,
                status: computeStatus(p.stock),
            }));
            setProducts(items);
        } catch (err) {
            console.error("Fetch products error:", err);
        }
    }, []);

    // ---- FETCH SALES ----
    const fetchSales = useCallback(async () => {
        try {
            const res = await apiGet("/api/sales");
            setSales(res.data || []);
        } catch (err) {
            console.error("Fetch sales error:", err);
        }
    }, []);

    // ---- FETCH REPORT ----
    const fetchReport = useCallback(async () => {
        try {
            const res = await apiGet("/api/reports/dashboard");
            setReport(res.data || null);
        } catch (err) {
            console.error("Fetch report error:", err);
        }
    }, []);

    // ---- FETCH DASHBOARD STATS (Aggregated) ----
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const fetchDashboardStats = useCallback(async (range = 'week', start?: string, end?: string) => {
        try {
            let url = `/api/reports/dashboard?range=${range}`;
            if (range === 'custom' && start && end) {
                url += `&start=${start}&end=${end}`;
            }
            const res = await apiGet(url);
            setDashboardStats(res.data);
            return res.data;
        } catch (err) {
            console.error("Fetch dashboard stats error:", err);
        }
    }, []);

    // ---- INITIAL LOAD ----
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        async function loadAll() {
            setIsLoading(true);
            try {
                await Promise.all([fetchProducts(), fetchSales(), fetchReport()]);
            } finally {
                setIsLoading(false);
                setIsInitialized(true);
            }
        }

        // Only fetch if we have a token
        const token = localStorage.getItem("shelves_token");
        if (token) {
            loadAll();
        } else {
            setIsLoading(false);
            setIsInitialized(true);
        }
    }, [fetchProducts, fetchSales, fetchReport]);

    // ---- ADD PRODUCT ----
    const addProduct = async (product: {
        name: string;
        stock: number;
        sellingPrice: number;
        costPrice: number;
        category?: string;
        description?: string;
    }) => {
        const res = await apiPost("/api/products", product);
        const newProduct = { ...res.data, status: computeStatus(res.data.stock) };
        setProducts(prev => [newProduct, ...prev]);
        return newProduct;
    };

    // ---- UPDATE PRODUCT ----
    const updateProduct = async (id: string, updates: Partial<Product>) => {
        const res = await apiPut(`/api/products/${id}`, updates);
        const updated = { ...res.data, status: computeStatus(res.data.stock) };
        setProducts(prev =>
            prev.map(p => (p._id === id ? updated : p))
        );
        return updated;
    };

    // ---- DELETE PRODUCT ----
    const deleteProduct = async (id: string) => {
        await apiDelete(`/api/products/${id}`);
        setProducts(prev => prev.filter(p => p._id !== id));
    };

    // ---- RECORD SALE ----
    const recordSale = async (productId: string, quantity: number) => {
        const res = await apiPost("/api/sales", { productId, quantity });
        const saleData = res.data;

        // Add to local sales list
        if (saleData.sale) {
            setSales(prev => [saleData.sale, ...prev]);
        }

        // Update local product stock
        if (saleData.updatedProduct) {
            setProducts(prev =>
                prev.map(p =>
                    p._id === saleData.updatedProduct._id
                        ? { ...saleData.updatedProduct, status: computeStatus(saleData.updatedProduct.stock) }
                        : p
                )
            );
        }

        return saleData;
    };

    // ---- REFRESH ALL ----
    const refresh = useCallback(async () => {
        await Promise.all([fetchProducts(), fetchSales(), fetchReport()]);
    }, [fetchProducts, fetchSales, fetchReport]);

    return {
        products,
        sales,
        report,
        isLoading,
        isInitialized,
        addProduct,
        updateProduct,
        deleteProduct,
        recordSale,
        dashboardStats,
        fetchDashboardStats,
        fetchProducts,
        fetchSales,
        fetchReport,
    };
}

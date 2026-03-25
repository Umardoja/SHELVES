"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, setToken, removeToken, hasToken } from "@/lib/api";

interface User {
  _id: string;
  phone: string;
  name: string;
  businessName: string;
  businessType: string;
  email: string;
  currency: string;
  merchantCode?: string;
  storeCode?: string;
  preferences: {
    notifications: {
      sms: boolean;
      email: boolean;
      app: boolean;
    };
  };
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  smsCredits?: number;
  smsFreeMonthly?: number;
  smsUsedThisMonth?: number;
  subscriptionPlan?: string;
  roles: {
    isCustomer: boolean;
    isMerchant: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string, redirectTo?: string) => Promise<any>;
  merchantLogin: (phone: string, password: string) => Promise<any>;
  register: (data: {
    name: string;
    businessName: string;
    businessType: string;
    phone: string;
    password: string;
    isMerchant?: boolean;
  }, redirectTo?: string) => Promise<void>;
  checkPhone: (phone: string) => Promise<{
    exists: boolean;
    hasPassword: boolean;
    businessName?: string;
  }>;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<any>;
  setPassword: (phone: string, password: string, redirectTo?: string) => Promise<void>;
  updateUser: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function hydrateSession() {
      if (hasToken()) {
        const savedUser = localStorage.getItem("shelves_user");
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            removeToken();
            localStorage.removeItem("shelves_user");
          }
        }

        // Silently fetch fresh profile to update any missing generated properties (like storeCode)
        try {
          const freshUser = await apiGet("/api/user/profile");
          if (mounted && freshUser) {
            localStorage.setItem("shelves_user", JSON.stringify(freshUser));
            setUser(freshUser);
          }
        } catch (err) {
          console.warn("Silent profile hydration failed. Continuing with local cache.");
        }
      }
      if (mounted) setIsLoading(false);
    }

    hydrateSession();

    return () => { mounted = false; };
  }, []);

  const saveSession = (token: string, userData: User) => {
    setToken(token);
    localStorage.setItem("shelves_user", JSON.stringify(userData));
    setUser(userData);
  };

  // ---- LOGIN (phone + password) ----
  const login = async (phone: string, password: string, redirectTo?: string) => {
    const res = await apiPost("/api/auth/login", { phone, password });
    saveSession(res.token, res.user);
    router.push(redirectTo || "/dashboard");
    return res;
  };

  // ---- MERCHANT STRICT LOGIN ----
  const merchantLogin = async (phone: string, password: string) => {
    const res = await apiPost("/api/auth/merchant-login", { phone, password });
    saveSession(res.token, res.user);
    router.push("/dashboard");
    return res;
  };

  // ---- REGISTER (web - with password) ----
  const register = async (data: {
    name: string;
    businessName: string;
    businessType: string;
    phone: string;
    password: string;
    isMerchant?: boolean;
  }, redirectTo?: string) => {
    const res = await apiPost("/api/auth/register", data);
    saveSession(res.token, res.user);
    // If we're coming from the shop, redirect to shop/marketplace
    router.push(redirectTo || (data.isMerchant === false ? "/shop" : "/dashboard"));
  };

  // ---- CHECK PHONE (does user exist? has password?) ----
  const checkPhone = async (phone: string) => {
    const res = await apiPost("/api/auth/check-phone", { phone });
    return {
      exists: res.exists,
      hasPassword: res.hasPassword,
      businessName: res.businessName,
    };
  };

  // ---- SEND OTP (for USSD users migrating to web) ----
  const sendOtp = async (phone: string) => {
    await apiPost("/api/auth/send-otp", { phone });
  };

  // ---- VERIFY OTP ----
  const verifyOtp = async (phone: string, otp: string) => {
    const res = await apiPost("/api/auth/verify-otp", { phone, otp });
    // After OTP verification, save temporary session
    saveSession(res.token, res.user);
    return res;
  };

  // ---- SET PASSWORD (after OTP verification) ----
  const setPasswordFn = async (phone: string, password: string, redirectTo?: string) => {
    const res = await apiPost("/api/auth/set-password", { phone, password });
    saveSession(res.token, res.user);
    router.push(redirectTo || "/dashboard");
  };

  // ---- UPDATE USER LOCAL ----
  const updateUser = (userData: User) => {
    localStorage.setItem("shelves_user", JSON.stringify(userData));
    setUser(userData);
  };

  // ---- LOGOUT ----
  const logout = () => {
    removeToken();
    localStorage.removeItem("shelves_user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        merchantLogin,
        register,
        checkPhone,
        sendOtp,
        verifyOtp,
        setPassword: setPasswordFn,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

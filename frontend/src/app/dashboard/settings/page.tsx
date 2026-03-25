"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Shield, 
  Bell, 
  Save, 
  Store,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Mail,
  Zap,
  Plus
} from "lucide-react";
import Script from "next/script";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { apiPut } from "@/lib/api";
import { apiGet } from "@/lib/api";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? ""
  });

  const [businessForm, setBusinessForm] = useState({
    businessName: user?.businessName ?? "",
    businessType: user?.businessType ?? "General",
    currency: user?.currency ?? "₦"
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [prefsForm, setPrefsForm] = useState({
    notifications: {
      sms: user?.preferences?.notifications?.sms ?? true,
      email: user?.preferences?.notifications?.email ?? false,
      app: user?.preferences?.notifications?.app ?? true
    }
  });

  const [bankForm, setBankForm] = useState({
    bankName: user?.bankName ?? "",
    accountName: user?.accountName ?? "",
    accountNumber: user?.accountNumber ?? ""
  });

  useEffect(() => {
    if (user) {
      setProfileForm({ 
        name: user.name ?? "", 
        email: user.email ?? "" 
      });
      setBusinessForm({ 
        businessName: user.businessName ?? "", 
        businessType: user.businessType ?? "General", 
        currency: user.currency ?? "₦" 
      });
      setPrefsForm({
        notifications: { 
          sms: user.preferences?.notifications?.sms ?? true,
          email: user.preferences?.notifications?.email ?? false,
          app: user.preferences?.notifications?.app ?? true
        }
      });
      setBankForm({
        bankName: user.bankName ?? "",
        accountName: user.accountName ?? "",
        accountNumber: user.accountNumber ?? ""
      });
    }
  }, [user]);

  // ---- SAVE HANDLERS ----

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await apiPut("/api/user/profile", profileForm);
      updateUser(res.user);
      toast("Profile updated successfully", "success");
    } catch (err: any) {
      toast(err.message || "Failed to update profile", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBusiness(true);
    try {
      const res = await apiPut("/api/user/business", businessForm);
      updateUser(res.user);
      toast("Business settings saved", "success");
    } catch (err: any) {
      toast(err.message || "Failed to update business", "error");
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }
    setIsSavingSecurity(true);
    try {
      await apiPut("/api/user/password", {
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword
      });
      setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast("Password updated successfully", "success");
    } catch (err: any) {
      toast(err.message || "Failed to update password", "error");
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBank(true);
    try {
      const res = await apiPut("/api/user/bank", bankForm);
      updateUser(res.user);
      toast("Bank details saved", "success");
    } catch (err: any) {
      toast(err.message || "Failed to update bank details", "error");
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleSavePrefs = async () => {
    setIsSavingPrefs(true);
    try {
      const res = await apiPut("/api/user/preferences", prefsForm);
      updateUser(res.user);
      toast("Preferences saved", "success");
    } catch (err: any) {
      toast(err.message || "Failed to save preferences", "error");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleBuySMS = (quantity: number, amount: number) => {
    if (typeof window.PaystackPop === "undefined") {
      toast("Paystack is not loaded. Please try again.", "error");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: user?.email || user?.phone + "@shelves.com", // Fallback email
      amount: amount * 100, // Kobo
      currency: "NGN",
      metadata: {
        type: "SMS_CREDIT_PURCHASE",
        quantity: quantity,
        merchantId: user?._id
      },
      callback: (response: any) => {
        toast("Payment successful! Verifying...", "success");
        // Verify on server
        fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference }),
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            toast(`Successfully purchased ${quantity} SMS credits!`, "success");
            // Refresh profile to update balance
            apiGet("/api/user/profile").then(freshUser => updateUser(freshUser));
          } else {
            toast("Verification failed. Please contact support.", "error");
          }
        });
      },
      onClose: () => {
        toast("Payment cancelled", "info");
      }
    });

    handler.openIframe();
  };

  if (!user) return null;

  return (
    <div className="relative pb-24 max-w-5xl mx-auto">
      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="afterInteractive"
      />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
           <div className="w-12 h-1 text-white bg-gradient-brand rounded-full" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-blue)]">Merchant Settings</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-[var(--color-text-primary)] tracking-tight mb-2">
           Account <span className="text-transparent bg-clip-text bg-gradient-brand">Management.</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] font-medium tracking-tight">
           Configure your business identity, security, and notification preferences.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 relative z-10">
        
        {/* Profile Settings */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="glass-card p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-xl group"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
             <div className="w-12 h-12 rounded-2xl text-white bg-[var(--color-purple)]/10 border border-[var(--color-purple)]/20 flex items-center justify-center text-[var(--color-blue)] shadow-lg group-hover:scale-110 transition-transform">
                <User className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">Profile Details</h3>
                <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest leading-none mt-1">PERSONAL INFORMATION</p>
             </div>
          </div>
          
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Full Name</label>
               <input 
                 type="text" 
                 value={profileForm.name ?? ""}
                 onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                 placeholder="e.g. Umar Musa"
                 className="w-full px-6 py-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700"
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Phone Number (Read Only)</label>
               <div className="w-full px-6 py-4 bg-[var(--color-bg)]/30 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-secondary)] flex items-center gap-3">
                  <Lock className="w-4 h-4 opacity-50" />
                  {user.phone}
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Email (Optional)</label>
               <input 
                 type="email" 
                 value={profileForm.email ?? ""}
                 onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                 placeholder="e.g. umar@example.com"
                 className="w-full px-6 py-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700"
               />
            </div>
            <button 
              type="submit" 
              disabled={isSavingProfile}
              className="w-full py-4 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)] flex items-center justify-center gap-3 transition-all"
            >
              {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin text-[var(--color-blue)]" /> : <><Save className="w-4 h-4" /> Save Profile</>}
            </button>
          </form>
        </motion.section>

        {/* Business Settings */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.1 }}
          className="glass-card p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-xl group"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
             <div className="w-12 h-12 rounded-2xl text-white bg-[var(--color-green)]/10 border border-[var(--color-border)]/20 flex items-center justify-center text-[var(--color-green)] shadow-lg group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">Business Info</h3>
                <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest leading-none mt-1">COMPANY IDENTITY</p>
             </div>
          </div>
          
          <form onSubmit={handleSaveBusiness} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Store Code (Read Only)</label>
               <div className="w-full px-6 py-4 bg-[var(--color-bg)]/30 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-secondary)] flex items-center justify-between">
                  <span className="tracking-widest">
                    {(user?.storeCode || user?.merchantCode || "N/A").toUpperCase().replace(/\s/g, '')}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => handleCopy((user?.storeCode || user?.merchantCode || "").toUpperCase().replace(/\s/g, ''))}
                    className="p-2 hover:bg-[var(--color-surface)] rounded-xl transition-colors text-[var(--color-green)] group relative"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100" />}
                  </button>
               </div>
               <p className="text-[10px] text-[var(--color-text-secondary)] ml-1">Customers use this code to access your inventory via USSD.</p>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Business Name</label>
               <input 
                 type="text" 
                 value={businessForm.businessName ?? ""}
                 onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
                 className="w-full px-6 py-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Type of Goods</label>
               <select 
                 value={businessForm.businessType}
                 onChange={(e) => setBusinessForm({ ...businessForm, businessType: e.target.value })}
                 className="w-full px-6 py-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
               >
                  <option>General</option>
                  <option>Building Materials</option>
                  <option>Food Stuff</option>
                  <option>Electronics</option>
                  <option>Fashion</option>
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Default Currency</label>
               <select 
                 value={businessForm.currency}
                 onChange={(e) => setBusinessForm({ ...businessForm, currency: e.target.value })}
                 className="w-full px-6 py-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
               >
                  <option value="₦">Naira (₦)</option>
                  <option value="$">US Dollar ($)</option>
               </select>
            </div>
            <button 
              type="submit" 
              disabled={isSavingBusiness}
              className="w-full py-4 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)] flex items-center justify-center gap-3 transition-all"
            >
              {isSavingBusiness ? <Loader2 className="w-4 h-4 animate-spin text-[var(--color-green)]" /> : <><Save className="w-4 h-4" /> Save Business</>}
            </button>
          </form>
        </motion.section>

        {/* Bank Settings */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.15 }}
          className="glass-card p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-xl group"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
             <div className="w-12 h-12 rounded-2xl text-white bg-[var(--color-orange)] border border-[var(--color-border)]/20 flex items-center justify-center text-[var(--color-blue)] shadow-lg group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">Bank Details</h3>
                <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest leading-none mt-1">PAYMENT RECEPTION</p>
             </div>
          </div>
          
          <form onSubmit={handleSaveBank} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Bank Name</label>
               <input 
                 type="text" 
                 value={bankForm.bankName}
                 onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                 placeholder="e.g. Zenith Bank"
                 className="w-full px-6 py-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-700"
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Account Name</label>
               <input 
                 type="text" 
                 value={bankForm.accountName}
                 onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                 placeholder="e.g. Umar Musa Enterprises"
                 className="w-full px-6 py-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-700"
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Account Number</label>
               <input 
                 type="text" 
                 value={bankForm.accountNumber}
                 onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                 placeholder="e.g. 1234567890"
                 className="w-full px-6 py-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-700"
               />
            </div>
            <button 
              type="submit" 
              disabled={isSavingBank}
              className="w-full py-4 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)] flex items-center justify-center gap-3 transition-all"
            >
              {isSavingBank ? <Loader2 className="w-4 h-4 animate-spin text-[var(--color-blue)]" /> : <><Save className="w-4 h-4" /> Save Bank Details</>}
            </button>
          </form>
        </motion.section>

        {/* Security / Password */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="glass-card p-5 md:p-10 lg:col-span-2 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-xl group"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
             <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-[var(--color-border)]/20 flex items-center justify-center text-amber-400 shadow-lg group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">Security & Privacy</h3>
                <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest leading-none mt-1">PASSWORD PROTECTION</p>
             </div>
          </div>
          
          <form onSubmit={handleSaveSecurity} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Current Password</label>
               <input 
                 type="password" 
                 value={securityForm.currentPassword ?? ""}
                 onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                 className="w-full px-6 py-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                 placeholder="••••••••"
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">New Password</label>
               <input 
                 type="password" 
                 value={securityForm.newPassword ?? ""}
                 onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                 className="w-full px-6 py-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                 placeholder="6+ characters"
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Confirm New Password</label>
               <input 
                 type="password" 
                 value={securityForm.confirmPassword ?? ""}
                 onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                 className="w-full px-6 py-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                 placeholder="Repeat password"
               />
            </div>
            <div className="md:col-span-3">
               <button 
                type="submit" 
                disabled={isSavingSecurity}
                className="w-full md:w-auto px-12 py-4 bg-amber-600/10 border border-[var(--color-border)]/20 hover:bg-amber-600/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                {isSavingSecurity ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Shield className="w-4 h-4" /> Save Security Settings</>}
              </button>
            </div>
          </form>
        </motion.section>

        {/* Preferences / Toggles */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="glass-card p-5 md:p-10 lg:col-span-2 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-xl group"
        >
          <div className="flex items-center gap-4 mb-10">
             <div className="w-12 h-12 rounded-2xl text-white bg-[var(--color-orange)] border border-[var(--color-border)]/20 flex items-center justify-center text-[var(--color-blue)] shadow-lg group-hover:scale-110 transition-transform">
                <Bell className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">System Preferences</h3>
                <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest leading-none mt-1">UX & COMMUNICATIONS</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="p-6 rounded-3xl bg-[var(--color-bg)]/50 border border-[var(--color-border)] space-y-4">
                <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">SMS Alerts</p>
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-[var(--color-text-primary)]">{prefsForm.notifications?.sms ? "On" : "Off"}</span>
                   <button 
                     onClick={() => setPrefsForm({ ...prefsForm, notifications: { ...prefsForm.notifications, sms: !prefsForm.notifications.sms } })}
                     className={`w-12 h-6 rounded-full p-1 transition-all ${prefsForm.notifications?.sms ? 'text-white bg-[var(--color-green)]' : 'bg-[var(--color-bg)]'}`}
                   >
                     <div className={`w-4 h-4 rounded-full bg-[var(--color-surface)] transition-transform ${prefsForm.notifications?.sms ? 'translate-x-6' : 'translate-x-0'}`} />
                   </button>
                </div>
             </div>
             <div className="p-6 rounded-3xl bg-[var(--color-bg)]/50 border border-[var(--color-border)] space-y-4">
                <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Email Notifications</p>
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-[var(--color-text-primary)]">{prefsForm.notifications?.email ? "On" : "Off"}</span>
                   <button 
                     onClick={() => setPrefsForm({ ...prefsForm, notifications: { ...prefsForm.notifications, email: !prefsForm.notifications.email } })}
                     className={`w-12 h-6 rounded-full p-1 transition-all ${prefsForm.notifications?.email ? 'text-white bg-[var(--color-orange)]' : 'bg-[var(--color-bg)]'}`}
                   >
                     <div className={`w-4 h-4 rounded-full bg-[var(--color-surface)] transition-transform ${prefsForm.notifications?.email ? 'translate-x-6' : 'translate-x-0'}`} />
                   </button>
                </div>
             </div>
             <div className="p-6 rounded-3xl bg-[var(--color-bg)]/50 border border-[var(--color-border)] space-y-4">
                <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">App Notifications</p>
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-[var(--color-text-primary)]">{prefsForm.notifications?.app ? "On" : "Off"}</span>
                   <button 
                     onClick={() => setPrefsForm({ ...prefsForm, notifications: { ...prefsForm.notifications, app: !prefsForm.notifications.app } })}
                     className={`w-12 h-6 rounded-full p-1 transition-all ${prefsForm.notifications?.app ? 'text-white bg-[var(--color-orange)]' : 'bg-[var(--color-bg)]'}`}
                   >
                     <div className={`w-4 h-4 rounded-full bg-[var(--color-surface)] transition-transform ${prefsForm.notifications?.app ? 'translate-x-6' : 'translate-x-0'}`} />
                   </button>
                </div>
             </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSavePrefs}
              disabled={isSavingPrefs}
              className="w-full md:w-auto px-10 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)] flex items-center justify-center gap-3 transition-all"
            >
              {isSavingPrefs ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Apply Preferences</>}
            </button>
          </div>
        </motion.section>

        {/* SMS Credits Selection */}
        <motion.section 
          id="sms"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.35 }}
          className="glass-card p-5 md:p-10 lg:col-span-2 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-xl group"
        >
          <div className="flex items-center gap-4 mb-10">
             <div className="w-12 h-12 rounded-2xl text-white bg-[var(--color-purple)]/10 border border-[var(--color-purple)]/20 flex items-center justify-center text-[var(--color-blue)] shadow-lg group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">Buy SMS Credits</h3>
                <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest leading-none mt-1">COMMUNICATION PACKAGES</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { qty: 100, price: 2000, label: "Starter Pack" },
               { qty: 500, price: 9000, label: "Growth Pack" },
               { qty: 1000, price: 17000, label: "Pro Pack" },
             ].map((pkg, i) => (
                <div key={i} className="relative group/pkg p-6 rounded-3xl bg-[var(--color-bg)]/50 border border-[var(--color-border)] hover:border-[var(--color-border)]/30 transition-all flex flex-col items-center text-center">
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--color-orange)] rounded-full text-[8px] font-black text-white uppercase tracking-widest">
                      {pkg.label}
                   </div>
                   <h4 className="text-3xl font-black text-[var(--color-text-primary)] mt-4">{pkg.qty}</h4>
                   <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-6">SMS UNITS</p>
                   
                   <div className="text-xl font-black text-[var(--color-blue)] mb-6">₦{pkg.price.toLocaleString()}</div>
                   
                   <button 
                     onClick={() => handleBuySMS(pkg.qty, pkg.price)}
                     className="w-full py-3 bg-[var(--color-surface)] hover:bg-[var(--color-orange)] border border-[var(--color-border)] hover:border-[var(--color-border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 group-hover/pkg:scale-[1.02]"
                   >
                     <Plus className="w-4 h-4" />
                     Buy Now
                   </button>
                </div>
             ))}
          </div>
          
          <div className="mt-10 p-6 rounded-2xl text-white bg-[var(--color-orange)] border border-[var(--color-border)]/10 flex items-start gap-4">
             <Zap className="w-5 h-5 text-[var(--color-blue)] flex-shrink-0 mt-1" />
             <div className="space-y-1">
                <p className="text-xs font-bold text-[var(--color-text-primary)]">Why buy credits?</p>
                <p className="text-[10px] text-[var(--color-text-secondary)] font-medium leading-relaxed">
                   Free monthly SMS are used first. Purchased credits never expire and are used only when your free allocation is depleted. Perfect for high-volume broadcast campaigns.
                </p>
             </div>
          </div>
        </motion.section>

      </div>

      <div className="fixed bottom-0 right-0 w-80 h-80 text-white bg-[var(--color-orange)]/5 blur-[120px] pointer-events-none rounded-full" />
    </div>
  );
}

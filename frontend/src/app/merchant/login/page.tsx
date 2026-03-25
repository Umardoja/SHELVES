"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoveLeft, ArrowRight, Store, Lock, Phone, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MerchantLoginPage() {
  const router = useRouter();
  const { merchantLogin } = useAuth();
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await merchantLogin(phoneNumber, password);
      toast("Welcome back to your dashboard!", "success");
      // The context routing handles push to /dashboard
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
      toast(err.message || "Login failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] relative overflow-hidden">
      {/* Background styling for Merchant identity */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 text-white bg-[var(--color-orange)]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 text-white bg-[var(--color-green)]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-sm"
        >
          <MoveLeft className="w-4 h-4" /> Back
        </button>

        <div className="glass-card p-8 rounded-3xl shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 text-white bg-[var(--color-purple)]/10 border border-[var(--color-purple)]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-[var(--color-blue)]" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Merchant Portal</h1>
            <p className="text-[var(--color-text-secondary)] text-sm">Sign in to manage your business</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                <input
                  type="tel"
                  placeholder="09030000000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all placeholder:text-slate-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-[var(--color-blue)] text-[var(--color-text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-[var(--color-border)]/20 rounded-xl">
                <p className="text-rose-400 text-sm font-medium text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-[var(--color-orange)] hover:bg-[var(--color-orange)] rounded-xl font-bold text-white shadow-lg shadow-[var(--color-purple)]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-white rounded-full animate-spin" />
              ) : (
                <>Access Dashboard <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[var(--color-text-secondary)] pt-6 border-t border-[var(--color-border)]">
            Don&apos;t have a merchant account?{" "}
            <Link href="/register?type=merchant" className="text-[var(--color-blue)] hover:text-[var(--color-purple)] font-medium hover:underline">
              Create one via App
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

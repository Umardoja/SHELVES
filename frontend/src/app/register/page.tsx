"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Phone, Store, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

function RegisterContent() {
  const { register } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const businessName = formData.get("businessName") as string;
    const businessType = formData.get("businessType") as string;
    const phone = formData.get("phone") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    const isMerchant = !redirectTo.includes("/shop");

    try {
      await register({ name, businessName, businessType, phone, password, isMerchant }, redirectTo);
      toast("Account created! Welcome to SHELVES 🎉", "success");
    } catch (err: any) {
      setError(err.message || "Registration failed");
      toast(err.message || "Registration failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 text-white bg-[var(--color-green)]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 text-white bg-[var(--color-orange)]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-4 sm:p-8 relative z-10"
      >
        <div className="glass-card p-6 sm:p-8 rounded-2xl shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-xl">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-brand">
              Create Your Account
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2 text-sm sm:text-base">Start managing your business today</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                  <input 
                    name="name"
                    type="text" 
                    placeholder="e.g. Umar" 
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Business Name</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                  <input 
                    name="businessName"
                    type="text" 
                    placeholder="e.g. Umar Stores" 
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Type of Business</label>
              <select
                name="businessType"
                className="w-full px-4 py-3 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all appearance-none cursor-pointer"
              >
                <option value="General" className="bg-[var(--color-surface)]">General Store</option>
                <option value="Building Materials" className="bg-[var(--color-surface)]">Building Materials</option>
                <option value="Food Stuff" className="bg-[var(--color-surface)]">Food Stuff</option>
                <option value="Electronics" className="bg-[var(--color-surface)]">Electronics / Gadgets</option>
                <option value="Clothing" className="bg-[var(--color-surface)]">Clothing / Fashion</option>
                <option value="Kiddies" className="bg-[var(--color-surface)]">Kids Items</option>
                <option value="Other" className="bg-[var(--color-surface)]">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                <input 
                  name="phone"
                  type="tel" 
                  placeholder="09030000000" 
                  className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="At least 6 characters" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all placeholder:text-slate-600"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-[var(--color-green)] text-[var(--color-text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm your password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all placeholder:text-slate-600"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-[var(--color-green)] text-[var(--color-text-secondary)] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-rose-400 text-[10px] font-bold mt-1 ml-1">Passwords do not match</p>
              )}
            </div>

            {error && <p className="text-rose-400 text-xs text-center font-bold tracking-tight">{error}</p>}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-gradient-brand rounded-xl font-bold text-white shadow-lg shadow-[var(--color-purple)]/10 hover:shadow-[var(--color-purple)]/10 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link href={`/login${redirectTo !== "/dashboard" ? `?redirect=${redirectTo}` : ""}`} className="text-[var(--color-green)] hover:text-emerald-300 font-medium hover:underline">
              Login here
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="w-10 h-10 border-4 border-[var(--color-border)]/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}

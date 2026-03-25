"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Phone, Store, User, KeyRound, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

type Step = "phone" | "register" | "otp" | "set-password";

function LoginContent() {
  const { login, checkPhone, sendOtp, verifyOtp, setPassword } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Multi-step state
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Check phone
  const handleCheckPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsLoading(true);
    setError("");

    try {
      const result = await checkPhone(phoneNumber);

      if (!result.exists) {
        // User doesn't exist at all — block and show error
        setError("Invalid phone number");
        toast("No account found with this number.", "error");
      } else if (result.hasPassword) {
        // User exists AND has password — normal login
        setBusinessName(result.businessName || "");
        setStep("register"); // We reuse the form but it shows password input
      } else {
        // User exists but NO password (USSD user) — send OTP
        setBusinessName(result.businessName || "");
        await sendOtp(phoneNumber);
        toast("We sent a code to your phone", "success");
        setStep("otp");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2a: Login with password
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    try {
      const res = await login(phoneNumber, password, redirectTo);

      // If backend says NO_PASSWORD, switch to OTP flow
      if (res?.data?.message === "NO_PASSWORD") {
        await sendOtp(phoneNumber);
        toast("We sent a code to your phone to verify it is you", "success");
        setStep("otp");
        return;
      }

      toast("Welcome back! 🎉", "success");
    } catch (err: any) {
      if (err?.data?.message === "NO_PASSWORD") {
        try {
          await sendOtp(phoneNumber);
          toast("We sent a code to your phone", "success");
          setStep("otp");
        } catch {
          setError("Could not send verification code");
        }
      } else {
        setError(err.message || "Login failed");
        toast(err.message || "Login failed", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2b: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await verifyOtp(phoneNumber, otpCode);
      toast("Phone verified! Create your password.", "success");
      setStep("set-password");
    } catch (err: any) {
      setError(err.message || "Wrong code");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2c: Set password after OTP
  const handleSetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      await setPassword(phoneNumber, password, redirectTo);
      toast("Password set! Welcome to SHELVES 🎉", "success");
    } catch (err: any) {
      setError(err.message || "Failed to set password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 text-white bg-[var(--color-purple)] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 text-white bg-[var(--color-orange)] rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-4 sm:p-8 md:p-8 relative z-10"
      >
        <div className="glass-card p-6 sm:p-8 rounded-2xl shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-xl">
          {/* ========== STEP: ENTER PHONE ========== */}
          {step === "phone" && (
            <>
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-brand">
                  Welcome Back
                </h1>
                <p className="text-[var(--color-text-secondary)] mt-2">Enter your phone number to continue</p>
              </div>

              <form onSubmit={handleCheckPhone} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                    <input
                      type="tel"
                      placeholder="09030000000"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all placeholder:text-slate-600"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-rose-400 text-xs text-center font-bold">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-brand rounded-xl font-bold text-white shadow-lg shadow-[var(--color-purple)]/10 hover:shadow-[var(--color-purple)]/10 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Continue <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
                Don&apos;t have an account?{" "}
                <Link href={`/register${redirectTo !== "/dashboard" ? `?redirect=${redirectTo}` : ""}`} className="text-[var(--color-blue)] hover:text-cyan-300 font-medium hover:underline">
                  Sign up here
                </Link>
              </div>
            </>
          )}

          {/* ========== STEP: PASSWORD LOGIN ========== */}
          {step === "register" && (
            <>
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-brand">
                  {businessName ? `Welcome, ${businessName}` : "Enter Password"}
                </h2>
                <p className="text-[var(--color-text-secondary)] mt-2">{phoneNumber}</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all placeholder:text-slate-600"
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

                {error && <p className="text-rose-400 text-xs text-center font-bold">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-brand rounded-xl font-bold text-white shadow-lg shadow-[var(--color-purple)]/10 hover:shadow-[var(--color-purple)]/10 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Sign In <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("phone"); setError(""); }}
                  className="w-full text-center text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  ← Use a different number
                </button>
              </form>
            </>
          )}

          {/* ========== STEP: OTP VERIFICATION ========== */}
          {step === "otp" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 text-white bg-[var(--color-orange)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-[var(--color-blue)]" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Verify Your Phone</h1>
                <p className="text-[var(--color-text-secondary)] mt-2">
                  We sent a 6-digit code to <span className="text-[var(--color-blue)]">{phoneNumber}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">Enter Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-2xl tracking-[0.5em] py-4 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all placeholder:text-slate-700"
                    required
                  />
                </div>

                {error && <p className="text-rose-400 text-xs text-center font-bold">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full py-3 bg-gradient-brand rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Verify <ShieldCheck className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ========== STEP: SET PASSWORD ========== */}
          {step === "set-password" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 text-white bg-[var(--color-green)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-[var(--color-green)]" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Create Password</h1>
                <p className="text-[var(--color-text-secondary)] mt-2">
                  Set a password so you can login on the web anytime
                </p>
              </div>

              <form onSubmit={handleSetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
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
                      name="confirm"
                      type={showPassword ? "text" : "password"}
                      placeholder="Type it again"
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

                {error && <p className="text-rose-400 text-xs text-center font-bold">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-brand rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Set Password & Enter <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="w-10 h-10 border-4 border-[var(--color-border)]/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

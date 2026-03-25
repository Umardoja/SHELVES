"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/customer/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { apiPost, apiGet, apiPut } from "@/lib/api";
import { 
  User, 
  Phone, 
  Mail, 
  Store, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  Calendar,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  Handshake
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, updateUser, logout } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  
  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/profile");
      return;
    }
    
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, authLoading]);

  const fetchProfile = async () => {
    try {
      const data = await apiGet("/api/user/profile");
      setProfileData(data);
      setName(data.name || "");
      setEmail(data.email || "");
    } catch (err: any) {
      toast(err.message || "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await apiPut("/api/user/profile", { name, email });
      toast("Profile updated successfully!", "success");
      // Update local state and auth context
      if (res.user) {
        updateUser(res.user);
      }
      fetchProfile();
    } catch (err: any) {
      toast(err.message || "Update failed", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }
    setPassLoading(true);
    try {
      await apiPut("/api/user/password", { currentPassword, newPassword });
      toast("Password updated successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast(err.message || "Password update failed", "error");
    } finally {
      setPassLoading(false);
    }
  };

  if (authLoading || (loading && !profileData)) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--color-blue)] animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-white selection:bg-[var(--color-orange)]">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24 pb-20 md:pb-32">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Your Profile</h1>
            <p className="text-[var(--color-text-secondary)] font-medium text-sm md:text-base">Manage your account details and security</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 text-left">
            {/* Sidebar Details */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-5 md:space-y-6">
                <div className="w-20 h-20 text-white bg-[var(--color-purple)]/10 rounded-2xl flex items-center justify-center text-[var(--color-blue)] border border-[var(--color-purple)]/20">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{profileData?.name || "User"}</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm font-medium">
                    {profileData?.merchantCode ? profileData?.businessName : "Customer Account"}
                  </p>
                </div>
                
                <div className="pt-6 border-t border-[var(--color-border)] space-y-4">
                  <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                    <ShieldCheck className="w-4 h-4 text-[var(--color-green)]" />
                    <span className="text-xs font-black uppercase tracking-widest">
                      {profileData?.merchantCode ? profileData?.businessType : "Standard User"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                    <Calendar className="w-4 h-4 text-[var(--color-blue)]" />
                    <span className="text-xs font-bold">Joined {new Date(profileData?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button 
                  onClick={() => router.push("/merchant/login")}
                  className="w-full h-12 bg-[var(--color-orange)] hover:bg-[var(--color-orange)] text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-[var(--color-purple)]/20"
                >
                  Continue to Merchant <ArrowRight className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => router.push("/profile/negotiations")}
                  className="w-full h-12 bg-amber-500/10 border border-[var(--color-border)]/20 hover:bg-amber-500/20 text-amber-500 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <Handshake className="w-4 h-4" /> My Negotiations
                </button>
                
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to log out?")) {
                      logout();
                    }
                  }}
                  className="w-full h-12 bg-rose-500/10 border border-[var(--color-border)]/20 hover:bg-rose-500/20 text-rose-500 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <LogOut className="w-4 h-4" /> Logout Account
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Profile Form */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl md:rounded-3xl p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold mb-6 md:mb-8 flex items-center gap-3">
                  <User className="w-5 h-5 text-[var(--color-blue)]" />
                  General Information
                </h3>
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                        <input 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full h-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-11 pr-4 outline-none focus:border-[var(--color-border)]/50 transition-all font-bold text-sm"
                          placeholder="Your Name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative opacity-60">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                        <input 
                          disabled
                          value={profileData?.phone || ""}
                          className="w-full h-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-11 pr-4 outline-none font-bold text-sm cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-11 pr-4 outline-none focus:border-[var(--color-border)]/50 transition-all font-bold text-sm"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={updating}
                    className="h-12 px-8 bg-[var(--color-orange)] hover:bg-[var(--color-orange)] text-white rounded-xl font-black text-xs transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Profile"}
                  </button>
                </form>
              </div>

              {/* Password Section */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl md:rounded-3xl p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold mb-6 md:mb-8 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-[var(--color-green)]" />
                  Security & Password
                </h3>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Current Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                      <input 
                        type={showPass ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full h-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-11 pr-12 outline-none focus:border-[var(--color-border)]/50 transition-all font-bold text-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">New Password</label>
                      <input 
                        type={showPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 outline-none focus:border-[var(--color-border)]/50 transition-all font-bold text-sm"
                        placeholder="Min 6 chars"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Confirm New Password</label>
                      <input 
                        type={showPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 outline-none focus:border-[var(--color-border)]/50 transition-all font-bold text-sm"
                        placeholder="Repeat it"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={passLoading}
                    className="h-12 px-8 bg-[var(--color-green)] hover:bg-[var(--color-green)] text-white rounded-xl font-black text-xs transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {passLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Change Password"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

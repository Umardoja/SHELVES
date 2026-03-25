"use client";

import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart2, 
  MessageSquare, 
  Smartphone, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Users,
  Handshake
} from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

const NAV_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Your Stock", href: "/dashboard/inventory", icon: Package },
  { name: "Record Sale", href: "/dashboard/sales", icon: ShoppingCart },
  { name: "Customer Orders", href: "/dashboard/orders", icon: ClipboardList },
  { name: "Negotiations", href: "/dashboard/negotiations", icon: Handshake },
  { name: "Business Reports", href: "/dashboard/reports", icon: BarChart2 },
  { name: "Promo Message", href: "/dashboard/sms", icon: MessageSquare },
  { name: "My Customers", href: "/dashboard/contacts", icon: Users },
  { name: "How It Works", href: "/dashboard/ussd", icon: Smartphone },
  { name: "Your Details", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ 
  isCollapsed, 
  toggleCollapse, 
  isMobileOpen, 
  onCloseMobile 
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.businessName
    ? user.businessName.substring(0, 2).toUpperCase()
    : "UP";

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen z-50 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)] transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-[260px]'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className={`p-6 mb-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
             <div className="relative w-8 h-8">
                <Image 
                  src={"/logo.png"} 
                  alt="SHELVES" 
                  fill 
                  className="object-contain"
                  priority
                />
             </div>
             {!isCollapsed && <span className="font-black text-sm tracking-widest text-[var(--color-text-primary)]">SHELVES</span>}
          </div>
          
          <button 
            onClick={toggleCollapse}
            className="hidden md:flex w-6 h-6 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 px-4 space-y-1 custom-scrollbar ${isCollapsed ? "overflow-hidden" : "overflow-y-auto"}`}>
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.href}
              {...item}
              isActive={pathname === item.href}
              isCollapsed={isCollapsed}
              onClick={onCloseMobile}
            />
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-[var(--color-border)]">
           <div 
             onClick={logout}
             className={`flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--color-surface)] transition-colors cursor-pointer group ${isCollapsed ? 'justify-center' : ''}`}
           >
              <div className="w-8 h-8 rounded-lg bg-[var(--color-bg)] flex items-center justify-center text-[10px] font-black text-[var(--color-blue)]">
                 {initials}
              </div>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{user?.businessName || "My Business"}</p>
                  <p className="text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">{user?.phone || ""}</p>
                </div>
              )}
              {!isCollapsed && <LogOut className="w-4 h-4 text-slate-600 group-hover:text-rose-400 transition-colors" />}
           </div>
        </div>
      </aside>

      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[var(--color-bg)] z-40 md:hidden backdrop-blur-sm"
        />
      )}
    </>
  );
}

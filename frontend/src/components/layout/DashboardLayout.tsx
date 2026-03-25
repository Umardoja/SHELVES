"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { DashboardBackground } from "@/components/dashboard/DashboardBackground";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show nothing while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] overflow-hidden relative">
      <DashboardBackground />
      
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        isMobileOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />
      
      <main 
        className={`flex-1 flex flex-col h-screen overflow-x-hidden overflow-y-hidden relative z-10 transition-[margin] duration-300 ${
           isCollapsed ? 'md:ml-20' : 'md:ml-[260px]'
        }`}
      >
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-8 pb-28 md:pb-32 custom-scrollbar">
           <div className="max-w-7xl mx-auto w-full">
              {children}
           </div>
        </div>

        <div className="h-20 md:hidden pointer-events-none" />
      </main>
    </div>
  );
}

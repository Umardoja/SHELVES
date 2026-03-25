"use client";

export function DashboardBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[var(--color-bg)]">
      {/* Static Subtle Glows - Performance Optimized */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] text-white bg-[var(--color-orange)] blur-[120px] rounded-full" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] text-white bg-[var(--color-orange)] blur-[120px] rounded-full" />
      
      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.01]"></div>
    </div>
  );
}

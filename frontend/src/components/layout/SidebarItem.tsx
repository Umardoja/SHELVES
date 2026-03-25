"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  name: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

export function SidebarItem({
  name,
  href,
  icon: Icon,
  isActive,
  isCollapsed,
  onClick,
}: SidebarItemProps) {
  return (
    <Link href={href} onClick={onClick}>
      <div
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 group ${
          isActive 
            ? "text-[var(--color-text-primary)] bg-[var(--color-surface)]" 
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
        }`}
      >
        {/* Simplified Left Active Indicator */}
        {isActive && (
          <div className="absolute left-0 top-3 bottom-3 w-0.5 text-white bg-[var(--color-orange)] rounded-full" />
        )}

        <div className={`flex items-center justify-center ${isCollapsed ? 'w-full' : ''}`}>
          <Icon className={`w-5 h-5 ${isActive ? "text-[var(--color-blue)]" : "group-hover:text-[var(--color-blue)]"}`} />
        </div>

        {!isCollapsed && (
          <span className="text-sm font-bold tracking-tight">
            {name}
          </span>
        )}

        {/* Minimal Tooltip for collapsed mode */}
        {isCollapsed && (
           <div className="absolute left-full ml-4 px-2 py-1 bg-[var(--color-surface)] text-[10px] font-bold text-[var(--color-text-primary)] rounded border border-[var(--color-border)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] whitespace-nowrap">
              {name}
           </div>
        )}
      </div>
    </Link>
  );
}

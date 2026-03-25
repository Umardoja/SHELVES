import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function GlassCard({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "bg-[var(--color-surface)] backdrop-blur-xl border border-[var(--color-border)] rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

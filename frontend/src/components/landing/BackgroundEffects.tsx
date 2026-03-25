"use client";

import { motion } from "framer-motion";

export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Professional Dark Background */}
      <div className="absolute inset-0 bg-[#020617]">
        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-noise"></div>
        
        {/* Very Subtle Gradient Glows - Static or very slow for calm atmosphere */}
        <div 
          className="absolute -top-[10%] -left-[5%] w-full h-full text-white bg-[var(--color-orange)] blur-[120px] rounded-full"
        />
        <div 
          className="absolute -bottom-[10%] -right-[5%] w-full h-full text-white bg-[var(--color-orange)] blur-[120px] rounded-full"
        />
      </div>

      {/* Elegant Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.05)_0%,transparent_70%)]"></div>
    </div>
  );
}

"use client";

import Spline from "@splinetool/react-spline";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export default function SplineScene({ scene, className }: SplineSceneProps) {
  const [loading, setLoading] = useState(true);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-surface)]"
          >
            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] border-t-transparent animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
      <Spline
        scene={scene}
        onLoad={() => setLoading(false)}
        className="w-full h-full"
      />
    </div>
  );
}

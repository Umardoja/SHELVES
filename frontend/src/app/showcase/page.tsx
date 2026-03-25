'use client';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import SplineScene from '@/components/ui/SplineScene';

export default function ShowcasePage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <LandingNavbar />
      
      <div className="container mx-auto px-6 pt-32 pb-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Animation Showcase</h1>
        <p className="text-center text-[var(--color-text-secondary)] mb-12">Demonstrating 3D integration and motion effects</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[600px]">
            <div className="glass-card rounded-2xl overflow-hidden relative">
                <div className="absolute top-4 left-4 z-10 bg-[var(--color-bg)] px-3 py-1 rounded-full text-xs">
                    Abstract Shapes
                </div>
                {/* Using a different scene for variety if available, otherwise reuse or use placeholder */}
                <SplineScene scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
            </div>

            <div className="glass-card rounded-2xl overflow-hidden relative">
                 <div className="absolute top-4 left-4 z-10 bg-[var(--color-bg)] px-3 py-1 rounded-full text-xs">
                    Interactive Cube
                </div>
                <SplineScene scene="https://prod.spline.design/kZDDjO5HvC9C-bqv/scene.splinecode" />
            </div>
        </div>
      </div>
    </main>
  );
}

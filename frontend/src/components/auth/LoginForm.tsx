'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function LoginForm() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const phone = formData.get('phoneNumber') as string;
    const password = formData.get('password') as string;

    try {
      await login(phone, password);
      // Navigation is handled by login success in AuthContext
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 w-full max-w-md mx-auto"
    >
      <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-brand from-primary-start to-primary-end">
        Welcome Back
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Phone Number</label>
          <input 
            name="phoneNumber" 
            type="tel" 
            required
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-primary-start focus:ring-1 focus:ring-primary-start transition-all"
            placeholder="09012345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Password</label>
          <input 
            name="password" 
            type="password" 
            required
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-primary-start focus:ring-1 focus:ring-primary-start transition-all"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-brand from-primary-start to-primary-end text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Login'}
        </button>

        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-4">
          Don't have an account? <Link href="/register" className="text-primary-middle hover:underline">Sign up</Link>
        </p>
      </form>
    </motion.div>
  );
}

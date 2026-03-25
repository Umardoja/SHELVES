'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const businessName = formData.get('businessName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const password = formData.get('password') as string;

    // Basic Validation
    if (phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      toast('Please enter a valid phone number', 'error');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      toast('Password must be at least 6 characters', 'error');
      setLoading(false);
      return;
    }

    try {
      await register({ 
        name: businessName, // Using businessName as name for simplicity if not provided
        businessName, 
        businessType: 'General', 
        phone: phoneNumber, 
        password 
      });
      toast('Registration successful!', 'success');
      // Navigation is handled by register success in AuthContext
    } catch (err: any) {
      setError(err.message);
      toast(err.message, 'error');
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
        Create Your Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Business Name</label>
          <input 
            name="businessName" 
            type="text" 
            required
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-primary-start focus:ring-1 focus:ring-primary-start transition-all"
            placeholder="e.g. Ade Hardware Shop"
          />
        </div>

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
            placeholder="Create a password"
          />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-brand from-primary-start to-primary-end text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Start Using SHELVES'}
        </button>

        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-4">
          Already have an account? <Link href="/login" className="text-primary-middle hover:underline">Sign In</Link>
        </p>
      </form>
    </motion.div>
  );
}

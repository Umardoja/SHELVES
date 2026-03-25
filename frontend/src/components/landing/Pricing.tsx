"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, X, Star, Zap, Rocket, Building2, Crown, Gem, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Launch",
    price: "0",
    description: "Perfect for new merchants starting their journey.",
    icon: <Rocket className="w-6 h-6 text-[var(--color-green)]" />,
    features: [
      "Up to 10 products",
      "Basic dashboard access",
      "Web storefront",
      "Order notifications",
      "Basic sales summary",
      "Limited USSD access (basic ordering only)"
    ],
    limitations: [
      "No Paystack integration",
      "No advanced analytics",
      "No featured listing"
    ],
    buttonText: "Get Started",
    popular: false,
    color: "emerald"
  },
  {
    name: "Business",
    price: "3,000",
    description: "Empower your growing shop with professional tools.",
    icon: <Building2 className="w-6 h-6 text-[var(--color-blue)]" />,
    features: [
      "Up to 100 products",
      "Paystack integration",
      "Order tracking",
      "Basic analytics",
      "Custom store link",
      "Email support",
      "Optional USSD add-on"
    ],
    limitations: [],
    buttonText: "Get Started",
    popular: false,
    color: "indigo"
  },
  {
    name: "Scale",
    price: "8,000",
    description: "Full-scale solution for high-volume merchants.",
    icon: <Crown className="w-6 h-6 text-[var(--color-purple)]" />,
    features: [
      "Unlimited products",
      "Full USSD access included",
      "Advanced analytics",
      "Customer insights",
      "Featured merchant eligibility",
      "Priority support",
      "Downloadable reports"
    ],
    limitations: [],
    buttonText: "Get Started",
    popular: true,
    color: "purple"
  },
  {
    name: "Enterprise",
    price: "15,000",
    description: "Customized control for large retail operations.",
    icon: <Gem className="w-6 h-6 text-amber-400" />,
    features: [
      "Everything in Growth",
      "Multiple staff accounts",
      "Inventory alerts",
      "Custom branding",
      "Future API access",
      "Dedicated support"
    ],
    limitations: [],
    buttonText: "Get Started",
    popular: false,
    color: "amber"
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[var(--color-bg)] relative overflow-hidden scroll-mt-20">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] text-white bg-[var(--color-orange)]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] text-white bg-[var(--color-purple)] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-[var(--color-text-primary)] leading-tight">
              Simple, Transparent <span className="text-[var(--color-blue)]">Pricing</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg font-medium max-w-2xl mx-auto mt-4">
              Flexible plans designed to grow with your business. Choose the tier that fits your needs.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative flex flex-col p-8 rounded-[2.5rem] bg-[var(--color-surface)] border transition-all duration-500 group ${
                plan.popular 
                  ? "border-[var(--color-border)] ring-1 ring-indigo-500 shadow-2xl shadow-[var(--color-purple)]/10 scale-105 z-10" 
                  : "border-[var(--color-border)] hover:border-[var(--color-border)]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[var(--color-orange)] rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Star className="w-3 h-3 fill-white" />
                  Most Popular
                </div>
              )}

              <div className="mb-8 space-y-4">
                <div className={`w-14 h-14 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {plan.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[var(--color-text-primary)]">{plan.name}</h3>
                  <p className="text-[var(--color-text-secondary)] text-xs font-medium mt-1 leading-relaxed">
                    {plan.description}
                  </p>
                </div>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">₦{plan.price}</span>
                <span className="text-[var(--color-text-secondary)] text-sm font-bold">/ month</span>
              </div>

              <div className="flex-grow space-y-4 mb-10">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full text-white bg-[var(--color-green)]/10 border border-[var(--color-border)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[var(--color-green)]" />
                    </div>
                    <span className="text-[var(--color-text-secondary)] text-sm font-medium leading-tight">{feature}</span>
                  </div>
                ))}
                
                {plan.limitations.map((limit, lIdx) => (
                  <div key={lIdx} className="flex items-start gap-3 opacity-40">
                    <div className="w-5 h-5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-[var(--color-text-secondary)]" />
                    </div>
                    <span className="text-[var(--color-text-secondary)] text-sm font-medium leading-tight line-through">{limit}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  plan.popular 
                    ? "bg-[var(--color-orange)] text-white hover:bg-[var(--color-orange)] shadow-lg shadow-[var(--color-orange)]/20" 
                    : "bg-[var(--color-surface)] text-white hover:bg-[var(--color-surface)] border border-[var(--color-border)]"
                }`}
              >
                {plan.buttonText}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

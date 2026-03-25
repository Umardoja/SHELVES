"use client";

import { memo } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, Smartphone } from "lucide-react";

const LOGS = [
  { id: 1, type: 'success', text: 'Records Updated', time: '2m ago', icon: CheckCircle2 },
  { id: 2, type: 'info', text: 'USSD Reset', time: '15m ago', icon: RefreshCw },
  { id: 3, type: 'alert', text: 'Running Low: Iron Rods', time: '1h ago', icon: AlertCircle },
  { id: 4, type: 'info', text: 'Phone Link Active', time: '3h ago', icon: Smartphone },
];

export const ActivityLog = memo(() => {
  return (
    <div className="space-y-4">
      {LOGS.map((log) => (
        <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface)]/[0.02] border border-[var(--color-border)]">
          <log.icon className={`w-4 h-4 mt-0.5 ${
            log.type === 'success' ? 'text-[var(--color-green)]' : 
            log.type === 'alert' ? 'text-rose-500' : 'text-[var(--color-blue)]'
          }`} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[var(--color-text-secondary)] truncate">{log.text}</p>
            <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mt-0.5">{log.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
});

ActivityLog.displayName = "ActivityLog";

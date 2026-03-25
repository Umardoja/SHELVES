"use client";

import { useState, useEffect } from "react";
import { Send, Users, MessageSquare, History, CheckCircle } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function SMSPage() {
  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContactsAndCampaigns();
  }, []);

  const fetchContactsAndCampaigns = async () => {
    try {
      const [contData, campData] = await Promise.all([
        apiGet("/api/contacts"),
        apiGet("/api/sms/campaigns")
      ]);
      setContacts(contData);
      setCampaigns(Array.isArray(campData) ? campData : []);
    } catch (err: any) {
      toast(err.message || "Failed to load data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message || selectedIds.length === 0) return;
    
    setIsSending(true);
    try {
      await apiPost("/api/sms", {
        contactIds: selectedIds,
        message: message
      });
      toast(`Successfully sent blast to ${selectedIds.length} contacts!`, "success");
      setMessage("");
      setSelectedIds([]);
      // Refresh campaigns list
      fetchContactsAndCampaigns();
    } catch (error: any) {
      toast(error.message || "Failed to send message", "error");
    } finally {
      setIsSending(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === contacts.length && contacts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map(c => c._id));
    }
  };

  const handleResend = (campMessage: string) => {
    setMessage(campMessage);
    // Optionally auto-select all, or let user decide. Keeping it to let user select for safety.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-brand from-white ">
            Promo Message
          </h1>
          <p className="text-[var(--color-text-secondary)]">Send messages to your customer network.</p>
        </div>
        <div className="flex gap-4 items-center bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2 rounded-lg">
            <span className="text-sm text-[var(--color-text-secondary)]">SMS Balance:</span>
            <span className="text-lg font-bold text-[var(--color-green)]">2,450 Units</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <GlassCard className="p-4 md:p-8">
             <h3 className="text-lg font-black mb-8 flex items-center gap-2 text-[var(--color-text-primary)]">
                <Send className="w-5 h-5 text-[var(--color-green)]" /> New Campaign
            </h3>
            <div className="space-y-8">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Select Recipients</label>
                        <button 
                          onClick={toggleSelectAll}
                          className="text-[10px] font-black text-[var(--color-green)] uppercase tracking-widest hover:text-emerald-300 transition-colors"
                        >
                          {selectedIds.length === contacts.length && contacts.length > 0 ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    
                    <div className="h-48 overflow-y-auto bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl p-4 space-y-2 custom-scrollbar">
                        {isLoading ? (
                           <div className="flex items-center justify-center h-full">
                              <span className="text-xs text-[var(--color-text-secondary)] animate-pulse font-bold">Loading contacts...</span>
                           </div>
                        ) : contacts.length === 0 ? (
                           <div className="flex items-center justify-center h-full">
                              <span className="text-xs text-[var(--color-text-secondary)] font-bold">No contacts in CRM.</span>
                           </div>
                        ) : contacts.map(contact => (
                           <div 
                             key={contact._id}
                             onClick={() => toggleSelect(contact._id)}
                             className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                               selectedIds.includes(contact._id) 
                               ? 'text-white bg-[var(--color-green)]/10 border-[var(--color-border)]/30' 
                               : 'bg-[var(--color-surface)] border-transparent hover:border-[var(--color-border)]'
                             }`}
                           >
                              <div className="flex items-center gap-3">
                                 <div className={`w-2 h-2 rounded-full ${selectedIds.includes(contact._id) ? 'text-white bg-[var(--color-green)]' : 'bg-gray-100'}`} />
                                 <span className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight">{contact.phone}</span>
                              </div>
                              <span className="text-[10px] text-[var(--color-text-secondary)] font-black uppercase">Orders: {contact.totalOrders}</span>
                           </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-3 px-1">
                         <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">
                            {selectedIds.length} customers selected
                         </span>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-4 ml-1">Message Content</label>
                    <textarea 
                        className="w-full h-32 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl p-4 text-sm font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none shadow-inner"
                        placeholder="Type your promo message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={160}
                    ></textarea>
                    <div className="flex justify-end mt-2 pr-1">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{message.length}/160 characters</span>
                    </div>
                </div>

                <button 
                    onClick={handleSend}
                    disabled={!message || selectedIds.length === 0 || isSending}
                    className="w-full py-5 bg-[var(--color-green)] hover:bg-[var(--color-green)] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-[var(--color-purple)]/10"
                >
                    {isSending ? <span className="animate-pulse">Broadcasting...</span> : <><Send className="w-5 h-5" /> Send Blast</>}
                </button>
            </div>
        </GlassCard>

        <div className="space-y-6">
            <GlassCard className="p-4 md:p-8 border-[var(--color-border)] bg-[var(--color-surface)]/40">
                 <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-[var(--color-text-primary)]">
                    <History className="w-5 h-5 text-[var(--color-purple)]" /> Recent Campaigns
                </h3>
                <div className="space-y-4">
                    {campaigns.length === 0 ? (
                        <div className="p-8 text-center bg-[var(--color-surface)]/[0.02] rounded-2xl border border-[var(--color-border)]">
                            <p className="text-sm text-[var(--color-text-secondary)] font-bold">No campaigns sent yet.</p>
                        </div>
                    ) : (
                      campaigns.map((camp) => (
                        <div key={camp._id} className="p-4 bg-[var(--color-surface)]/[0.02] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-border)] transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[8px] font-black text-white bg-[var(--color-orange)] px-2 py-1 rounded-md uppercase tracking-widest">
                                    {camp.status === "SENT" ? "Delivered" : camp.status}
                                </span>
                                <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-tighter">
                                    {new Date(camp.dateSent).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-[var(--color-text-secondary)] mb-4 group-hover:text-[var(--color-text-secondary)] transition-colors tracking-tight line-clamp-3">"{camp.message}"</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <span className="flex items-center gap-2 text-[10px] font-black text-[var(--color-green)] uppercase tracking-widest">
                                       <CheckCircle className="w-3 h-3" /> {camp.recipientsCount} Sent
                                    </span>
                                </div>
                                <button 
                                  onClick={() => handleResend(camp.message)}
                                  className="text-[10px] font-black text-[var(--color-blue)] uppercase tracking-widest hover:text-[var(--color-purple)] transition-colors text-white bg-[var(--color-purple)]/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100"
                                >
                                  Resend
                                </button>
                            </div>
                        </div>
                      ))
                    )}
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
}

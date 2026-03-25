"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Send,
  MoreVertical,
  Clock,
  Loader2,
  Trash2,
  UserPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import GlassCard from "@/components/ui/GlassCard";

/* ================================
   Types
================================ */

interface Contact {
  _id: string;
  phone: string;
  name?: string;
  totalOrders: number;
  lastOrderDate?: string;
}

/* ================================
   Component
================================ */

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [promoMessage, setPromoMessage] = useState<string>("");
  const [showBlastModal, setShowBlastModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newContactPhone, setNewContactPhone] = useState<string>("");
  const [newContactName, setNewContactName] = useState<string>("");
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const { toast } = useToast();

  /* ================================
     Fetch Contacts
  ================================ */

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<Contact[]>("/api/contacts");
      setContacts(data || []);
    } catch (err: any) {
      toast(err?.message || "Failed to load contacts", "error");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================================
     Selection Logic
  ================================ */

  const filteredContacts = contacts.filter((c) =>
    c.phone.includes(searchTerm) ||
    (c.name &&
      c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (
      selectedIds.length === filteredContacts.length &&
      filteredContacts.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map((c) => c._id));
    }
  };

  /* ================================
     SMS Blast
  ================================ */

  const handleSendBlast = async (sendToAll = false) => {
    if (!promoMessage.trim()) {
      toast("Please enter a message", "error");
      return;
    }

    setIsSending(true);

    try {
      await apiPost("/api/sms", {
        contactIds: sendToAll ? [] : selectedIds,
        sendToAll,
        message: promoMessage,
      });

      toast(
        `Message sent to ${
          sendToAll ? "all contacts" : selectedIds.length
        } recipients!`,
        "success"
      );

      setPromoMessage("");
      setSelectedIds([]);
      setShowBlastModal(false);
    } catch (err: any) {
      toast(err?.message || "Failed to send SMS", "error");
    } finally {
      setIsSending(false);
    }
  };

  /* ================================
     Add Contact
  ================================ */

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactPhone.trim()) {
      toast("Phone number is required", "error");
      return;
    }

    setIsAdding(true);
    try {
      await apiPost("/api/contacts", {
        phone: newContactPhone,
        name: newContactName,
      });

      toast("Contact added successfully!", "success");
      setNewContactPhone("");
      setNewContactName("");
      setShowAddModal(false);
      fetchContacts();
    } catch (err: any) {
      toast(err?.message || "Failed to add contact", "error");
    } finally {
      setIsAdding(false);
    }
  };

  /* ================================
     UI
  ================================ */

  return (
    <div className="relative pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-1 text-white bg-gradient-brand rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-green)]">
              Customer CRM
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-[var(--color-text-primary)] tracking-tight mb-2">
            Contact{" "}
            <span className="text-transparent bg-clip-text bg-gradient-brand from-white ">
              Network.
            </span>
          </h1>

          <p className="text-[var(--color-text-secondary)] font-medium tracking-tight">
            Manage your customer base and drive sales through smart SMS campaigns.
          </p>
        </motion.div>

        {/* Search + Blast */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)] group-focus-within:text-[var(--color-green)]" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-emerald-500/50 outline-none w-full md:w-64"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)] flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            Add Contact
          </button>

          <button
            onClick={() => setShowBlastModal(true)}
            disabled={contacts.length === 0}
            className="px-6 py-4 bg-[var(--color-green)] hover:bg-[var(--color-green)] disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <Send className="w-4 h-4" />
            {selectedIds.length > 0
              ? `Blast (${selectedIds.length})`
              : "Send Blast"}
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center p-32">
          <Loader2 className="w-12 h-12 text-[var(--color-green)] animate-spin" />
        </div>
      ) : (
        <GlassCard className="overflow-hidden border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface)]">
                  <th className="p-3 md:p-6">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredContacts.length &&
                        filteredContacts.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-3 md:p-6 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">
                    Customer
                  </th>
                  <th className="p-3 md:p-6 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest text-center">
                    Orders
                  </th>
                  <th className="p-3 md:p-6 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest text-right">
                    Last Interaction
                  </th>
                  <th className="p-3 md:p-6"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="hover:bg-[var(--color-surface)]/[0.02]"
                  >
                    <td className="p-3 md:p-6">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(contact._id)}
                        onChange={() => toggleSelect(contact._id)}
                      />
                    </td>

                    <td className="p-3 md:p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] flex items-center justify-center text-[10px] font-black text-[var(--color-green)]">
                          {contact.phone.slice(-4)}
                        </div>

                        <div>
                          <div className="text-sm font-bold text-[var(--color-text-primary)]">
                            {contact.phone}
                          </div>
                          <div className="text-[10px] text-[var(--color-text-secondary)] font-bold">
                            {contact.name || "UNNAMED"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 md:p-6 text-center font-black text-[var(--color-text-primary)]">
                      {contact.totalOrders}
                    </td>

                    <td className="p-3 md:p-6 text-right">
                      {contact.lastOrderDate
                        ? new Date(
                            contact.lastOrderDate
                          ).toLocaleDateString()
                        : "Never"}
                    </td>

                    <td className="p-3 md:p-6 text-right">
                      <MoreVertical className="w-4 h-4 text-[var(--color-text-secondary)]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredContacts.length === 0 && (
              <div className="p-32 text-center text-slate-600 font-bold">
                No contacts found.
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showBlastModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-sm p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg bg-[var(--color-surface)] p-8 rounded-[2rem] border border-[var(--color-border)]"
            >
              <h3 className="text-xl font-black text-[var(--color-text-primary)] mb-6">
                Campaign Composer
              </h3>

              <textarea
                className="w-full h-32 px-6 py-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] resize-none"
                placeholder="Type your message..."
                value={promoMessage}
                onChange={(e) =>
                  setPromoMessage(e.target.value)
                }
                maxLength={160}
              />

              <div className="flex justify-end text-xs text-[var(--color-text-secondary)] mt-2">
                {promoMessage.length}/160
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleSendBlast(false)}
                  disabled={isSending || selectedIds.length === 0}
                  className="flex-1 py-4 bg-[var(--color-green)] hover:bg-[var(--color-green)] disabled:opacity-50 rounded-2xl text-xs font-black uppercase text-white"
                >
                  {isSending ? "Sending..." : `Send Selected`}
                </button>

                <button
                  onClick={() => handleSendBlast(true)}
                  disabled={isSending || contacts.length === 0}
                  className="flex-1 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-2xl text-xs font-black uppercase text-[var(--color-text-primary)]"
                >
                  Send All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-sm p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-[var(--color-surface)] p-8 rounded-[2rem] border border-[var(--color-border)]"
            >
              <h3 className="text-xl font-black text-[var(--color-text-primary)] mb-6">
                Add New Contact
              </h3>

              <form onSubmit={handleAddContact} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-2">
                    Phone Number (Required)
                  </label>
                  <input
                    type="text"
                    required
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="e.g. +234..."
                    className="w-full px-6 py-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-2">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full px-6 py-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-2xl text-sm font-bold text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-2xl text-xs font-black uppercase text-[var(--color-text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="flex-1 py-4 bg-[var(--color-green)] hover:bg-[var(--color-green)] disabled:opacity-50 rounded-2xl text-xs font-black uppercase text-white flex items-center justify-center gap-2"
                  >
                    {isAdding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save Contact"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

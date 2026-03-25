import { useState } from "react";
import { Sparkles, Loader2, MessageSquare, TrendingUp, Package } from "lucide-react";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AIAssistantCard() {
  const { user } = useAuth();
  const [loadingTopic, setLoadingTopic] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>("");

  const handleAskAI = async (topic: string, forceRefresh = false, query = "") => {
    if (!user?._id) return;
    setLoadingTopic(topic);
    setCurrentTopic(topic);
    if (query) setCurrentQuery(query);
    setAiResponse(""); // Clear old response while loading

    try {
      const res = await apiPost("/api/ai/assistant", {
        merchantId: user._id,
        action: topic, // User's requested payload field
        topic, // Legacy field
        forceRefresh,
        query,
      });
      // Handle the new response format
      if (res.message) {
        setAiResponse(res.message);
      } else if (res.error) {
        setAiResponse(res.error);
      } else {
        setAiResponse("I couldn't generate an insight right now. Please try again.");
      }
    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      // In case apiFetch throws the error object containing res.data.error
      if (error.data && error.data.error) {
          setAiResponse(error.data.error);
      } else {
          setAiResponse("I'm having trouble connecting. Let's try later.");
      }
    } finally {
      setLoadingTopic(null);
    }
  };

  return (
    <div className="bg-[var(--color-surface)]/40 border border-[var(--color-purple)]/20 rounded-2xl p-4 md:p-6 mb-4 md:mb-6 shadow-lg shadow-[var(--color-purple)]/5 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 text-white bg-[var(--color-purple)]/10 rounded-xl">
          <Sparkles className="w-5 h-5 text-[var(--color-blue)]" />
        </div>
        <div>
          <h2 className="text-sm md:text-base font-black text-[var(--color-text-primary)] uppercase tracking-widest">SHELVES AI Assistant</h2>
          <p className="text-[10px] md:text-xs text-[var(--color-text-secondary)]">Ask me anything about your business!</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <button
          onClick={() => handleAskAI("summary")}
          disabled={loadingTopic !== null}
          className="flex-1 px-4 py-3 bg-[var(--color-surface)]/[0.02] border border-[var(--color-border)] hover:border-[var(--color-border)]/30 rounded-xl text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]/[0.04] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {loadingTopic === "summary" ? <Loader2 className="w-4 h-4 animate-spin text-[var(--color-blue)]" /> : <TrendingUp className="w-4 h-4 text-[var(--color-blue)] group-hover:scale-110 transition-transform" />}
          Weekly Summary
        </button>
        <button
          onClick={() => handleAskAI("promo")}
          disabled={loadingTopic !== null}
          className="flex-1 px-4 py-3 bg-[var(--color-surface)]/[0.02] border border-[var(--color-border)] hover:border-[var(--color-border)]/30 rounded-xl text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]/[0.04] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {loadingTopic === "promo" ? <Loader2 className="w-4 h-4 animate-spin text-[var(--color-green)]" /> : <MessageSquare className="w-4 h-4 text-[var(--color-green)] group-hover:scale-110 transition-transform" />}
          Suggest Promo
        </button>
        <button
          onClick={() => handleAskAI("inventory")}
          disabled={loadingTopic !== null}
          className="flex-1 px-4 py-3 bg-[var(--color-surface)]/[0.02] border border-[var(--color-border)] hover:border-[var(--color-border)]/30 rounded-xl text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]/[0.04] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {loadingTopic === "inventory" ? <Loader2 className="w-4 h-4 animate-spin text-rose-400" /> : <Package className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />}
          Inventory Advice
        </button>
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const input = form.elements.namedItem('chatQuery') as HTMLInputElement;
          const query = input.value.trim();
          if (query) {
            handleAskAI("chat", false, query);
            input.value = "";
          }
        }}
        className="mb-6 relative"
      >
        <input 
          type="text" 
          name="chatQuery"
          placeholder="Or ask a custom question..." 
          disabled={loadingTopic !== null}
          className="w-full bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl py-3 pl-4 pr-12 text-sm text-[var(--color-text-primary)] placeholder-slate-500 focus:outline-none focus:border-[var(--color-border)]/50 focus:ring-1 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={loadingTopic !== null}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--color-orange)] hover:bg-[var(--color-orange)] rounded-lg text-white transition-colors disabled:opacity-50"
        >
          {loadingTopic === "chat" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
        </button>
      </form>

      {aiResponse && (
        <div className="relative overflow-hidden rounded-xl border border-[var(--color-purple)]/20 text-white bg-[var(--color-orange)] p-4 md:p-5 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="absolute top-0 left-0 w-1 h-full text-white bg-gradient-brand from-[#4F46E5] to-[#06B6D4]" />
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {aiResponse.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </p>
          <div className="mt-4 flex justify-end">
             <button
                onClick={() => handleAskAI(currentTopic!, true, currentQuery)}
                disabled={loadingTopic !== null}
                className="text-xs font-bold text-[var(--color-blue)] hover:text-[var(--color-purple)] transition-colors flex items-center gap-1"
             >
                {loadingTopic !== null ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Regenerate
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

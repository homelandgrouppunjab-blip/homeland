import React, { useEffect, useRef, useState } from "react";
import { Bot, X, Send, Loader2 } from "lucide-react";
import { sendChat } from "@/lib/api";

const GREETING = { role: "assistant", content: "Hello! I'm the Homeland Group concierge. Ask me about our projects, locations, pricing or how to book a visit." };

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await sendChat(next.filter((m) => m.role !== "system"));
      setMessages((m) => [...m, { role: "assistant", content: reply || "Sorry, I didn't catch that." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "I'm having trouble right now. Please try again, or reach us via the Enquire Now button." }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          data-testid="chatbot-launcher"
          aria-label="Open chat assistant"
          className="fixed bottom-24 right-6 z-[150] h-14 w-14 grid place-items-center rounded-full bg-[color:var(--lux-gold)] text-[#1b1710] shadow-[0_12px_34px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform"
        >
          <Bot className="h-7 w-7" />
        </button>
      )}

      {open && (
        <div
          data-testid="chatbot-panel"
          className="fixed bottom-24 right-6 z-[150] w-[min(92vw,380px)] h-[min(70vh,560px)] flex flex-col rounded-2xl overflow-hidden border border-[color:var(--border-gold)] bg-[color:var(--lux-charcoal)] shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--border-hairline)] bg-[color:var(--surface-glass-strong)] backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 grid place-items-center rounded-full bg-[rgba(212,175,55,0.15)] text-gold"><Bot className="h-4 w-4" /></span>
              <div>
                <div className="text-sm font-semibold text-ivory leading-tight">Homeland Concierge</div>
                <div className="text-[10px] text-[color:var(--lux-ivory)]/50">AI assistant</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} data-testid="chatbot-close" aria-label="Close chat" className="h-8 w-8 grid place-items-center rounded-lg text-[color:var(--lux-ivory)]/70 hover:text-gold"><X className="h-5 w-5" /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  data-testid={`chatbot-msg-${m.role}`}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[rgba(212,175,55,0.16)] text-ivory rounded-br-sm"
                      : "bg-white/5 text-[color:var(--lux-ivory)]/85 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start"><div className="rounded-2xl bg-white/5 px-3.5 py-2.5 text-sm text-[color:var(--lux-ivory)]/60 inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Typing…</div></div>
            )}
          </div>

          <div className="p-3 border-t border-[color:var(--border-hairline)] flex items-end gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask about our projects…"
              data-testid="chatbot-input"
              className="flex-1 resize-none max-h-28 rounded-xl bg-[color:var(--lux-obsidian)] border border-[color:var(--border-hairline)] px-3 py-2.5 text-sm text-ivory placeholder:text-[color:var(--lux-ivory)]/40 focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]"
            />
            <button onClick={send} disabled={loading || !input.trim()} data-testid="chatbot-send" aria-label="Send" className="h-10 w-10 shrink-0 grid place-items-center rounded-xl bg-[color:var(--lux-gold)] text-[#1b1710] hover:opacity-90 disabled:opacity-40 transition-opacity">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

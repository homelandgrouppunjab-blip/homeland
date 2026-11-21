import React, { useEffect, useRef, useState } from "react";
import { Bot, X, Send, Loader2, Phone, Mail, MessageCircle } from "lucide-react";
import { sendChat, getContent } from "@/lib/api";

const GREETING = {
  role: "assistant",
  content:
    "Hello! I'm the Homeland Group concierge. Ask me anything about our projects, locations, pricing or booking a visit — or tap a question below.",
};

// Predefined question → answer pairs. Built with the live contact details so the
// "talk to our team" reply always shows the current number/email.
function buildFaqs(contact) {
  const phone = contact.phone || "+91 90417 95879";
  const email = contact.email || "support@homelandgroupindia.com";
  const wa = (contact.whatsapp || phone || "").replace(/[^0-9]/g, "");
  return [
    {
      q: "What projects do you offer?",
      a: "We craft luxury residential and commercial landmarks across Mohali, Chandigarh, New Chandigarh, Amritsar, Kasauli and Goa — including Homeland Regalia, CP67, Homeland Heights, Global Park and Infinia. Visit the Projects page to explore them all.",
    },
    {
      q: "Where are your projects located?",
      a: "Our developments are spread across the Tricity and beyond — Mohali (Sectors 67, 70, 75, 77), New Chandigarh, Amritsar, Kasauli (Himachal) and Goa. Check the Locations page for an interactive map.",
    },
    {
      q: "Are your projects RERA-registered?",
      a: "Yes — every Homeland project is RERA-registered with the Punjab Real Estate Regulatory Authority. You'll find all registration numbers on our RERA page.",
    },
    {
      q: "What are the price ranges?",
      a: "Prices vary by project and configuration. Share your requirement and our team will send you the latest price list, floor plans and current offers.",
    },
    {
      q: "How do I book a site visit?",
      a: "You can book a site visit from the 'Book a Visit' page, or leave your details via Enquire Now and our team will arrange a convenient time for you.",
    },
    {
      q: "I want to talk to your team",
      a: `Thank you for contacting Homeland Group! 🙏 Our team will get in touch with you shortly. Meanwhile, you can reach us directly:\n\n📞 ${phone}\n✉️ ${email}`,
      actions: [
        { label: "Call Now", href: `tel:${phone.replace(/\s/g, "")}`, icon: "phone" },
        wa ? { label: "WhatsApp", href: `https://wa.me/${wa}?text=${encodeURIComponent("Hi Homeland Group, I'd like to enquire about your projects.")}`, icon: "whatsapp" } : null,
        { label: "Email", href: `mailto:${email}`, icon: "mail" },
      ].filter(Boolean),
    },
  ];
}

// Strip any Markdown / special characters so AI replies render as clean plain
// text in a simple series (the model is also told to avoid them server-side).
function toPlainText(s) {
  return String(s || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[\t ]*[-•]\s+/gm, "")
    .replace(/\*/g, "")
    .trim();
}

const ActionIcon = ({ name }) => {
  if (name === "phone") return <Phone className="h-3.5 w-3.5" />;
  if (name === "mail") return <Mail className="h-3.5 w-3.5" />;
  return <MessageCircle className="h-3.5 w-3.5" />;
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState({ phone: "", email: "", whatsapp: "" });
  const scrollRef = useRef(null);

  useEffect(() => {
    getContent()
      .then((c) => setContact({ phone: c?.contact_phone || "", email: c?.contact_email || "", whatsapp: c?.contact_whatsapp || "" }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open, loading]);

  const faqs = buildFaqs(contact);

  // Answer a predefined question instantly (no API call).
  const askFaq = (faq) => {
    if (loading) return;
    setMessages((m) => [
      ...m,
      { role: "user", content: faq.q },
      { role: "assistant", content: faq.a, actions: faq.actions },
    ]);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await sendChat(next.filter((m) => m.role !== "system").map(({ role, content }) => ({ role, content })));
      setMessages((m) => [...m, { role: "assistant", content: toPlainText(reply) || "Sorry, I didn't catch that." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "I'm having trouble right now. Please try again, or tap 'I want to talk to your team' below." }]);
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
          className="fixed bottom-[12rem] right-6 z-[150] h-14 w-14 grid place-items-center rounded-full bg-[color:var(--lux-gold)] text-[#1b1710] shadow-[0_12px_34px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform"
        >
          <Bot className="h-7 w-7" />
        </button>
      )}

      {open && (
        <div
          data-testid="chatbot-panel"
          className="fixed bottom-6 right-6 z-[150] w-[min(92vw,380px)] h-[min(70vh,560px)] flex flex-col rounded-2xl overflow-hidden border border-[color:var(--border-gold)] bg-[color:var(--lux-charcoal)] shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
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
                <div className={`max-w-[85%] ${m.role === "user" ? "" : "w-full"}`}>
                  <div
                    data-testid={`chatbot-msg-${m.role}`}
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      m.role === "user"
                        ? "bg-[rgba(212,175,55,0.16)] text-ivory rounded-br-sm inline-block"
                        : "bg-white/5 text-[color:var(--lux-ivory)]/85 rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2" data-testid="chatbot-msg-actions">
                      {m.actions.map((a) => (
                        <a
                          key={a.label}
                          href={a.href}
                          target={a.icon === "whatsapp" ? "_blank" : undefined}
                          rel="noreferrer"
                          data-testid={`chatbot-action-${a.label.toLowerCase().replace(/\s+/g, "-")}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border-gold)] bg-[rgba(212,175,55,0.08)] px-3 py-1.5 text-xs font-semibold text-gold hover:bg-[rgba(212,175,55,0.18)] transition-colors"
                        >
                          <ActionIcon name={a.icon} /> {a.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start"><div className="rounded-2xl bg-white/5 px-3.5 py-2.5 text-sm text-[color:var(--lux-ivory)]/60 inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Typing…</div></div>
            )}
          </div>

          {/* Quick-reply question chips */}
          <div className="px-3 pt-2 border-t border-[color:var(--border-hairline)]">
            <div className="flex gap-2 overflow-x-auto pb-2" data-testid="chatbot-quick-replies">
              {faqs.map((f) => (
                <button
                  key={f.q}
                  onClick={() => askFaq(f)}
                  disabled={loading}
                  data-testid={`chatbot-faq-${f.q.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                  className="shrink-0 rounded-full border border-[color:var(--border-hairline)] bg-[color:var(--lux-obsidian)] px-3 py-1.5 text-xs text-[color:var(--lux-ivory)]/80 hover:border-[color:var(--border-gold)] hover:text-gold disabled:opacity-40 transition-colors"
                >
                  {f.q}
                </button>
              ))}
            </div>
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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success("Welcome back");
      nav("/admin");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const cls = "w-full rounded-xl bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] px-4 py-3 text-sm text-ivory placeholder:text-[color:var(--lux-ivory)]/40 focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]";

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-display text-3xl text-ivory">HOMELAND</div>
          <div className="text-[10px] tracking-[0.4em] text-gold uppercase mt-1">Admin Portal</div>
        </div>
        <form onSubmit={submit} className="rounded-2xl bg-glass hairline p-8">
          <div className="flex items-center gap-2 text-gold mb-6"><Lock className="h-5 w-5" /><span className="font-semibold">Sign in to continue</span></div>
          <label className="text-xs text-platinum mb-1.5 block">Email</label>
          <input data-testid="admin-email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={cls} placeholder="admin@homelandgroup.org" />
          <label className="text-xs text-platinum mb-1.5 block mt-4">Password</label>
          <input data-testid="admin-password-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={cls} placeholder="••••••••" />
          <button data-testid="admin-login-submit" disabled={loading} className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-6 py-3.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)] disabled:opacity-60 transition-colors">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, LogOut, CalendarCheck, MessageSquare, Sparkles, LogIn, Inbox } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import SectionHeading from "@/components/SectionHeading";
import FadeUp from "@/components/FadeUp";
import ProjectCard from "@/components/ProjectCard";
import { useUser } from "@/context/UserAuthContext";
import { getFavoriteProjects, getMyInquiries } from "@/lib/api";

const STATUS_STYLES = {
  new: "bg-[rgba(212,175,55,0.15)] text-gold border-[rgba(212,175,55,0.4)]",
  contacted: "bg-[rgba(96,165,250,0.15)] text-[#9ec5ff] border-[rgba(96,165,250,0.35)]",
  closed: "bg-white/5 text-[color:var(--lux-ivory)]/60 border-[color:var(--border-hairline)]",
};

function StatusPill({ status }) {
  const s = (status || "new").toLowerCase();
  const cls = STATUS_STYLES[s] || STATUS_STYLES.new;
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}>
      {s}
    </span>
  );
}

function fmtDate(v) {
  if (!v) return "";
  try { return new Date(v).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }
  catch { return String(v); }
}

export default function Account() {
  const { user, loading, login, logout, favorites } = useUser() || {};
  const [savedProjects, setSavedProjects] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [inqLoading, setInqLoading] = useState(true);

  const loadSaved = useCallback(async () => {
    setSavedLoading(true);
    try { setSavedProjects(await getFavoriteProjects()); } catch { setSavedProjects([]); }
    finally { setSavedLoading(false); }
  }, []);

  const loadInquiries = useCallback(async () => {
    setInqLoading(true);
    try { setInquiries(await getMyInquiries()); } catch { setInquiries([]); }
    finally { setInqLoading(false); }
  }, []);

  useEffect(() => {
    if (user) { loadSaved(); loadInquiries(); }
  }, [user, loadSaved, loadInquiries]);

  // Reflect favourite toggles made elsewhere (keeps the saved grid in sync)
  useEffect(() => {
    if (user && Array.isArray(favorites)) {
      setSavedProjects((prev) => prev.filter((p) => favorites.includes(p.slug)));
    }
  }, [favorites, user]);

  if (loading) {
    return (
      <div className="pt-14 pb-24">
        <div className="container-lux">
          <Skeleton className="h-10 w-64 bg-white/5" />
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-72 rounded-2xl bg-white/5" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-14 pb-24">
        <div className="container-lux">
          <div data-testid="account-signin-prompt" className="mx-auto max-w-lg rounded-2xl bg-glass hairline p-10 text-center">
            <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.35)]">
              <Sparkles className="h-6 w-6 text-gold" />
            </div>
            <h1 className="font-display text-2xl text-ivory mt-5">Your Homeland Account</h1>
            <p className="mt-2 text-sm text-[color:var(--lux-ivory)]/65">
              Sign in to save your favourite projects and keep track of every enquiry and site visit in one place.
            </p>
            <button
              onClick={login}
              data-testid="account-signin-button"
              className="mt-7 inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.1)] px-6 py-3 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.18)] transition-colors"
            >
              <LogIn className="h-4 w-4" /> Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-14 pb-24">
      <div className="container-lux">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-glass hairline p-6">
          <div className="flex items-center gap-4">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="h-14 w-14 rounded-full object-cover border border-[color:var(--border-gold)]" data-testid="account-avatar" />
            ) : (
              <span className="h-14 w-14 grid place-items-center rounded-full bg-[rgba(212,175,55,0.15)] text-gold text-xl font-semibold">{(user.name || "U")[0]}</span>
            )}
            <div>
              <div className="font-display text-xl text-ivory" data-testid="account-name">{user.name || "Member"}</div>
              <div className="text-sm text-[color:var(--lux-ivory)]/60" data-testid="account-email">{user.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            data-testid="account-logout"
            className="inline-flex items-center gap-2 rounded-xl bg-glass hairline px-4 py-2.5 text-sm font-semibold text-[color:var(--lux-ivory)]/80 hover:text-gold transition-colors self-start sm:self-auto"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        <div className="mt-10">
          <Tabs defaultValue="saved">
            <TabsList data-testid="account-tabs" className="bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)]">
              <TabsTrigger value="saved" data-testid="account-tab-saved" className="data-[state=active]:bg-[rgba(212,175,55,0.15)] data-[state=active]:text-gold">
                <Heart className="h-4 w-4 mr-2" /> Saved Projects
              </TabsTrigger>
              <TabsTrigger value="inquiries" data-testid="account-tab-inquiries" className="data-[state=active]:bg-[rgba(212,175,55,0.15)] data-[state=active]:text-gold">
                <MessageSquare className="h-4 w-4 mr-2" /> My Enquiries
              </TabsTrigger>
            </TabsList>

            {/* Saved projects */}
            <TabsContent value="saved" className="mt-8">
              {savedLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[0, 1, 2].map((i) => <Skeleton key={i} className="h-72 rounded-2xl bg-white/5" />)}
                </div>
              ) : savedProjects.length === 0 ? (
                <div data-testid="account-saved-empty" className="rounded-2xl bg-glass hairline p-10 text-center">
                  <Inbox className="mx-auto h-8 w-8 text-[color:var(--lux-ivory)]/40" />
                  <p className="mt-3 text-sm text-[color:var(--lux-ivory)]/65">You haven’t saved any projects yet.</p>
                  <Link to="/projects" className="mt-5 inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-5 py-2.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)]">
                    Explore developments
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="account-saved-grid">
                  {savedProjects.map((p) => (
                    <FadeUp key={p.slug}><ProjectCard project={p} /></FadeUp>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Enquiries */}
            <TabsContent value="inquiries" className="mt-8">
              {inqLoading ? (
                <div className="space-y-4">
                  {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl bg-white/5" />)}
                </div>
              ) : inquiries.length === 0 ? (
                <div data-testid="account-inquiries-empty" className="rounded-2xl bg-glass hairline p-10 text-center">
                  <Inbox className="mx-auto h-8 w-8 text-[color:var(--lux-ivory)]/40" />
                  <p className="mt-3 text-sm text-[color:var(--lux-ivory)]/65">No enquiries or site visits yet.</p>
                  <Link to="/contact" className="mt-5 inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-5 py-2.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)]">
                    Make an enquiry
                  </Link>
                </div>
              ) : (
                <div className="space-y-4" data-testid="account-inquiries-list">
                  {inquiries.map((it) => (
                    <div key={`${it.kind}-${it.id}`} data-testid={`account-inquiry-${it.id}`} className="rounded-2xl bg-glass hairline p-5 flex items-start gap-4">
                      <div className={`h-10 w-10 shrink-0 grid place-items-center rounded-full border ${it.kind === "visit" ? "bg-[rgba(96,165,250,0.12)] border-[rgba(96,165,250,0.35)] text-[#9ec5ff]" : "bg-[rgba(212,175,55,0.12)] border-[rgba(212,175,55,0.35)] text-gold"}`}>
                        {it.kind === "visit" ? <CalendarCheck className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] uppercase tracking-wider text-[color:var(--lux-ivory)]/50">
                            {it.kind === "visit" ? "Site Visit" : "Enquiry"}
                          </span>
                          <StatusPill status={it.status} />
                          <span className="text-xs text-[color:var(--lux-ivory)]/45 ml-auto">{fmtDate(it.created_at)}</span>
                        </div>
                        <div className="mt-1.5 font-semibold text-ivory truncate">{it.project || "General enquiry"}</div>
                        {it.kind === "visit" ? (
                          <div className="mt-1 text-sm text-[color:var(--lux-ivory)]/65">
                            {it.visit_date ? `Preferred: ${fmtDate(it.visit_date)}` : ""}{it.time_slot ? ` · ${it.time_slot}` : ""}{it.notes ? ` — ${it.notes}` : ""}
                          </div>
                        ) : (
                          <div className="mt-1 text-sm text-[color:var(--lux-ivory)]/65">
                            {it.requirement ? it.requirement : ""}{it.budget ? ` · ${it.budget}` : ""}{it.message ? ` — ${it.message}` : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw, Loader2, CheckCircle2, XCircle, Database, Cloud, Activity } from "lucide-react";
import { toast } from "sonner";
import { adminSyncStatus, adminSyncRun, getHealth } from "@/lib/api";

const card = "rounded-2xl bg-glass hairline p-5";
const lbl = "text-xs text-[color:var(--lux-ivory)]/50";

const Dot = ({ ok }) => (ok
  ? <CheckCircle2 className="h-4 w-4 text-[color:var(--lux-success,#2E8B6F)]" />
  : <XCircle className="h-4 w-4 text-destructive" />);

const fmtTime = (iso) => { if (!iso) return "Never"; try { return new Date(iso).toLocaleString(); } catch { return iso; } };

export default function AdminSync() {
  const [status, setStatus] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([adminSyncStatus(), getHealth().catch(() => null)]);
      setStatus(s); setHealth(h);
    } catch { toast.error("Could not load sync status"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  const runSync = async () => {
    setSyncing(true);
    try { const r = await adminSyncRun(); toast.success(r?.disabled ? "Sync is disabled (no MONGO_URL set)" : "Sync complete"); await load(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Sync failed"); }
    finally { setSyncing(false); }
  };

  if (loading) return <div className="text-[color:var(--lux-ivory)]/50" data-testid="admin-sync-loading">Loading…</div>;

  const counts = status?.counts || {};
  const lastSummary = status?.lastSummary || {};
  const rows = Object.keys(counts).sort();

  return (
    <div data-testid="admin-sync-page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-ivory">Sync &amp; Health</h1>
          <p className="text-sm text-[color:var(--lux-ivory)]/60 mt-1">Database connectivity and the MongoDB&nbsp;&rarr;&nbsp;MySQL mirror.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} data-testid="admin-sync-refresh" className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--border-hairline)] px-4 py-2.5 text-sm text-[color:var(--lux-ivory)]/80 hover:text-gold"><RefreshCw className="h-4 w-4" /> Refresh</button>
          <button onClick={runSync} disabled={syncing || !status?.enabled} data-testid="admin-sync-run"
            className="inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-4 py-2.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)] disabled:opacity-50">
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Sync now
          </button>
        </div>
      </div>

      {/* Top status cards */}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className={card} data-testid="admin-health-mysql">
          <div className="flex items-center gap-2 text-ivory"><Database className="h-4 w-4 text-gold" /><span className="text-sm font-semibold">MySQL</span></div>
          <div className="mt-3 flex items-center gap-2"><Dot ok={health?.mysql?.ok} /><span className="text-sm text-[color:var(--lux-ivory)]/80">{health?.mysql?.ok ? "Connected" : "Not connected"}</span></div>
          {health?.mysql?.error && <div className="mt-1 text-xs text-destructive">{health.mysql.error}</div>}
        </div>
        <div className={card} data-testid="admin-health-mongo">
          <div className="flex items-center gap-2 text-ivory"><Cloud className="h-4 w-4 text-gold" /><span className="text-sm font-semibold">MongoDB</span></div>
          <div className="mt-3 flex items-center gap-2">
            {health?.mongo?.configured ? <Dot ok={health?.mongo?.ok} /> : <span className="h-2 w-2 rounded-full bg-white/30" />}
            <span className="text-sm text-[color:var(--lux-ivory)]/80">{!health?.mongo?.configured ? "Not configured" : health?.mongo?.ok ? "Connected" : "Unreachable"}</span>
          </div>
          {health?.mongo?.error && <div className="mt-1 text-xs text-destructive">{health.mongo.error}</div>}
        </div>
        <div className={card} data-testid="admin-health-uptime">
          <div className="flex items-center gap-2 text-ivory"><Activity className="h-4 w-4 text-gold" /><span className="text-sm font-semibold">Server</span></div>
          <div className="mt-3 text-sm text-[color:var(--lux-ivory)]/80">Uptime: {health?.uptime_s != null ? `${Math.floor(health.uptime_s / 60)}m ${health.uptime_s % 60}s` : "—"}</div>
          <div className="mt-1 text-xs text-[color:var(--lux-ivory)]/50">Status: {health?.status || "—"}</div>
        </div>
      </div>

      {/* Mirror config + last run */}
      <div className={`${card} mt-4`}>
        <h2 className="text-sm font-semibold text-ivory mb-4">Mongo&nbsp;&rarr;&nbsp;MySQL Mirror</h2>
        {!status?.enabled ? (
          <div className="rounded-xl bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] p-4 text-sm text-[color:var(--lux-ivory)]/70" data-testid="admin-sync-disabled">
            The mirror is <b>disabled</b>. The site runs purely on MySQL. To enable it, set <code className="text-gold">MONGO_URL</code> in your server environment — MongoDB then becomes the source of truth and its data is copied into MySQL.
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><div className={lbl}>Source of truth</div><div className="text-sm text-ivory mt-0.5">{status.sourceOfTruth}</div></div>
              <div><div className={lbl}>Interval</div><div className="text-sm text-ivory mt-0.5">{status.intervalSec === 0 ? "One-time only" : `Every ${status.intervalSec}s`}</div></div>
              <div><div className={lbl}>Delete missing rows</div><div className="text-sm text-ivory mt-0.5">{status.deleteEnabled ? "Yes" : "No (safe)"}</div></div>
              <div><div className={lbl}>Last result</div><div className="text-sm mt-0.5 flex items-center gap-1.5">{status.lastResult ? <Dot ok={status.lastResult === "ok"} /> : null}<span className="text-ivory">{status.lastResult || "—"}</span></div></div>
              <div><div className={lbl}>Last run</div><div className="text-sm text-ivory mt-0.5">{fmtTime(status.lastRunAt)}</div></div>
              <div><div className={lbl}>Duration</div><div className="text-sm text-ivory mt-0.5">{status.lastDurationMs != null ? `${status.lastDurationMs} ms` : "—"}</div></div>
            </div>
            {status.lastError && <div className="mt-3 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive" data-testid="admin-sync-error">{status.lastError}</div>}
          </>
        )}
      </div>

      {/* Record counts */}
      <div className={`${card} mt-4`}>
        <h2 className="text-sm font-semibold text-ivory mb-3">MySQL Records</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="admin-sync-counts">
            <thead>
              <tr className="text-left text-[color:var(--lux-ivory)]/50 border-b border-[color:var(--border-hairline)]">
                <th className="py-2 pr-4 font-medium">Collection</th>
                <th className="py-2 pr-4 font-medium">Records in MySQL</th>
                <th className="py-2 pr-4 font-medium">Last sync (added/updated)</th>
                <th className="py-2 font-medium">Last sync (removed)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((name) => (
                <tr key={name} className="border-b border-[color:var(--border-hairline)]/50" data-testid={`admin-sync-row-${name}`}>
                  <td className="py-2 pr-4 text-ivory">{name}</td>
                  <td className="py-2 pr-4 text-[color:var(--lux-ivory)]/80">{counts[name] == null ? "—" : counts[name]}</td>
                  <td className="py-2 pr-4 text-[color:var(--lux-ivory)]/60">{lastSummary[name] ? lastSummary[name].upserts : "—"}</td>
                  <td className="py-2 text-[color:var(--lux-ivory)]/60">{lastSummary[name] ? lastSummary[name].deletes : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

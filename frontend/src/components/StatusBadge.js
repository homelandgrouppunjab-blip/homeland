import React from "react";

const MAP = {
  DELIVERED: "bg-white/[0.06] text-[color:var(--lux-platinum)] border-white/10",
  ONGOING: "bg-[rgba(212,175,55,0.10)] text-[color:var(--lux-gold)] border-[rgba(212,175,55,0.25)]",
  UPCOMING: "bg-[rgba(110,138,166,0.12)] text-[color:var(--lux-platinum)] border-[rgba(110,138,166,0.30)]",
};

export const StatusBadge = ({ status, className = "", testid }) => (
  <span
    data-testid={testid}
    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${MAP[status] || MAP.UPCOMING} ${className}`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
    {status}
  </span>
);

export default StatusBadge;

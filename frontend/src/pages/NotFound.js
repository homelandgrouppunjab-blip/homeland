import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] grid place-items-center container-lux text-center">
      <div>
        <div className="font-display text-7xl text-gold">404</div>
        <h1 className="font-display text-3xl text-ivory mt-4">Page Not Found</h1>
        <p className="text-[color:var(--lux-ivory)]/60 mt-2">The address you're looking for doesn't exist.</p>
        <Link to="/" className="mt-8 inline-flex rounded-xl border gold-line px-6 py-3 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.08)]">Back to Home</Link>
      </div>
    </div>
  );
}

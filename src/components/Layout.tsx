// Placeholder for a simple, professional layout
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-primary)]">
      <header className="shadow p-4 bg-white flex items-center justify-between">
        <div className="font-bold text-xl tracking-wide">SFGS Admin Portal</div>
      </header>
      <main className="max-w-5xl mx-auto p-6">{children}</main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload PDFs" },
  { href: "/files", label: "Uploaded Files" },
  { href: "/queue", label: "Email Queue" },
  { href: "/birthdays", label: "Student Birthdays" }, // Added birthdays page
  { href: "/history/sent", label: "Sent History" },
  { href: "/history/failed", label: "Failed Emails" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-2 p-6 min-h-screen bg-gradient-to-b from-white via-bg to-gray-100 border-r border-gray-200 shadow-sm">
      <div className="mb-8 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-md">
          S
        </div>
        <div className="text-xl font-bold tracking-wide text-primary">
          SFGS Admin
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-1">
        {navLinks.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium transition-colors
                ${
                  active
                    ? "bg-primary/10 text-primary font-semibold border-l-4 border-accent"
                    : "text-secondary hover:bg-bg hover:text-primary"
                }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

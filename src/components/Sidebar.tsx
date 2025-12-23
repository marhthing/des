import Link from "next/link";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload PDFs" },
  { href: "/files", label: "Uploaded Files" },
  { href: "/queue", label: "Email Queue" },
  { href: "/history/sent", label: "Sent History" },
  { href: "/history/failed", label: "Failed Emails" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  return (
    <nav className="flex flex-col gap-2 p-6">
      <div className="mb-8 text-xl font-bold tracking-wide text-primary">
        SFGS Admin Portal
      </div>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded px-3 py-2 text-base font-medium text-secondary hover:bg-bg hover:text-primary transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

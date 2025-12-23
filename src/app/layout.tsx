import { Sidebar } from "../components";
import "../styles/globals.css";

export const metadata = {
  title: "SFGS Admin Portal",
  description:
    "Professional, calm, trustworthy admin dashboard for SURE FOUNDATION GROUP OF SCHOOL",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-primary min-h-screen">
        <div className="flex min-h-screen">
          <aside className="hidden md:block w-64 bg-white border-r shadow-sm">
            <Sidebar />
          </aside>
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

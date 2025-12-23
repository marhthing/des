"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "sfgsadmin") {
      // Set cookie for middleware authentication
      document.cookie = "sfgs_admin_logged_in=1; path=/;";
      router.push("/dashboard");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-bg">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded p-8 w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center mb-2 text-primary">
          SFGS Admin Login
        </h1>
        <input
          type="password"
          className="border rounded p-2 w-full"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}
        <button
          type="submit"
          className="bg-primary text-white py-2 rounded hover:bg-secondary transition-colors font-semibold"
        >
          Login
        </button>
      </form>
    </main>
  );
}

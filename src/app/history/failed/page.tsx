"use client";
import React, { useEffect, useState } from "react";

interface FailedEmailItem {
  id: string;
  Student?: { student_name: string } | null;
  matric_number: string;
  recipient_email: string;
  email_type: string;
  status: string;
  created_at: string;
  error_message?: string;
}

export default function FailedHistoryPage() {
  const [failed, setFailed] = useState<FailedEmailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/email-queue?status=failed")
      .then((res) => res.json())
      .then(setFailed)
      .catch(() => setError("Failed to load failed emails"))
      .finally(() => setLoading(false));
  }, []);

  const handleRetry = async (id: string) => {
    await fetch(`/api/email-queue/retry?id=${id}`, { method: "POST" });
    setFailed((failed) => failed.filter((f) => f.id !== id)); // Optimistic update
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <svg
          className="w-7 h-7 text-error"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-2xl font-extrabold text-primary">Failed Emails</h1>
        <span className="text-sm text-gray-400 font-medium">
          Emails that failed to send
        </span>
      </div>
      {loading && (
        <div className="flex items-center justify-center h-40">
          <span className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-error mr-3"></span>
          <span className="text-lg text-gray-500">
            Loading failed emails...
          </span>
        </div>
      )}
      {error && (
        <div className="text-red-600 mt-4 font-medium bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}
      {!loading && !error && failed.length === 0 && (
        <div className="text-center text-gray-400 py-12">No failed emails.</div>
      )}
      {!loading && !error && failed.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full text-sm border bg-white">
            <thead className="bg-bg sticky top-0 z-10">
              <tr>
                <th className="p-2 border">Student Name</th>
                <th className="p-2 border">Matric Number</th>
                <th className="p-2 border">Recipient Email</th>
                <th className="p-2 border">Email Type</th>
                <th className="p-2 border">Created At</th>
                <th className="p-2 border">Error</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {failed.map((f) => (
                <tr
                  key={f.id}
                  className="text-center even:bg-gray-50 hover:bg-error/10 transition"
                >
                  <td className="border p-2 font-medium text-secondary">
                    {f.Student?.student_name || "-"}
                  </td>
                  <td className="border p-2">{f.matric_number}</td>
                  <td className="border p-2">{f.recipient_email}</td>
                  <td className="border p-2">{f.email_type}</td>
                  <td className="border p-2">
                    {new Date(f.created_at).toLocaleString()}
                  </td>
                  <td className="border p-2 text-red-600">
                    {f.error_message || "-"}
                  </td>
                  <td className="border p-2">
                    <button
                      className="bg-accent text-white px-3 py-1 rounded hover:bg-primary transition text-xs font-semibold"
                      onClick={() => handleRetry(f.id)}
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

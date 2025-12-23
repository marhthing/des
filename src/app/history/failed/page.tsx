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
    <div>
      <h1 className="text-2xl font-bold mb-4">Failed Emails</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-bg">
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
              <tr key={f.id} className="text-center">
                <td className="border p-2">{f.Student?.student_name || "-"}</td>
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
                    className="text-blue-600 underline"
                    onClick={() => handleRetry(f.id)}
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";

interface EmailHistoryItem {
  id: string;
  Student?: { student_name: string } | null;
  matric_number: string;
  recipient_email: string;
  email_type: string;
  status: string;
  created_at: string;
  sent_at?: string;
}

export default function SentHistoryPage() {
  const [history, setHistory] = useState<EmailHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/email-queue?status=sent")
      .then((res) => res.json())
      .then(setHistory)
      .catch(() => setError("Failed to load sent history"))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    const csv = [
      [
        "Student Name",
        "Matric Number",
        "Recipient Email",
        "Email Type",
        "Created At",
        "Sent At",
      ],
      ...history.map((h) => [
        h.Student?.student_name || "-",
        h.matric_number,
        h.recipient_email,
        h.email_type,
        new Date(h.created_at).toLocaleString(),
        h.sent_at ? new Date(h.sent_at).toLocaleString() : "-",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sent_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <svg
          className="w-7 h-7 text-accent"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 12v4m0 0v4m0-4h4m-4 0H8m8-8a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <h1 className="text-2xl font-extrabold text-primary">Sent History</h1>
        <span className="text-sm text-gray-400 font-medium">
          All successfully sent emails
        </span>
      </div>
      <button
        onClick={handleExportCSV}
        className="mb-4 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary transition flex items-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Export CSV
      </button>
      {loading && (
        <div className="flex items-center justify-center h-40">
          <span className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-primary mr-3"></span>
          <span className="text-lg text-gray-500">Loading sent history...</span>
        </div>
      )}
      {error && (
        <div className="text-red-600 mt-4 font-medium bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}
      {!loading && !error && history.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          No sent emails yet.
        </div>
      )}
      {!loading && !error && history.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full text-sm border bg-white">
            <thead className="bg-bg sticky top-0 z-10">
              <tr>
                <th className="p-2 border">Student Name</th>
                <th className="p-2 border">Matric Number</th>
                <th className="p-2 border">Recipient Email</th>
                <th className="p-2 border">Email Type</th>
                <th className="p-2 border">Created At</th>
                <th className="p-2 border">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr
                  key={h.id}
                  className="text-center even:bg-gray-50 hover:bg-accent/10 transition"
                >
                  <td className="border p-2 font-medium text-secondary">
                    {h.Student?.student_name || "-"}
                  </td>
                  <td className="border p-2">{h.matric_number}</td>
                  <td className="border p-2">{h.recipient_email}</td>
                  <td className="border p-2">{h.email_type}</td>
                  <td className="border p-2">
                    {new Date(h.created_at).toLocaleString()}
                  </td>
                  <td className="border p-2">
                    {h.sent_at ? new Date(h.sent_at).toLocaleString() : "-"}
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

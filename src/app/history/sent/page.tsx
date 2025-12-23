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
    <div>
      <h1 className="text-2xl font-bold mb-4">Sent History</h1>
      <button
        onClick={handleExportCSV}
        className="mb-4 bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
      >
        Export CSV
      </button>
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
              <th className="p-2 border">Sent At</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="text-center">
                <td className="border p-2">{h.Student?.student_name || "-"}</td>
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
      )}
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";

interface QueueItem {
  id: string;
  Student?: { student_name: string } | null;
  matric_number: string;
  recipient_email: string;
  email_type: string;
  status: string;
  created_at: string;
  sent_at?: string;
  error_message?: string;
}

export default function QueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: "",
    email_type: "",
    matric_number: "",
  });

  useEffect(() => {
    let url = "/api/email-queue";
    const params = new URLSearchParams();
    if (filter.status) params.append("status", filter.status);
    if (filter.email_type) params.append("email_type", filter.email_type);
    if (filter.matric_number)
      params.append("matric_number", filter.matric_number);
    if (Array.from(params).length) url += "?" + params.toString();
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then(setQueue)
      .catch(() => setError("Failed to load email queue"))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleRetry = async (id: string) => {
    // Implement retry logic (API call to update status to 'pending')
    await fetch(`/api/email-queue/retry?id=${id}`, { method: "POST" });
    setFilter({ ...filter }); // Refresh
  };
  const handleCancel = async (id: string) => {
    // Implement cancel logic (API call to update status to 'cancelled')
    await fetch(`/api/email-queue/cancel?id=${id}`, { method: "POST" });
    setFilter({ ...filter }); // Refresh
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Email Queue</h1>
      <div className="flex gap-4 mb-4">
        <label htmlFor="status-filter" className="sr-only">
          Status
        </label>
        <select
          id="status-filter"
          title="Status"
          className="border p-2"
          value={filter.status}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
        <label htmlFor="type-filter" className="sr-only">
          Email Type
        </label>
        <select
          id="type-filter"
          title="Email Type"
          className="border p-2"
          value={filter.email_type}
          onChange={(e) =>
            setFilter((f) => ({ ...f, email_type: e.target.value }))
          }
        >
          <option value="">All Types</option>
          <option value="pdf">PDF</option>
          <option value="birthday">Birthday</option>
        </select>
        <input
          className="border p-2"
          placeholder="Matric Number"
          value={filter.matric_number}
          onChange={(e) =>
            setFilter((f) => ({ ...f, matric_number: e.target.value }))
          }
        />
      </div>
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
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Created At</th>
              <th className="p-2 border">Sent At</th>
              <th className="p-2 border">Error</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((q) => (
              <tr key={q.id} className="text-center">
                <td className="border p-2">{q.Student?.student_name || "-"}</td>
                <td className="border p-2">{q.matric_number}</td>
                <td className="border p-2">{q.recipient_email}</td>
                <td className="border p-2">{q.email_type}</td>
                <td className="border p-2">{q.status}</td>
                <td className="border p-2">
                  {new Date(q.created_at).toLocaleString()}
                </td>
                <td className="border p-2">
                  {q.sent_at ? new Date(q.sent_at).toLocaleString() : "-"}
                </td>
                <td className="border p-2 text-red-600">
                  {q.error_message || "-"}
                </td>
                <td className="border p-2">
                  {q.status === "failed" && (
                    <button
                      className="text-blue-600 underline"
                      onClick={() => handleRetry(q.id)}
                    >
                      Retry
                    </button>
                  )}
                  {q.status === "pending" && (
                    <button
                      className="text-red-600 underline ml-2"
                      onClick={() => handleCancel(q.id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

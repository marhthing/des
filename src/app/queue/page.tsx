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
        <h1 className="text-2xl font-extrabold text-primary">Email Queue</h1>
        <span className="text-sm text-gray-400 font-medium">
          Pending and scheduled emails
        </span>
      </div>
      <div className="flex flex-wrap gap-4 mb-4">
        {" "}
        <select
          id="status-filter"
          title="Status filter"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-accent focus:outline-none text-sm"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>{" "}
        <select
          id="type-filter"
          title="Type filter"
          value={filter.email_type}
          onChange={(e) => setFilter({ ...filter, email_type: e.target.value })}
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-accent focus:outline-none text-sm"
        >
          <option value="">All Types</option>
          <option value="result">Result</option>
          <option value="birthday">Birthday</option>
        </select>
        <input
          type="text"
          placeholder="Matric Number"
          value={filter.matric_number}
          onChange={(e) =>
            setFilter({ ...filter, matric_number: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-accent focus:outline-none text-sm"
        />
      </div>
      {loading && (
        <div className="flex items-center justify-center h-40">
          <span className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-primary mr-3"></span>
          <span className="text-lg text-gray-500">Loading queue...</span>
        </div>
      )}
      {error && (
        <div className="text-red-600 mt-4 font-medium bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}
      {!loading && !error && queue.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          No emails in the queue.
        </div>
      )}
      {!loading && !error && queue.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full text-sm border bg-white">
            <thead className="bg-bg sticky top-0 z-10">
              <tr>
                <th className="p-2 border">Student Name</th>
                <th className="p-2 border">Matric Number</th>
                <th className="p-2 border">Recipient Email</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Created</th>
                <th className="p-2 border">Sent</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((q) => (
                <tr
                  key={q.id}
                  className="text-center even:bg-gray-50 hover:bg-accent/10 transition"
                >
                  <td className="border p-2 font-medium text-secondary">
                    {q.Student?.student_name || "-"}
                  </td>
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
                  <td className="border p-2 flex gap-2 justify-center">
                    {q.status === "failed" && (
                      <button
                        onClick={() => handleRetry(q.id)}
                        className="bg-accent text-white px-3 py-1 rounded hover:bg-primary transition text-xs font-semibold"
                      >
                        Retry
                      </button>
                    )}
                    {q.status === "pending" && (
                      <button
                        onClick={() => handleCancel(q.id)}
                        className="bg-error text-white px-3 py-1 rounded hover:bg-secondary transition text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    )}
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

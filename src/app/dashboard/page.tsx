"use client";

import React, { useEffect, useState } from "react";

interface DashboardData {
  totalStudents: number;
  emailsSentToday: number;
  emailsPending: number;
  emailsFailed: number;
  lastCronTime: string | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError("Failed to load dashboard metrics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total Students" value={data.totalStudents} />
        <StatCard label="Emails Sent Today" value={data.emailsSentToday} />
        <StatCard label="Emails Pending" value={data.emailsPending} />
        <StatCard label="Emails Failed" value={data.emailsFailed} />
        <StatCard
          label="Last Cron Execution"
          value={
            data.lastCronTime
              ? new Date(data.lastCronTime).toLocaleString()
              : "Never"
          }
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded shadow p-6 flex flex-col items-center">
      <div className="text-lg text-secondary mb-2">{label}</div>
      <div className="text-2xl font-bold text-primary">{value}</div>
    </div>
  );
}

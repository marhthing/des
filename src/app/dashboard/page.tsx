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

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-3"></span>
        <span className="text-lg text-gray-500">Loading dashboard...</span>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-red-600 text-lg">{error}</span>
      </div>
    );
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="text-3xl font-extrabold text-primary flex items-center gap-2">
          <svg
            className="w-8 h-8 text-accent"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 3v4M8 3v4m-5 4h18"
            />
          </svg>
          Dashboard
        </div>
        <span className="text-sm text-gray-400 font-medium">
          SFGS Admin Overview
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Total Students"
          value={data.totalStudents}
          icon="users"
        />
        <StatCard
          label="Emails Sent Today"
          value={data.emailsSentToday}
          icon="mail"
        />
        <StatCard
          label="Emails Pending"
          value={data.emailsPending}
          icon="clock"
        />
        <StatCard
          label="Emails Failed"
          value={data.emailsFailed}
          icon="alert"
        />
        <StatCard
          label="Last Cron Execution"
          value={
            data.lastCronTime
              ? new Date(data.lastCronTime).toLocaleString()
              : "Never"
          }
          icon="calendar"
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    users: (
      <svg
        className="w-6 h-6 text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    mail: (
      <svg
        className="w-6 h-6 text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    clock: (
      <svg
        className="w-6 h-6 text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    alert: (
      <svg
        className="w-6 h-6 text-accent"
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
    ),
    calendar: (
      <svg
        className="w-6 h-6 text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 2v4M8 2v4m-5 4h18"
        />
      </svg>
    ),
  };
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border-t-4 border-accent/60 hover:shadow-lg transition-shadow">
      <div className="mb-2">{icon && icons[icon]}</div>
      <div className="text-lg text-secondary mb-1 font-medium">{label}</div>
      <div className="text-3xl font-extrabold text-primary">{value}</div>
    </div>
  );
}

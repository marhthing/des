"use client";

import React, { useEffect, useState } from "react";

interface Settings {
  daily_email_limit: number;
  sender_email: string;
  email_interval_minutes: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSettings)
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!settings) return;
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) setSuccess("Settings saved!");
    else setError("Failed to save settings");
  };

  const handleTestEmail = async () => {
    setTestResult(null);
    const res = await fetch("/api/settings/test-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: testEmail }),
    });
    const data = await res.json();
    setTestResult(
      data.success
        ? "Test email sent!"
        : data.error || "Failed to send test email"
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-3"></span>
        <span className="text-lg text-gray-500">Loading settings...</span>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-red-600 text-lg">{error}</span>
      </div>
    );
  if (!settings) return null;

  return (
    <div className="max-w-lg mx-auto py-8">
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        <h1 className="text-2xl font-extrabold text-primary">Settings</h1>
        <span className="text-sm text-gray-400 font-medium">
          System configuration
        </span>
      </div>
      <form
        onSubmit={handleSave}
        className="space-y-6 bg-white p-8 rounded-xl shadow-md border-t-4 border-accent/60"
      >
        <div>
          <label
            className="block font-semibold mb-2 text-secondary"
            htmlFor="sender-email"
          >
            Sender Email
          </label>
          <input
            id="sender-email"
            type="email"
            value={settings.sender_email}
            readOnly
            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100"
            title="Sender email address"
            placeholder="Sender email"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-secondary">
            Daily Email Limit
          </label>
          <input
            type="number"
            value={settings.daily_email_limit}
            min={1}
            onChange={(e) =>
              setSettings((s) =>
                s ? { ...s, daily_email_limit: +e.target.value } : s
              )
            }
            className="w-full border border-gray-300 rounded-lg p-3"
            title="Daily email limit"
            placeholder="Daily email limit"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-secondary">
            Email Interval (minutes)
          </label>
          <input
            type="number"
            value={settings.email_interval_minutes}
            min={1}
            onChange={(e) =>
              setSettings((s) =>
                s ? { ...s, email_interval_minutes: +e.target.value } : s
              )
            }
            className="w-full border border-gray-300 rounded-lg p-3"
            title="Email interval in minutes"
            placeholder="Email interval in minutes"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-secondary transition disabled:opacity-50 flex items-center gap-2"
        >
          Save Settings
        </button>
      </form>
      {success && (
        <div className="text-green-700 mt-4 font-medium bg-green-50 border border-green-200 rounded p-3">
          {success}
        </div>
      )}
      {error && (
        <div className="text-red-600 mt-4 font-medium bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}
      <div className="mt-8">
        <h2 className="font-semibold mb-2 text-lg text-primary">
          Send Test Email
        </h2>
        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 flex-1"
            placeholder="Recipient email address"
          />
          <button
            type="button"
            onClick={handleTestEmail}
            className="bg-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary transition"
          >
            Send Test
          </button>
        </div>
        {testResult && (
          <div
            className={`mt-2 font-medium rounded p-2 ${
              testResult.includes("sent")
                ? "text-green-700 bg-green-50 border border-green-200"
                : "text-red-600 bg-red-50 border border-red-200"
            }`}
          >
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
}

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!settings) return null;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <form
        onSubmit={handleSave}
        className="space-y-4 bg-white p-6 rounded shadow"
      >
        <div>
          <label className="block font-medium mb-1" htmlFor="sender-email">
            Sender Email
          </label>
          <input
            id="sender-email"
            type="email"
            value={settings.sender_email}
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
            title="Sender email address"
            placeholder="Sender email"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Daily Email Limit</label>
          <input
            type="number"
            value={settings.daily_email_limit}
            min={1}
            onChange={(e) =>
              setSettings((s) =>
                s ? { ...s, daily_email_limit: +e.target.value } : s
              )
            }
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">
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
            className="w-full border rounded p-2"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
        >
          Save
        </button>
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
      <div className="mt-8">
        <label className="block font-medium mb-1">Send Test Email</label>
        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Recipient email"
            className="border rounded p-2 flex-1"
          />
          <button
            onClick={handleTestEmail}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
          >
            Send
          </button>
        </div>
        {testResult && <div className="mt-2 text-blue-600">{testResult}</div>}
      </div>
    </div>
  );
}

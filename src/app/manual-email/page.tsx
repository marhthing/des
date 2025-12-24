"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ManualEmailPage() {
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sender, setSender] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    setSuccess("");
    let attachmentUrl = null;
    if (file) {
      const { data, error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(`manual/${Date.now()}_${file.name}`, file, { upsert: true });
      if (uploadError) {
        setError("Failed to upload attachment.");
        setSending(false);
        return;
      }
      attachmentUrl = data?.path;
    }
    const res = await fetch("/api/email-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipients: recipients.split(/[,;\s]+/).filter(Boolean),
        subject,
        body,
        sender,
        attachmentUrl,
        manual: true,
      }),
    });
    setSending(false);
    if (res.ok) {
      setSuccess("Email queued successfully.");
      setRecipients("");
      setSubject("");
      setBody("");
      setSender("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      setError("Failed to queue email.");
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Send Manual Email</h1>
      <form
        onSubmit={handleSend}
        className="bg-white rounded shadow p-6 flex flex-col gap-4"
      >
        <input
          className="border rounded px-3 py-2"
          placeholder="Sender Email (optional)"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Recipient Email(s), comma or space separated"
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <textarea
          className="border rounded px-3 py-2 min-h-[120px]"
          placeholder="Message body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <input
          type="file"
          ref={fileInputRef}
          className="border rounded px-3 py-2"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xls,.xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
          disabled={sending}
        >
          {sending ? "Sending..." : "Send Email"}
        </button>
      </form>
    </div>
  );
}

"use client";
import React, { useRef, useState } from "react";

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResults([]);
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) {
      setError("Please select PDF files to upload.");
      setLoading(false);
      return;
    }
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    try {
      const res = await fetch("/api/upload-pdfs", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResults(data.results);
    } catch (err) {
      setError("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload PDFs</h1>
      <form
        onSubmit={handleUpload}
        className="space-y-4 bg-white p-6 rounded shadow"
      >
        <label htmlFor="pdf-upload" className="block font-medium mb-1">
          Select PDF files
        </label>
        <input
          id="pdf-upload"
          type="file"
          ref={fileInputRef}
          accept="application/pdf"
          multiple
          className="block w-full border rounded p-2"
          title="Select PDF files to upload"
          placeholder="Choose PDF files"
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {error && <div className="text-red-600 mt-4">{error}</div>}
      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Upload Results</h2>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-bg">
                <th className="p-2 border">File</th>
                <th className="p-2 border">Matched</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="text-center">
                  <td className="border p-2">{r.file}</td>
                  <td className="border p-2">{r.matched ? "Yes" : "No"}</td>
                  <td className="border p-2">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

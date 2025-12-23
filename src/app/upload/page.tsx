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
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        <h1 className="text-3xl font-extrabold text-primary">Upload PDFs</h1>
        <span className="text-sm text-gray-400 font-medium">
          Upload student result PDFs for processing
        </span>
      </div>
      <form
        onSubmit={handleUpload}
        className="space-y-6 bg-white p-8 rounded-xl shadow-md border-t-4 border-accent/60"
      >
        <div>
          <label
            htmlFor="pdf-upload"
            className="block font-semibold mb-2 text-secondary"
          >
            Select PDF files
          </label>
          <input
            id="pdf-upload"
            type="file"
            ref={fileInputRef}
            accept="application/pdf"
            multiple
            className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-accent focus:outline-none transition"
            title="Select PDF files to upload"
            placeholder="Choose PDF files"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-secondary transition disabled:opacity-50 flex items-center gap-2"
          disabled={loading}
        >
          {loading && (
            <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
          )}
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {error && (
        <div className="text-red-600 mt-4 font-medium bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}
      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold mb-3 text-lg text-primary flex items-center gap-2">
            <svg
              className="w-5 h-5 text-accent"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4"
              />
            </svg>
            Upload Results
          </h2>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="w-full text-sm border bg-white">
              <thead className="bg-bg sticky top-0 z-10">
                <tr>
                  <th className="p-2 border">File</th>
                  <th className="p-2 border">Matched</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr
                    key={i}
                    className="text-center even:bg-gray-50 hover:bg-accent/10 transition"
                  >
                    <td className="border p-2 font-medium text-secondary">
                      {r.file}
                    </td>
                    <td className="border p-2">
                      {r.matched ? (
                        <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">
                          No
                        </span>
                      )}
                    </td>
                    <td className="border p-2">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

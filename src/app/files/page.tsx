"use client";

import React, { useEffect, useState } from "react";

interface UploadedFile {
  id: string;
  original_file_name: string;
  matric_number_parsed: string;
  status: string;
  uploaded_at: string;
  Student?: { student_name: string } | null;
}

export default function FilesPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/uploaded-files")
      .then((res) => res.json())
      .then(setFiles)
      .catch(() => setError("Failed to load uploaded files"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
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
            d="M4 16V8a2 2 0 012-2h8l6 6v4a2 2 0 01-2 2H6a2 2 0 01-2-2z"
          />
        </svg>
        <h1 className="text-2xl font-extrabold text-primary">Uploaded Files</h1>
        <span className="text-sm text-gray-400 font-medium">
          All processed PDF uploads
        </span>
      </div>
      {loading && (
        <div className="flex items-center justify-center h-40">
          <span className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-primary mr-3"></span>
          <span className="text-lg text-gray-500">Loading files...</span>
        </div>
      )}
      {error && (
        <div className="text-red-600 mt-4 font-medium bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}
      {!loading && !error && files.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          No files uploaded yet.
        </div>
      )}
      {!loading && !error && files.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full text-sm border bg-white">
            <thead className="bg-bg sticky top-0 z-10">
              <tr>
                <th className="p-2 border">File Name</th>
                <th className="p-2 border">Parsed Matric Number</th>
                <th className="p-2 border">Student Name</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Uploaded Date</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr
                  key={f.id}
                  className="text-center even:bg-gray-50 hover:bg-accent/10 transition"
                >
                  <td className="border p-2 font-medium text-secondary">
                    {f.original_file_name}
                  </td>
                  <td className="border p-2">{f.matric_number_parsed}</td>
                  <td className="border p-2">
                    {f.Student?.student_name || "-"}
                  </td>
                  <td className="border p-2">{f.status}</td>
                  <td className="border p-2">
                    {new Date(f.uploaded_at).toLocaleString()}
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

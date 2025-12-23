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
    <div>
      <h1 className="text-2xl font-bold mb-4">Uploaded Files</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-bg">
              <th className="p-2 border">File Name</th>
              <th className="p-2 border">Parsed Matric Number</th>
              <th className="p-2 border">Student Name</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Uploaded Date</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id} className="text-center">
                <td className="border p-2">{f.original_file_name}</td>
                <td className="border p-2">{f.matric_number_parsed}</td>
                <td className="border p-2">{f.Student?.student_name || "-"}</td>
                <td className="border p-2">{f.status}</td>
                <td className="border p-2">
                  {new Date(f.uploaded_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

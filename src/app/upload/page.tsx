"use client";
import React, { useRef, useState, useEffect, Fragment } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, Transition } from "@headlessui/react";

export default function UploadPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("Student")
        .select("id, matric_number, student_name");
      if (error) {
        setError("Failed to load students.");
        setStudents([]);
      } else {
        setStudents(data || []);
      }
      setLoading(false);
    }
    fetchStudents();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !selectedStudent) return;
    setUploading(true);
    setError(null);
    setSuccess("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("matric_number", selectedStudent.matric_number);
    const res = await fetch("/api/upload-pdfs", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setUploading(false);
    if (data.error) {
      setError(data.error);
    } else {
      setSuccess("File uploaded successfully.");
      setShowUploadModal(false);
      setFile(null);
      setSelectedStudent(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Upload Student PDF</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading students...
        </div>
      ) : (
        <ul className="bg-white rounded shadow divide-y">
          {students.map((s: any) => (
            <li
              key={s.id}
              className="flex items-center justify-between px-4 py-2"
            >
              <span>
                {s.student_name}{" "}
                <span className="text-xs text-gray-400">
                  ({s.matric_number})
                </span>
              </span>
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium"
                onClick={() => {
                  setSelectedStudent(s);
                  setShowUploadModal(true);
                }}
              >
                Upload PDF
              </button>
            </li>
          ))}
          {students.length === 0 && (
            <li className="px-4 py-2 text-gray-400">No students found.</li>
          )}
        </ul>
      )}
      <Transition.Root show={showUploadModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowUploadModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-40 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Upload PDF for {selectedStudent?.student_name} (
                    {selectedStudent?.matric_number})
                  </Dialog.Title>
                  <form onSubmit={handleUpload} className="flex flex-col gap-3">
                    <input
                      type="file"
                      accept="application/pdf"
                      className="border rounded px-2 py-1"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                      placeholder="Select PDF file"
                      title="Select PDF file"
                    />
                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                    )}
                    {success && (
                      <div className="text-green-600 text-sm">{success}</div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : "Upload"}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 text-sm font-medium"
                        onClick={() => setShowUploadModal(false)}
                        disabled={uploading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}

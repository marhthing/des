"use client";
import { useEffect, useState, Fragment } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, Transition } from "@headlessui/react";

export default function UploadByStudentPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [uploaded, setUploaded] = useState<any[]>([]);
  const [notUploaded, setNotUploaded] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [archived, setArchived] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setError("");
    setSuccess("");
    // Get all students
    const { data: studentsData, error: studentsError } = await supabase
      .from("Student")
      .select("id, matric_number, student_name");
    if (studentsError) {
      setError("Failed to load students");
      return;
    }
    // Get all uploaded files (not archived)
    const { data: filesData } = await supabase
      .from("UploadedFile")
      .select("id, student_id, status, uploaded_at")
      .not("status", "eq", "archived");
    // Get all email queue entries
    const { data: queueData } = await supabase
      .from("EmailQueue")
      .select("student_id, status, created_at");
    // Partition students
    const uploadedMap = new Map(filesData?.map((f) => [f.student_id, f]) || []);
    const pendingSet = new Set(
      (queueData || [])
        .filter((q) => q.status === "queued" || q.status === "pending")
        .map((q) => q.student_id)
    );
    const sentSet = new Set(
      (queueData || [])
        .filter((q) => q.status === "sent")
        .map((q) => q.student_id)
    );
    const archivedSet = new Set(
      (filesData || [])
        .filter((f) => f.status === "archived")
        .map((f) => f.student_id)
    );
    setStudents(studentsData || []);
    setUploaded(
      (studentsData || []).filter(
        (s) =>
          uploadedMap.has(s.id) && !pendingSet.has(s.id) && !sentSet.has(s.id)
      )
    );
    setNotUploaded((studentsData || []).filter((s) => !uploadedMap.has(s.id)));
    setPending((studentsData || []).filter((s) => pendingSet.has(s.id)));
    setSent((studentsData || []).filter((s) => sentSet.has(s.id)));
    setArchived((studentsData || []).filter((s) => archivedSet.has(s.id)));
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !selectedStudent) return;
    setUploading(true);
    setError("");
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
      fetchData();
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        Student File Upload & Email Queue
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold text-lg mb-2">
            Students (No File Uploaded)
          </h2>
          <ul className="bg-white rounded shadow divide-y">
            {notUploaded.map((s: any) => (
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
                  Upload File
                </button>
              </li>
            ))}
            {notUploaded.length === 0 && (
              <li className="px-4 py-2 text-gray-400">
                All students have files uploaded.
              </li>
            )}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-2">
            Students (File Uploaded, Not Sent)
          </h2>
          <ul className="bg-white rounded shadow divide-y">
            {uploaded.map((s: any) => (
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
                  className="px-3 py-1 rounded bg-green-600 text-white text-xs font-medium"
                  onClick={() => {
                    /* Optionally preview or manage */
                  }}
                >
                  Ready to Send
                </button>
              </li>
            ))}
            {uploaded.length === 0 && (
              <li className="px-4 py-2 text-gray-400">
                No uploaded files pending sending.
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold text-lg mb-2">Pending Sending</h2>
          <ul className="bg-white rounded shadow divide-y">
            {pending.map((s: any) => (
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
                <span className="text-yellow-600 text-xs font-medium">
                  Queued
                </span>
              </li>
            ))}
            {pending.length === 0 && (
              <li className="px-4 py-2 text-gray-400">
                No students pending sending.
              </li>
            )}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-2">Sent This Month</h2>
          <ul className="bg-white rounded shadow divide-y">
            {sent.map((s: any) => (
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
                <span className="text-green-700 text-xs font-medium">Sent</span>
              </li>
            ))}
            {sent.length === 0 && (
              <li className="px-4 py-2 text-gray-400">
                No students sent this month.
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="mt-10">
        <h2 className="font-semibold text-lg mb-2">
          Archive (Older than 31 days)
        </h2>
        <ul className="bg-white rounded shadow divide-y">
          {archived.map((s: any) => (
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
              <span className="text-gray-500 text-xs font-medium">
                Archived
              </span>
            </li>
          ))}
          {archived.length === 0 && (
            <li className="px-4 py-2 text-gray-400">No archived students.</li>
          )}
        </ul>
      </div>
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
                    Upload File for {selectedStudent?.student_name} (
                    {selectedStudent?.matric_number})
                  </Dialog.Title>
                  <form onSubmit={handleUpload} className="flex flex-col gap-3">
                    <input
                      type="file"
                      accept="application/pdf"
                      className="border rounded px-2 py-1"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
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

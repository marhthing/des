"use client";

import { useEffect, useState, Fragment } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, Transition } from "@headlessui/react";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    matric_number: "",
    student_name: "",
    date_of_birth: "",
    parent_email_1: "",
    parent_email_2: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("Student")
      .select(
        "id, matric_number, student_name, date_of_birth, parent_email_1, parent_email_2"
      );
    if (error) {
      setError("Failed to load students.");
      setStudents([]);
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  }

  function startEdit(student: any) {
    setEditing(student.id);
    setForm({ ...student });
    setEditModalOpen(true);
  }

  function cancelEdit() {
    setEditing(null);
    setForm({});
    setEditModalOpen(false);
  }

  async function saveEdit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from("Student")
      .update({
        matric_number: form.matric_number,
        student_name: form.student_name,
        date_of_birth: form.date_of_birth,
        parent_email_1: form.parent_email_1,
        parent_email_2: form.parent_email_2,
      })
      .eq("id", editing);
    setSaving(false);
    if (error) {
      setError("Failed to update student.");
    } else {
      setEditing(null);
      setForm({});
      setEditModalOpen(false);
      fetchStudents();
    }
  }

  async function deleteStudent(id: string) {
    setDeleting(id);
    setError(null);
    const { error } = await supabase.from("Student").delete().eq("id", id);
    setDeleting(null);
    if (error) {
      setError("Failed to delete student.");
    } else {
      fetchStudents();
    }
  }

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    const { error } = await supabase.from("Student").insert([
      {
        matric_number: addForm.matric_number,
        student_name: addForm.student_name,
        date_of_birth: addForm.date_of_birth,
        parent_email_1: addForm.parent_email_1,
        parent_email_2: addForm.parent_email_2,
      },
    ]);
    setAdding(false);
    if (error) {
      setError("Failed to add student.");
    } else {
      setAddForm({
        matric_number: "",
        student_name: "",
        date_of_birth: "",
        parent_email_1: "",
        parent_email_2: "",
      });
      setModalOpen(false);
      fetchStudents();
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Students</h1>
      <button
        className="mb-6 px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium"
        onClick={() => setModalOpen(true)}
      >
        Add Student
      </button>
      <Transition.Root show={modalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setModalOpen}>
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
                    Add Student
                  </Dialog.Title>
                  <form onSubmit={addStudent} className="flex flex-col gap-3">
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Matric Number"
                      title="Matric Number"
                      value={addForm.matric_number}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          matric_number: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Name"
                      title="Name"
                      value={addForm.student_name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, student_name: e.target.value })
                      }
                      required
                    />
                    <input
                      type="date"
                      className="border rounded px-2 py-1"
                      placeholder="Date of Birth"
                      title="Date of Birth"
                      value={addForm.date_of_birth}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          date_of_birth: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Parent Email 1"
                      title="Parent Email 1"
                      value={addForm.parent_email_1}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          parent_email_1: e.target.value,
                        })
                      }
                    />
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Parent Email 2"
                      title="Parent Email 2"
                      value={addForm.parent_email_2}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          parent_email_2: e.target.value,
                        })
                      }
                    />
                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
                        disabled={adding}
                      >
                        {adding ? "Adding..." : "Add Student"}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 text-sm font-medium"
                        onClick={() => setModalOpen(false)}
                        disabled={adding}
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
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Matric Number</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Date of Birth</th>
                <th className="px-4 py-2 text-left">Parent Email 1</th>
                <th className="px-4 py-2 text-left">Parent Email 2</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b last:border-0 hover:bg-blue-50"
                >
                  <td className="px-2 py-1 font-mono">
                    {student.matric_number}
                  </td>
                  <td className="px-2 py-1">{student.student_name}</td>
                  <td className="px-2 py-1">{student.date_of_birth}</td>
                  <td className="px-2 py-1">{student.parent_email_1}</td>
                  <td className="px-2 py-1">{student.parent_email_2}</td>
                  <td className="px-2 py-1 flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium"
                      onClick={() => startEdit(student)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-red-600 text-white text-xs font-medium disabled:opacity-50"
                      onClick={() => deleteStudent(student.id)}
                      disabled={deleting === student.id}
                    >
                      {deleting === student.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Transition.Root show={editModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={cancelEdit}>
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
                    Edit Student
                  </Dialog.Title>
                  <form onSubmit={saveEdit} className="flex flex-col gap-3">
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Matric Number"
                      title="Matric Number"
                      value={form.matric_number || ""}
                      onChange={(e) =>
                        setForm({ ...form, matric_number: e.target.value })
                      }
                      required
                    />
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Name"
                      title="Name"
                      value={form.student_name || ""}
                      onChange={(e) =>
                        setForm({ ...form, student_name: e.target.value })
                      }
                      required
                    />
                    <input
                      type="date"
                      className="border rounded px-2 py-1"
                      placeholder="Date of Birth"
                      title="Date of Birth"
                      value={form.date_of_birth || ""}
                      onChange={(e) =>
                        setForm({ ...form, date_of_birth: e.target.value })
                      }
                      required
                    />
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Parent Email 1"
                      title="Parent Email 1"
                      value={form.parent_email_1 || ""}
                      onChange={(e) =>
                        setForm({ ...form, parent_email_1: e.target.value })
                      }
                    />
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Parent Email 2"
                      title="Parent Email 2"
                      value={form.parent_email_2 || ""}
                      onChange={(e) =>
                        setForm({ ...form, parent_email_2: e.target.value })
                      }
                    />
                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 text-sm font-medium"
                        onClick={cancelEdit}
                        disabled={saving}
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

"use client";

import { useState, useEffect } from "react";
import { format, isToday, isAfter, isBefore } from "date-fns";
import { supabase } from "@/lib/supabaseClient";

const filterOptions = [
  { label: "Today's Birthdays", value: "today" },
  { label: "Upcoming Birthdays", value: "upcoming" },
  { label: "Past Birthdays", value: "past" },
  { label: "All", value: "all" },
];

export default function BirthdaysPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [filter, setFilter] = useState("today");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("Student")
        .select("id, student_name, matric_number, date_of_birth");
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

  function filterStudents(students: any[]) {
    const today = new Date();
    return students
      .filter((student) => {
        const dob = new Date(student.date_of_birth);
        const dobThisYear = new Date(
          today.getFullYear(),
          dob.getMonth(),
          dob.getDate()
        );
        if (filter === "today") return isToday(dobThisYear);
        if (filter === "upcoming") return isAfter(dobThisYear, today);
        if (filter === "past")
          return isBefore(dobThisYear, today) && !isToday(dobThisYear);
        return true;
      })
      .filter((student) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
          student.student_name.toLowerCase().includes(s) ||
          student.matric_number.toLowerCase().includes(s)
        );
      });
  }

  const filtered = filterStudents(students);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Student Birthdays</h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
                filter === opt.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name or matric number..."
          className="border rounded px-3 py-1 text-sm w-full md:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          No students found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Matric Number</th>
                <th className="px-4 py-2 text-left">Birthday</th>
                <th className="px-4 py-2 text-left">Turns</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const dob = new Date(student.date_of_birth);
                const dobThisYear = new Date(
                  new Date().getFullYear(),
                  dob.getMonth(),
                  dob.getDate()
                );
                const age = new Date().getFullYear() - dob.getFullYear();
                return (
                  <tr
                    key={student.id}
                    className="border-b last:border-0 hover:bg-blue-50"
                  >
                    <td className="px-4 py-2 font-medium">
                      {student.student_name}
                    </td>
                    <td className="px-4 py-2">{student.matric_number}</td>
                    <td className="px-4 py-2">{format(dob, "MMMM d")}</td>
                    <td className="px-4 py-2">{age}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

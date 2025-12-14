import React, { useState } from "react";
import { Search, Edit2, Check, X } from "lucide-react";

export default function AttendanceCorrection() {
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState(null);

    // Mock data
    const [records, setRecords] = useState([
        { id: 1, student: "John Doe", time: "10:00 AM", status: "Present" },
        { id: 2, student: "Jane Smith", time: "10:05 AM", status: "Late" },
        { id: 3, student: "Bob Wilson", time: "-", status: "Absent" },
    ]);

    const handleUpdate = (id, newStatus) => {
        setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
        setEditingId(null);
        // Call API here
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Manage Attendance
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Correct or update student attendance records.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search student name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <select className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none">
                        <option>All Status</option>
                        <option>Present</option>
                        <option>Absent</option>
                        <option>Late</option>
                    </select>
                </div>

                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b border-slate-200 dark:border-slate-800">
                            <th className="pb-4 font-semibold text-slate-500 dark:text-slate-400">Student</th>
                            <th className="pb-4 font-semibold text-slate-500 dark:text-slate-400">Time</th>
                            <th className="pb-4 font-semibold text-slate-500 dark:text-slate-400">Status</th>
                            <th className="pb-4 font-semibold text-slate-500 dark:text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {records.map((record) => (
                            <tr key={record.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="py-4 font-medium text-slate-900 dark:text-white">{record.student}</td>
                                <td className="py-4 text-slate-500 dark:text-slate-400">{record.time}</td>
                                <td className="py-4">
                                    {editingId === record.id ? (
                                        <select
                                            defaultValue={record.status}
                                            onChange={(e) => handleUpdate(record.id, e.target.value)}
                                            className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                                        >
                                            <option>Present</option>
                                            <option>Absent</option>
                                            <option>Late</option>
                                        </select>
                                    ) : (
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                record.status === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                            {record.status}
                                        </span>
                                    )}
                                </td>
                                <td className="py-4">
                                    {editingId === record.id ? (
                                        <button onClick={() => setEditingId(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                            <X size={18} />
                                        </button>
                                    ) : (
                                        <button onClick={() => setEditingId(record.id)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

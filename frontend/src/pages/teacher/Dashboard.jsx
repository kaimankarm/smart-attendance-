import React, { useEffect, useState } from "react";
import { Users, UserCheck, Clock, AlertTriangle, Play, Square } from "lucide-react";
import { API_BASE_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";

export default function TeacherDashboard() {
    const [stats, setStats] = useState({ total_students: 0, total_attendance: 0, active_class: null });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchStats = () => {
        fetch(`${API_BASE_URL}/teacher/dashboard`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const toggleClass = async () => {
        setLoading(true);
        const action = stats.active_class ? 'end' : 'start';
        const subject = "Computer Science"; // Hardcoded for demo, can be a dropdown

        try {
            const res = await fetch(`${API_BASE_URL}/teacher/class/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teacher_id: user.id,
                    action,
                    subject
                }),
            });
            if (res.ok) {
                fetchStats();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Teacher Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Overview of today's classes and attendance.
                    </p>
                </div>

                <button
                    onClick={toggleClass}
                    disabled={loading}
                    className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 ${stats.active_class
                            ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                            : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30"
                        }`}
                >
                    {stats.active_class ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                    {stats.active_class ? "End Class" : "Start Class"}
                </button>
            </div>

            {/* Active Class Indicator */}
            {stats.active_class && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl flex items-center gap-3 animate-pulse">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        Class in Progress: {stats.active_class}
                    </span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Students</p>
                            <p className="text-2xl font-bold">{stats.total_students}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Present Today</p>
                            <p className="text-2xl font-bold">{stats.total_attendance}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Late Arrivals</p>
                            <p className="text-2xl font-bold">0</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

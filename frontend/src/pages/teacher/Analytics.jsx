import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";
import { BarChart, Users, CheckCircle } from "lucide-react";

export default function Analytics() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/teacher/dashboard`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    }, []);

    if (!stats) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Analytics
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Performance and attendance overview.
                </p>
            </div>

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
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Attendance</p>
                            <p className="text-2xl font-bold">{stats.total_attendance}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Placeholder for chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-64 flex items-center justify-center text-slate-400">
                <div className="text-center">
                    <BarChart size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Attendance Trends Chart (Coming Soon)</p>
                </div>
            </div>
        </div>
    );
}

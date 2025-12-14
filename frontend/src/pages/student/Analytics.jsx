import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

const data = [
    { name: "Math", attendance: 85 },
    { name: "Physics", attendance: 65 },
    { name: "Chem", attendance: 90 },
    { name: "CS", attendance: 95 },
    { name: "Eng", attendance: 70 },
];

const COLORS = ["#6366f1", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

export default function StudentAnalytics() {
    const lowAttendanceSubjects = data.filter(d => d.attendance < 75);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    My Performance
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Detailed attendance and performance analytics.
                </p>
            </div>

            {/* Warnings */}
            {lowAttendanceSubjects.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 rounded-xl">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-red-700 dark:text-red-400">Low Attendance Warning</h3>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                            Your attendance is below 75% in the following subjects:
                            <span className="font-bold"> {lowAttendanceSubjects.map(s => s.name).join(", ")}</span>.
                            Please attend upcoming classes to avoid debarment.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Subject-wise Attendance</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f1f5f9' }}
                                />
                                <Bar dataKey="attendance" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Overall Attendance</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">81%</h3>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center text-indigo-600 font-bold">
                            81%
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Trends</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                        <TrendingUp size={20} />
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Computer Science</span>
                                </div>
                                <span className="text-emerald-600 font-bold">+5%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                        <TrendingDown size={20} />
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Physics</span>
                                </div>
                                <span className="text-red-600 font-bold">-2%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

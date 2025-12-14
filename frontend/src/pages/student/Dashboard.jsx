import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle, Bell } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={color.replace("bg-", "text-")} size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 font-medium">{label}</h3>
    </motion.div>
);

export default function StudentDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Student Dashboard
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Welcome back, here's your overview.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={CheckCircle}
                    label="Attendance Rate"
                    value="85%"
                    color="bg-emerald-500"
                />
                <StatCard
                    icon={Clock}
                    label="Classes Attended"
                    value="24/30"
                    color="bg-blue-500"
                />
                <StatCard
                    icon={XCircle}
                    label="Missed Classes"
                    value="6"
                    color="bg-red-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Announcements */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Announcements
                        </h2>
                        <Bell className="text-slate-400" size={20} />
                    </div>

                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        Mid-term Exam Schedule
                                    </h3>
                                    <span className="text-xs text-slate-400">2h ago</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    The mid-term exams will start from next Monday. Please check the schedule...
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Classes */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                        Today's Schedule
                    </h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                    10:00
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        Advanced Mathematics
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Prof. Smith • Room 301
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        Active
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

import React from "react";
import { Camera, UserCheck, UserX } from "lucide-react";

export default function Monitor() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Live Monitor
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Real-time verification feed.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Feed Placeholder */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-black rounded-2xl aspect-video relative overflow-hidden flex items-center justify-center">
                        <div className="text-center text-white/50">
                            <Camera size={48} className="mx-auto mb-2 opacity-50" />
                            <p>Waiting for incoming streams...</p>
                        </div>
                        <div className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                            LIVE
                        </div>
                    </div>
                </div>

                {/* Recent Scans */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 h-fit">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                        Recent Scans
                    </h2>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                    {/* Placeholder for face image */}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Student {i}</p>
                                    <p className="text-xs text-slate-500">10:0{i} AM</p>
                                </div>
                                {i % 3 === 0 ? (
                                    <UserX size={20} className="text-red-500" />
                                ) : (
                                    <UserCheck size={20} className="text-emerald-500" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

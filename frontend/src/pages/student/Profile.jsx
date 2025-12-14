import React from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Shield } from "lucide-react";

export default function Profile() {
    const { user } = useAuth();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    My Profile
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Manage your account information.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="px-8 pb-8">
                    <div className="relative -top-12 mb-4">
                        <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-2xl p-1 shadow-lg">
                            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-500">
                                {user.name?.[0]}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {user.name}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400">{user.role}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Student ID</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{user.id}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-500">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Email</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{user.email || "No email linked"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-500">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Account Status</p>
                                    <p className="font-medium text-emerald-600">Active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

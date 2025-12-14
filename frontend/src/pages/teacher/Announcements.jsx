import React, { useState } from "react";
import { Send, Bell } from "lucide-react";
import { API_BASE_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";

export default function Announcements() {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/teacher/announcements`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teacher_id: user.id, message }),
            });
            if (res.ok) {
                setMessage("");
                alert("Announcement sent!");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Announcements
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Send updates to all students.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <form onSubmit={handleSend} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Type your announcement here..."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Send size={20} />
                        {loading ? "Sending..." : "Post Announcement"}
                    </button>
                </form>
            </div>
        </div>
    );
}

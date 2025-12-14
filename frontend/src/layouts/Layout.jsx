import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
    LayoutDashboard,
    Camera,
    FileText,
    User,
    LogOut,
    Moon,
    Sun,
    Menu,
    X,
    GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
    <Link
        to={path}
        onClick={onClick}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
            active
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
        )}
    >
        <Icon size={20} className={cn("transition-transform group-hover:scale-110", active && "scale-110")} />
        <span className="font-medium">{label}</span>
    </Link>
);

export default function Layout() {
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!user) {
        return <Outlet />;
    }

    const studentLinks = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard" },
        { icon: Camera, label: "Mark Attendance", path: "/student/attendance" },
        { icon: FileText, label: "Quizzes", path: "/student/quizzes" },
        { icon: User, label: "Profile", path: "/student/profile" },
    ];

    const teacherLinks = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/teacher/dashboard" },
        { icon: Camera, label: "Live Monitor", path: "/teacher/monitor" },
        { icon: FileText, label: "Manage Quizzes", path: "/teacher/quizzes" },
        { icon: GraduationCap, label: "Analytics", path: "/teacher/analytics" },
    ];

    const links = user.role === "teacher" ? teacherLinks : studentLinks;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-300">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 fixed h-full z-20">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <GraduationCap className="text-white" size={24} />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        SmartCampus
                    </h1>
                </div>

                <nav className="flex-1 space-y-2">
                    {links.map((link) => (
                        <SidebarItem
                            key={link.path}
                            {...link}
                            active={location.pathname === link.path}
                        />
                    ))}
                </nav>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                        <span className="font-medium">
                            {theme === "dark" ? "Light Mode" : "Dark Mode"}
                        </span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="text-white" size={20} />
                    </div>
                    <span className="font-bold text-lg">SmartCampus</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden fixed inset-0 z-20 bg-white dark:bg-slate-900 pt-20 px-6"
                    >
                        <nav className="space-y-2">
                            {links.map((link) => (
                                <SidebarItem
                                    key={link.path}
                                    {...link}
                                    active={location.pathname === link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                />
                            ))}
                            <hr className="my-4 border-slate-200 dark:border-slate-800" />
                            <button
                                onClick={() => {
                                    setTheme(theme === "dark" ? "light" : "dark");
                                    setIsMobileMenuOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 dark:text-slate-400"
                            >
                                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                                <span className="font-medium">Switch Theme</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 p-6 pt-20 md:pt-6 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

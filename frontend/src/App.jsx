import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./layouts/Layout";
import Login from "./pages/Login";

// Placeholder components for now
import StudentDashboard from "./pages/student/Dashboard";
import StudentAttendance from "./pages/student/Attendance";
import TeacherDashboard from "./pages/teacher/Dashboard";
import Monitor from "./pages/teacher/Monitor";
import AttendanceCorrection from "./pages/teacher/AttendanceCorrection";
import Announcements from "./pages/teacher/Announcements";
import Analytics from "./pages/teacher/Analytics";
import Quizzes from "./pages/teacher/Quizzes";
import Profile from "./pages/student/Profile";
import Leave from "./pages/student/Leave";

import StudentQuizzes from "./pages/student/Quizzes";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/login" replace />} />

              {/* Student Routes */}
              <Route path="student">
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="quizzes" element={<StudentQuizzes />} />
                <Route path="profile" element={<Profile />} />
                <Route path="leave" element={<Leave />} />
              </Route>

              {/* Teacher Routes */}
              <Route path="teacher">
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="monitor" element={<Monitor />} />
                <Route path="attendance" element={<AttendanceCorrection />} />
                <Route path="quizzes" element={<Quizzes />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="announcements" element={<Announcements />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
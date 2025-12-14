
import React, { useState, useEffect } from "react";
import { Plus, Save, Trash2, CheckCircle, FileText, Clock } from "lucide-react";
import { API_BASE_URL } from "../../config";

export default function Quizzes() {
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState([
        { text: "", options: ["", "", "", ""], correct: 0 }
    ]);
    const [message, setMessage] = useState("");
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Results Modal State
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [results, setResults] = useState([]);
    const [viewingResults, setViewingResults] = useState(false);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const teacherId = user?.id || "T01";
        try {
            const res = await fetch(`${API_BASE_URL}/quiz/list/${teacherId}`);
            if (res.ok) {
                const data = await res.json();
                setQuizzes(data);
            }
        } catch (err) {
            console.error("Failed to fetch quizzes", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async (quiz) => {
        setSelectedQuiz(quiz);
        setViewingResults(true);
        try {
            const res = await fetch(`${API_BASE_URL}/quiz/results/${quiz.id}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (err) {
            console.error("Failed to fetch results", err);
        }
    };

    const closeResults = () => {
        setViewingResults(false);
        setSelectedQuiz(null);
        setResults([]);
    };

    const deleteQuiz = async (quizId) => {
        if (!window.confirm("Are you sure you want to delete this quiz? This cannot be undone.")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/quiz/delete/${quizId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setMessage("Quiz deleted successfully");
                fetchQuizzes(); // Refresh list
            } else {
                setMessage("Failed to delete quiz");
            }
        } catch (err) {
            setMessage("Error connecting to server");
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, { text: "", options: ["", "", "", ""], correct: 0 }]);
    };

    const removeQuestion = (index) => {
        const newQ = questions.filter((_, i) => i !== index);
        setQuestions(newQ);
    };

    const updateQuestion = (index, field, value) => {
        const newQ = [...questions];
        newQ[index][field] = value;
        setQuestions(newQ);
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQ = [...questions];
        newQ[qIndex].options[oIndex] = value;
        setQuestions(newQ);
    };

    const saveQuiz = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const res = await fetch(`${API_BASE_URL}/quiz/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teacher_id: user?.id || "T01", // Fallback for dev
                    title,
                    questions
                })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("Quiz created successfully!");
                setIsCreating(false);
                setTitle("");
                setQuestions([{ text: "", options: ["", "", "", ""], correct: 0 }]);
                fetchQuizzes(); // Refresh list
            } else {
                setMessage(data.error || "Failed to create quiz");
            }
        } catch (err) {
            console.error("Quiz creation error:", err);
            setMessage(`Error: ${err.message}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Manage Quizzes
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Create and launch quizzes for your active class.
                    </p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Create New Quiz
                    </button>
                )}
            </div>

            {message && (
                <div className="p-4 bg-blue-100 text-blue-700 rounded-xl flex items-center gap-2">
                    <CheckCircle size={20} />
                    {message}
                </div>
            )}

            {/* Results Modal */}
            {viewingResults && selectedQuiz && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quiz Results</h2>
                                <p className="text-sm text-slate-500">{selectedQuiz.title}</p>
                            </div>
                            <button onClick={closeResults} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {results.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400">Student Name</th>
                                            <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400 text-center">Score</th>
                                            <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400 text-right">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {results.map((r, i) => (
                                            <tr key={i}>
                                                <td className="py-3 font-medium text-slate-900 dark:text-white">{r.student_name}</td>
                                                <td className="py-3 text-center">
                                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-slate-700 dark:text-slate-300">
                                                        {r.score} / {r.total}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right font-bold text-indigo-600">
                                                    {Math.round((r.score / r.total) * 100)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <FileText className="mx-auto mb-3 text-slate-300" size={48} />
                                    <p>No submissions yet for this quiz.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-right">
                            {!selectedQuiz.is_active ? (
                                <span className="text-sm font-medium text-red-500 mr-4">Quiz Ended</span>
                            ) : (
                                <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors mr-2">
                                    Stop Quiz
                                </button>
                            )}
                            <button onClick={closeResults} className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium shadow-sm">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isCreating ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Quiz Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., Week 1 Review"
                        />
                    </div>

                    <div className="space-y-6">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-medium text-slate-900 dark:text-white">Question {qIndex + 1}</h4>
                                    {questions.length > 1 && (
                                        <button onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={q.text}
                                    onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
                                    className="w-full mb-4 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    placeholder="Enter question text..."
                                />

                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                    Options (Select the circle to mark correct answer)
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${q.correct === oIndex ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : "border-transparent"
                                            }`}>
                                            <div className="flex flex-col items-center gap-1">
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIndex}`}
                                                    checked={q.correct === oIndex}
                                                    onChange={() => updateQuestion(qIndex, "correct", oIndex)}
                                                    className="w-5 h-5 text-indigo-600 cursor-pointer"
                                                />
                                                {q.correct === oIndex && (
                                                    <span className="text-[10px] font-bold text-green-600 uppercase">Correct</span>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                className={`flex-1 px-3 py-2 rounded-lg border ${q.correct === oIndex ? 'border-green-400 ring-1 ring-green-400' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-800`}
                                                placeholder={`Option ${oIndex + 1}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                        <button onClick={addQuestion} className="px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium">
                            + Add Question
                        </button>
                        <div className="flex-1"></div>
                        <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600 hover:text-slate-900">
                            Cancel
                        </button>
                        <button onClick={saveQuiz} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                            <Save size={18} />
                            Save & Launch
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading quizzes...</div>
                    ) : quizzes.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {quizzes.map((quiz) => (
                                <div key={quiz.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group hover:border-indigo-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{quiz.title}</h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                                <span>{quiz.questions_count} Questions</span>
                                                <span>•</span>
                                                <Clock size={14} />
                                                <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {quiz.is_active && (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse">
                                                ACTIVE
                                            </span>
                                        )}
                                        <button
                                            onClick={() => fetchResults(quiz)}
                                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            View Results
                                        </button>
                                        <button
                                            onClick={() => deleteQuiz(quiz.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Quiz"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="text-slate-400" size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                No Quizzes Yet
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                Get started by creating a new quiz for your students.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

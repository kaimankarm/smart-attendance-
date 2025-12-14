import React, { useState, useEffect } from "react";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../../config";

export default function StudentQuizzes() {
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [answers, setAnswers] = useState({}); // { 0: 1, 1: 3 } (questionIndex: optionIndex)
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchActiveQuiz();
    }, []);

    const fetchActiveQuiz = async () => {
        try {
            console.log("Fetching active quiz from:", `${API_BASE_URL}/quiz/active`);
            const res = await fetch(`${API_BASE_URL}/quiz/active`);
            if (res.ok) {
                const data = await res.json();
                console.log("Quiz Data:", data);

                // Robust parsing for SQLite JSON weirdness
                let questions = data.questions;
                if (typeof questions === 'string') {
                    try {
                        questions = JSON.parse(questions);
                    } catch (e) {
                        console.error("Failed to parse questions string", e);
                    }
                }

                // Ensure it is an array
                if (!Array.isArray(questions)) {
                    throw new Error("Invalid questions format received");
                }

                data.questions = questions;
                setActiveQuiz(data);

                // Initialize answers array
                const initialAnswers = {};
                questions.forEach((_, i) => initialAnswers[i] = null);
                setAnswers(initialAnswers);
            } else {
                console.warn("No active quiz found (404 or other)");
                setActiveQuiz(null);
            }
        } catch (err) {
            console.error("Quiz fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (qIndex, oIndex) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
    };

    const handleSubmit = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            // Convert answers object to list ordered by index
            const answerList = activeQuiz.questions.map((_, i) => answers[i]);

            const res = await fetch(`${API_BASE_URL}/quiz/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quiz_id: activeQuiz.id,
                    student_id: user?.id || "S01",
                    answers: answerList
                })
            });

            const data = await res.json();
            if (res.ok) {
                setScore(data.score);
                setTotal(data.total);
                setSubmitted(true);
            } else {
                setError(data.error || "Submission failed");
            }
        } catch (err) {
            console.error("Quiz submission error:", err);
            setError(`Network Error: ${err.message}`);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading quizzes...</div>;

    if (!activeQuiz) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Quizzes</h1>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                    <h3 className="text-xl font-medium text-slate-900 dark:text-white">All Caught Up!</h3>
                    <p className="text-slate-500 mt-2">No active quizzes at the moment.</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quiz Completed!</h2>

                    <div className="text-6xl font-black text-indigo-600 mb-2">{score} / {total}</div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-8">Your Score</p>

                    <div className="text-left space-y-6">
                        {activeQuiz.questions.map((q, i) => {
                            const userAnswer = answers[i];
                            const isCorrect = userAnswer === q.correct;

                            return (
                                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                                        <span className="text-slate-400 mr-2">{i + 1}.</span>
                                        {q.text}
                                    </h4>
                                    <div className="space-y-2">
                                        {q.options.map((opt, oIndex) => {
                                            let optionClass = "w-full text-left px-4 py-3 rounded-lg border flex items-center gap-3 transition-colors ";

                                            // Review Logic
                                            if (oIndex === q.correct) {
                                                optionClass += "bg-green-100 border-green-300 text-green-800 font-medium";
                                            } else if (oIndex === userAnswer && !isCorrect) {
                                                optionClass += "bg-red-100 border-red-300 text-red-800";
                                            } else {
                                                optionClass += "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 opacity-70";
                                            }

                                            return (
                                                <div key={oIndex} className={optionClass}>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${oIndex === q.correct ? "border-green-600 bg-green-600 text-white" :
                                                        (oIndex === userAnswer ? "border-red-500 bg-red-500 text-white" : "border-slate-400")
                                                        }`}>
                                                        {(oIndex === q.correct || oIndex === userAnswer) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                    </div>
                                                    {opt}
                                                    {oIndex === q.correct && <span className="ml-auto text-xs font-bold uppercase text-green-700">Correct Answer</span>}
                                                    {oIndex === userAnswer && !isCorrect && <span className="ml-auto text-xs font-bold uppercase text-red-700">Your Answer</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <button onClick={() => window.location.reload()} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{activeQuiz.title}</h1>
                    <p className="text-slate-500">{activeQuiz.questions.length} Questions</p>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-1">
                    <Clock size={14} /> LIVE
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {activeQuiz.questions.map((q, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                        <div className="flex gap-4">
                            <span className="font-mono text-slate-400 text-lg">0{i + 1}</span>
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                                    {q.text}
                                </h3>
                                <div className="space-y-3">
                                    {q.options.map((opt, optIndex) => (
                                        <button
                                            key={optIndex}
                                            onClick={() => handleSelect(i, optIndex)}
                                            className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-slate-800 dark:text-slate-200 ${answers[i] === optIndex
                                                ? "border-indigo-500 bg-indigo-50 text-indigo-900 font-medium ring-1 ring-indigo-500"
                                                : "border-slate-200 hover:border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[i] === optIndex ? "border-indigo-600" : "border-slate-400"
                                                    }`}>
                                                    {answers[i] === optIndex && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                                                </div>
                                                {opt}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-transform active:scale-[0.99]"
            >
                Submit Quiz
            </button>
        </div>
    );
}

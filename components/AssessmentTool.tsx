"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, BookOpen, AlertCircle, CheckCircle2, User, ChevronRight, RefreshCw } from "lucide-react";
import { BentoCard } from "@/components/ui/cards";
import { saveAssessmentScoreAction } from "@/app/actions";

interface Question {
  id: string;
  category: string;
  subCategory: string;
  content: string;
  options: string[]; // parsed from JSON
  correctAnswer: string;
  difficulty: string | null;
}

interface AssessmentToolProps {
  initialQuestions: Question[];
}

export default function AssessmentTool({ initialQuestions }: AssessmentToolProps) {
  const [category, setCategory] = useState<'Aptitude' | 'Domain'>('Aptitude');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Link to student states
  const [regNumber, setRegNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string; profileId?: string } | null>(null);

  // Filter questions based on selected category
  useEffect(() => {
    const filtered = initialQuestions.filter(q => q.category.toLowerCase() === category.toLowerCase());
    setQuestions(filtered);
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setFinished(false);
    setSaveResult(null);
  }, [category, initialQuestions]);

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    if (option === questions[currentIndex].correctAnswer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
      } else {
        setFinished(true);
      }
    }, 1200);
  };

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim()) return;

    setSaving(true);
    setSaveResult(null);
    try {
      const res = await saveAssessmentScoreAction(regNumber, score, category);
      if (res.success) {
        setSaveResult({
          success: true,
          message: `Successfully linked score of ${score} to ${res.studentName}'s placement profile!`,
          profileId: res.studentId
        });
      } else {
        setSaveResult({
          success: false,
          message: res.error || "Student registration number not found."
        });
      }
    } catch {
      setSaveResult({
        success: false,
        message: "Failed to connect to placement server. Please try again."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      
      {/* Quiz Category Selection header */}
      <div className="panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-850">
        <div>
          <span className="label">Evaluation Engine</span>
          <h2 className="text-sm font-mono font-bold text-white uppercase mt-0.5">Select Quiz Category</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCategory('Aptitude')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              category === 'Aptitude'
                ? 'bg-yellow-500 text-black border-yellow-500'
                : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:border-zinc-700 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" /> Aptitude
          </button>
          <button
            onClick={() => setCategory('Domain')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              category === 'Domain'
                ? 'bg-yellow-500 text-black border-yellow-500'
                : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:border-zinc-700 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Domain Skills
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!finished ? (
          <motion.div
            key={`${category}-${currentIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {questions.length > 0 ? (
              <BentoCard className="p-6 border border-zinc-850 bg-zinc-900/10 min-h-[380px] flex flex-col justify-between">
                <div>
                  {/* Category, Difficulty & Progress bar */}
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                    <span className="text-[10px] font-mono font-bold text-yellow-500 uppercase">
                      {category} Test • Subtopic: {questions[currentIndex]?.subCategory.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                  </div>

                  <div className="w-full bg-zinc-950 h-1 mt-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-yellow-500 h-full transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>

                  <h3 className="text-base font-bold text-white leading-relaxed mt-6 mb-6">
                    {questions[currentIndex]?.content}
                  </h3>

                  {/* Option List */}
                  <div className="grid gap-2.5">
                    {questions[currentIndex]?.options.map((option) => {
                      const isSelected = selectedOption === option;
                      const isCorrect = option === questions[currentIndex].correctAnswer;
                      const hasAnswered = selectedOption !== null;

                      let btnStyle = "bg-zinc-950/40 border-zinc-850 text-zinc-300 hover:border-zinc-700 hover:text-white";
                      if (hasAnswered) {
                        if (isSelected) {
                          btnStyle = isCorrect
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold"
                            : "bg-red-500/10 border-red-500 text-red-400 font-bold";
                        } else if (isCorrect) {
                          btnStyle = "bg-emerald-500/10 border-emerald-500/50 text-emerald-400";
                        } else {
                          btnStyle = "bg-zinc-950/20 border-zinc-900 text-zinc-650 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={option}
                          onClick={() => handleAnswer(option)}
                          disabled={hasAnswered}
                          className={`w-full p-3.5 rounded-lg text-left text-xs font-mono border transition-all ${btnStyle}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[10px] text-zinc-600 font-mono mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between">
                  <span>SELECT ANSWER TO TRIGGER TIMER LOCK</span>
                  <span>DIFF: {questions[currentIndex]?.difficulty?.toUpperCase() || "MEDIUM"}</span>
                </div>
              </BentoCard>
            ) : (
              <div className="panel p-12 text-center space-y-3">
                <AlertCircle className="h-8 w-8 text-zinc-600 mx-auto" />
                <h3 className="text-sm font-bold text-zinc-300 uppercase font-mono">No Questions Found</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-5">
                  There are no seeded questions for this section. Admin can add them in the panel database cockpit.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="panel p-8 space-y-6 border border-zinc-800 bg-zinc-900/20"
          >
            <div className="text-center space-y-2 border-b border-zinc-850 pb-6">
              <h2 className="text-xl font-bold text-white uppercase font-mono">Assessment Terminated</h2>
              <p className="text-xs text-zinc-500 font-mono">Evaluation score generated successfully</p>
              <div className="text-5xl font-mono font-bold text-yellow-500 pt-4">
                {score} <span className="text-zinc-600">/</span> {questions.length}
              </div>
            </div>

            {/* Form: Link score to Registry */}
            <form onSubmit={handleSaveScore} className="space-y-4">
              <div className="space-y-1">
                <label className="label block text-zinc-400">Link result to Registry</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      required
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="Enter Student Registration Number"
                      className="field pl-9 text-xs font-mono uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving || !regNumber}
                    className="btn-primary py-2.5 px-4 text-xs font-mono font-bold uppercase whitespace-nowrap"
                  >
                    {saving ? "SAVING..." : "SAVE SCORE"}
                  </button>
                </div>
              </div>

              {saveResult && (
                <div className={`p-3 rounded-lg border text-xs font-mono flex items-start gap-2 ${
                  saveResult.success
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}>
                  {saveResult.success ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p>{saveResult.message}</p>
                    {saveResult.success && saveResult.profileId && (
                      <Link 
                        href={`/profile/${saveResult.profileId}`}
                        className="inline-flex items-center gap-1 text-[10px] text-yellow-500 hover:underline mt-2 font-bold uppercase"
                      >
                        VIEW PROFILE RECORD <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </form>

            {/* Restart quiz button */}
            <div className="pt-4 border-t border-zinc-850 flex justify-end">
              <button
                onClick={() => {
                  setFinished(false);
                  setCurrentIndex(0);
                  setScore(0);
                  setSaveResult(null);
                  setSelectedOption(null);
                }}
                className="btn-secondary flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                RETAKE TEST
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

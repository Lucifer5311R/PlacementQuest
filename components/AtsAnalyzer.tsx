"use client";

import React, { useState } from "react";
import { RadialProgress } from "@/components/ui/cards";
import { CheckCircle2, AlertTriangle, Lightbulb, Play } from "lucide-react";

interface AtsAnalyzerProps {
  fullName: string;
  skills: string;
  description: string;
  projects: string;
  internships: string;
}

const ROLE_KEYWORDS: Record<string, string[]> = {
  "Frontend Engineer": ["react", "javascript", "typescript", "html", "css", "tailwind", "next.js", "nextjs", "redux", "webpack", "git", "rest", "vue", "angular", "responsive"],
  "Backend Engineer": ["java", "spring", "springboot", "sql", "mysql", "postgresql", "node", "nodejs", "express", "apis", "rest", "microservices", "docker", "redis", "mongodb", "git"],
  "Fullstack Engineer": ["react", "node", "nodejs", "javascript", "typescript", "sql", "mongodb", "aws", "docker", "git", "next.js", "nextjs", "apis", "rest", "ci/cd", "ci", "cd"],
  "Data Scientist": ["python", "sql", "r", "pandas", "numpy", "scikit-learn", "machine learning", "ml", "tensorflow", "pytorch", "tableau", "statistics", "data analysis", "hadoop", "spark"]
};

export default function AtsAnalyzer({ fullName, skills, description, projects, internships }: AtsAnalyzerProps) {
  const [selectedRole, setSelectedRole] = useState("Frontend Engineer");
  const [result, setResult] = useState<{
    score: number;
    matchKeywords: string[];
    missingKeywords: string[];
    tips: string[];
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const runAnalysis = () => {
    setAnalyzing(true);
    setResult(null);
    setLogs(["[SYS] CONNECTING TO CANDIDATE REGISTRY FILE..."]);

    const steps = [
      { delay: 350, msg: "[SYS] FETCHING PROFILE TEXT AND PDF METADATA..." },
      { delay: 700, msg: "[SYS] PARSING SOFTWARE PROJECTS & EXPERIENCE KEYWORDS..." },
      { delay: 1050, msg: `[SYS] EVALUATING JOB CAPABILITY ALIGNMENT FOR: ${selectedRole.toUpperCase()}...` },
      { delay: 1400, msg: "[SYS] PARSING APTITUDE & DOMAIN SCORE INTEGRITY..." },
      { delay: 1750, msg: "[SYS] VERIFYING GITHUB & LINKEDIN METRICS..." },
      { delay: 2100, msg: "[SYS] MATCHING SKILLS CLOUD AGAINST TARGET ANCHORS..." },
      { delay: 2450, msg: "[SYS] SCATTER PLOT ANALYSIS COMPLETED. COMPILING PROFILE SCORE..." },
      { delay: 2700, msg: "[SYS] ANALYSIS COMPLETED SUCCESSFULLY. REPORT READY." }
    ];

    steps.forEach(step => {
      setTimeout(() => {
        setLogs(prev => [...prev, step.msg]);
      }, step.delay);
    });

    setTimeout(() => {
      const targetKeywords = ROLE_KEYWORDS[selectedRole];
      const studentText = `${skills} ${description} ${projects} ${internships}`.toLowerCase();
      
      const matchKeywords: string[] = [];
      const missingKeywords: string[] = [];
      
      targetKeywords.forEach(kw => {
        if (studentText.includes(kw)) {
          matchKeywords.push(kw);
        } else {
          missingKeywords.push(kw);
        }
      });

      // Calculate score based on keyword match and profile content
      let baseScore = Math.round((matchKeywords.length / targetKeywords.length) * 60);
      
      const tips: string[] = [];
      
      if (description && description.length > 50) {
        baseScore += 10;
      } else {
        tips.push("Your professional summary is too short. Expand it to at least 150 characters explaining your career focus.");
      }

      if (projects && projects.length > 50) {
        baseScore += 15;
        if (!projects.toLowerCase().includes("built") && !projects.toLowerCase().includes("developed")) {
          tips.push("Action words check: Add strong action verbs like 'Engineered', 'Developed', or 'Implemented' to project descriptions.");
        }
      } else {
        tips.push("Project details are missing or too sparse. Add at least two solid technical projects with their stack mentioned.");
      }

      if (internships && internships.length > 30) {
        baseScore += 15;
      } else {
        tips.push("No internship records detected. If you don't have corporate experience, add academic/open-source contributions to simulate internships.");
      }

      // Add a tip for missing key skills
      if (missingKeywords.length > 0) {
        tips.push(`Targeted role missing keywords: Add [${missingKeywords.slice(0, 3).join(", ").toUpperCase()}] to improve resume filters for ${selectedRole}.`);
      }

      // Final score cap
      const finalScore = Math.min(Math.max(baseScore, 10), 100);

      setResult({
        score: finalScore,
        matchKeywords,
        missingKeywords,
        tips: tips.length > 0 ? tips : ["Excellent resume alignment! Your profile follows industry ATS formatting guidelines."]
      });
      setAnalyzing(false);
    }, 2950);
  };

  return (
    <div className="panel p-5 space-y-4 border border-zinc-800 bg-zinc-900/35">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
          ATS Score Analyzer & feedback
        </h3>
        <span className="text-[10px] font-mono bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 rounded">
          ATS V2.1
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setResult(null);
            }}
            className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-yellow-500"
          >
            {Object.keys(ROLE_KEYWORDS).map(role => (
              <option key={role} value={role}>{role.toUpperCase()}</option>
            ))}
          </select>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="btn-primary flex items-center justify-center gap-1.5 py-2 px-4 whitespace-nowrap"
          >
            <Play className="h-3.5 w-3.5 fill-black" />
            {analyzing ? "ANALYZING..." : "RUN COACH"}
          </button>
        </div>

        {result ? (
          <div className="space-y-4 pt-2 border-t border-zinc-850">
            {/* Score & Category match */}
            <div className="flex items-center gap-4 p-3 bg-zinc-950/60 rounded-xl border border-zinc-850">
              <RadialProgress value={result.score} size={54} strokeWidth={4} />
              <div>
                <p className="text-xs font-bold text-white uppercase font-mono">{selectedRole}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Resume matches {result.matchKeywords.length} of {ROLE_KEYWORDS[selectedRole].length} target signals.
                </p>
              </div>
            </div>

            {/* Keyword breakdown */}
            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
              <div className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1.5">
                <span className="text-emerald-400 font-bold block flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> MATCHED ({result.matchKeywords.length})
                </span>
                <div className="flex flex-wrap gap-1 max-h-[70px] overflow-y-auto pr-1">
                  {result.matchKeywords.length > 0 ? (
                    result.matchKeywords.map(k => (
                      <span key={`matched-${k}`} className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 rounded">
                        {k}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-600 text-[8px]">None</span>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1.5">
                <span className="text-yellow-500 font-bold block flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> MISSING ({result.missingKeywords.length})
                </span>
                <div className="flex flex-wrap gap-1 max-h-[70px] overflow-y-auto pr-1">
                  {result.missingKeywords.length > 0 ? (
                    result.missingKeywords.map(k => (
                      <span key={`missing-${k}`} className="text-[8px] bg-yellow-500/10 text-yellow-500 px-1 rounded">
                        {k}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-600 text-[8px]">None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-2">
              <span className="text-[10px] font-mono font-bold text-white uppercase flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5 text-yellow-500" /> Improvement Action Items
              </span>
              <ul className="space-y-1.5 text-[10px] text-zinc-400 leading-normal pl-4 list-disc font-mono">
                {result.tips.map((tip, index) => (
                  <li key={`tip-${index}`}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : analyzing ? (
          <div className="p-4 rounded-lg bg-black border border-zinc-800 font-mono text-[9px] text-zinc-400 space-y-1.5 h-44 overflow-y-auto">
            {logs.map((log, i) => (
              <p key={`ats-log-${i}`} className="leading-relaxed">{log}</p>
            ))}
            <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full animate-ping inline-block ml-1" />
          </div>
        ) : (
          <div className="text-center py-6 text-zinc-600 font-mono text-[10px]">
            Select target employment role and click "Run Coach" to evaluate ATS parser capability.
          </div>
        )}
      </div>
    </div>
  );
}

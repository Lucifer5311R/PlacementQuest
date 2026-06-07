"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Search, Users, GitBranch, ExternalLink, FileText, 
  Trash2, Copy, Check, ChevronRight, Filter, AlertCircle, 
  X, Briefcase, Award, CheckSquare, Square, Eye, Sparkles
} from "lucide-react";
import { BentoCard, Badge, RadialProgress } from "@/components/ui/cards";

interface Student {
  id: string;
  fullName: string;
  regNumber: string;
  email: string;
  phone: string;
  linkedinUrl: string | null;
  githubUrl: string | null;
  description: string | null;
  internships: string | null;
  projects: string | null;
  skills: string | null;
  resumeUrl: string | null;
  aptitudeScore: number | null;
  domainScore: number | null;
  placementStatus?: string;
}

interface DashboardWorkspaceProps {
  initialStudents: Student[];
}

export default function DashboardWorkspace({ initialStudents }: DashboardWorkspaceProps) {
  const [students] = useState<Student[]>(initialStudents);
  const [q, setQ] = useState("");
  const [activeSkill, setActiveSkill] = useState("");
  const [filterShortlisted, setFilterShortlisted] = useState(false);
  const [filterResume, setFilterResume] = useState(false);
  const [filterGithub, setFilterGithub] = useState(false);
  const [filterLinkedin, setFilterLinkedin] = useState(false);
  const [filterTested, setFilterTested] = useState(false);
  const [filterPlacementStatus, setFilterPlacementStatus] = useState<string>("ALL");

  const [jdText, setJdText] = useState("");
  const [isJdMatcherOpen, setIsJdMatcherOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "jdScore" | "aptitude" | "domain">("name");
  const [isShareCopied, setIsShareCopied] = useState(false);
  
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Responsive UI States
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
  const [isShortlistMobileOpen, setIsShortlistMobileOpen] = useState(false);
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null);

  // Load shortlist from localStorage
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("shortlist") || "[]");
    setShortlist(list);

    const handleShortlistUpdate = () => {
      const updatedList = JSON.parse(localStorage.getItem("shortlist") || "[]");
      setShortlist(updatedList);
    };

    window.addEventListener("shortlist-update", handleShortlistUpdate);
    return () => {
      window.removeEventListener("shortlist-update", handleShortlistUpdate);
    };
  }, []);

  // Detailed profile quality evaluator
  const evaluateProfile = (s: Student) => {
    const checks = [
      { name: "Contact verified", met: !!(s.fullName && s.email && s.phone), weight: 20 },
      { name: "Bio summary (>80 chars)", met: !!(s.description && s.description.trim().length > 80), weight: 20 },
      { name: "Skills listed", met: !!(s.skills && s.skills.trim().length > 0), weight: 15 },
      { name: "Verified projects", met: !!(s.projects && s.projects.trim().length > 15), weight: 15 },
      { name: "Internship record", met: !!(s.internships && s.internships.trim().length > 15), weight: 15 },
      { name: "GitHub linked", met: !!s.githubUrl, weight: 5 },
      { name: "LinkedIn linked", met: !!s.linkedinUrl, weight: 5 },
      { name: "Verified CV", met: !!s.resumeUrl, weight: 5 }
    ];
    
    const percentage = checks.reduce((acc, curr) => acc + (curr.met ? curr.weight : 0), 0);
    return { percentage, checks };
  };

  // Extract username handles for display
  const getGithubHandle = (url?: string | null) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split("/").filter(Boolean);
      return parts[0] ? `@${parts[0]}` : null;
    } catch {
      return url.replace("https://github.com/", "").replace(/\/$/, "");
    }
  };

  const getLinkedinHandle = (url?: string | null) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split("/").filter(Boolean);
      const handle = parts[parts.length - 1] || parts[parts.length - 2];
      return handle ? `in/${handle}` : null;
    } catch {
      return "LinkedIn";
    }
  };

  // Helper: parse skills of student
  const skillsOf = (skills: string | null) => {
    return (skills || "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  // Extract all unique skills (top 15 sorted by occurrence)
  const allSkills = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      skillsOf(s.skills).forEach((skill) => {
        counts[skill] = (counts[skill] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([skill]) => skill)
      .slice(0, 14);
  }, [students]);

  // JD Keyword extraction
  const matchedJdSkills = useMemo(() => {
    if (!jdText.trim()) return [];
    const lowerJd = jdText.toLowerCase();
    
    // Collect all unique candidate skills lowercase
    const skillSet = new Set<string>();
    students.forEach((s) => {
      skillsOf(s.skills).forEach((sk) => {
        const cleanSk = sk.trim().toLowerCase();
        if (cleanSk) skillSet.add(cleanSk);
      });
    });

    return Array.from(skillSet).filter((sk) => {
      // Direct string inclusion search within JD
      return lowerJd.includes(sk);
    });
  }, [jdText, students]);

  // Map students to append their JD matching scores
  const studentsWithJdScores = useMemo(() => {
    return students.map((s) => {
      const studentSkills = skillsOf(s.skills).map((sk) => sk.toLowerCase().trim());
      let score = 0;
      let matchedSkillsForStudent: string[] = [];

      if (matchedJdSkills.length > 0) {
        matchedSkillsForStudent = studentSkills.filter((sk) => matchedJdSkills.includes(sk));
        score = Math.round((matchedSkillsForStudent.length / matchedJdSkills.length) * 100);
      }

      return {
        ...s,
        jdScore: score,
        matchedSkillsForStudent,
      };
    });
  }, [students, matchedJdSkills]);

  // Automatically switch sorting to jdScore when JD text changes
  useEffect(() => {
    if (jdText.trim()) {
      setSortBy("jdScore");
    } else {
      setSortBy("name");
    }
  }, [jdText]);

  // Process, filter, and sort students
  const processedStudents = useMemo(() => {
    const filtered = studentsWithJdScores.filter((s) => {
      const skills = skillsOf(s.skills);
      const text = [
        s.fullName,
        s.regNumber,
        s.email,
        s.description,
        s.projects,
        s.internships,
        skills.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !q || text.includes(q.toLowerCase());
      const matchesSkill = !activeSkill || skills.map(sk => sk.toLowerCase()).includes(activeSkill.toLowerCase());
      const matchesShortlist = !filterShortlisted || shortlist.includes(s.id);
      const matchesResume = !filterResume || !!s.resumeUrl;
      const matchesGithub = !filterGithub || !!s.githubUrl;
      const matchesLinkedin = !filterLinkedin || !!s.linkedinUrl;
      const matchesTested = !filterTested || s.aptitudeScore !== null || s.domainScore !== null;
      const matchesStatus = filterPlacementStatus === "ALL" || (s.placementStatus || "Available") === filterPlacementStatus;

      return (
        matchesQuery &&
        matchesSkill &&
        matchesShortlist &&
        matchesResume &&
        matchesGithub &&
        matchesLinkedin &&
        matchesTested &&
        matchesStatus
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === "jdScore") {
        return b.jdScore - a.jdScore || a.fullName.localeCompare(b.fullName);
      }
      if (sortBy === "aptitude") {
        return (b.aptitudeScore || 0) - (a.aptitudeScore || 0) || a.fullName.localeCompare(b.fullName);
      }
      if (sortBy === "domain") {
        return (b.domainScore || 0) - (a.domainScore || 0) || a.fullName.localeCompare(b.fullName);
      }
      return a.fullName.localeCompare(b.fullName);
    });
  }, [studentsWithJdScores, q, activeSkill, filterShortlisted, shortlist, filterResume, filterGithub, filterLinkedin, filterTested, filterPlacementStatus, sortBy]);

  // Shortlisted Student entities with JD scores mapped
  const shortlistedStudents = studentsWithJdScores.filter((s) => shortlist.includes(s.id));

  // Copy shareable shortlist link
  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/shared/shortlist?ids=${shortlist.join(",")}`;
      navigator.clipboard.writeText(url);
      setIsShareCopied(true);
      setTimeout(() => setIsShareCopied(false), 2000);
    }
  };

  // Copy emails to clipboard
  const copyShortlistEmails = () => {
    const emails = shortlistedStudents.map((s) => s.email).join(", ");
    if (emails) {
      navigator.clipboard.writeText(emails);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Clear shortlist
  const clearShortlist = () => {
    localStorage.setItem("shortlist", JSON.stringify([]));
    window.dispatchEvent(new Event("shortlist-update"));
  };

  // Toggle single shortlist item
  const toggleShortlist = (id: string) => {
    let newList;
    if (shortlist.includes(id)) {
      newList = shortlist.filter((sId) => sId !== id);
    } else {
      newList = [...shortlist, id];
    }
    localStorage.setItem("shortlist", JSON.stringify(newList));
    window.dispatchEvent(new Event("shortlist-update"));
  };

  // Stats
  const totalRecords = students.length;
  const githubLinkedCount = students.filter((s) => s.githubUrl).length;
  const linkedinLinkedCount = students.filter((s) => s.linkedinUrl).length;
  const resumeReadyCount = students.filter((s) => s.resumeUrl).length;

  return (
    <div className="relative grid gap-6 lg:grid-cols-[240px_1fr_280px] items-start">
      
      {/* ========================================================================= */}
      {/* MOBILE CONTROL BUTTONS (Sticky Top) */}
      {/* ========================================================================= */}
      <div className="lg:hidden col-span-full flex gap-2 w-full sticky top-16 z-30 bg-black/95 py-2.5 border-b border-zinc-900 backdrop-blur">
        <button
          onClick={() => setIsFilterMobileOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-zinc-300 rounded-lg hover:border-zinc-700"
        >
          <Filter className="h-3.5 w-3.5 text-yellow-500" />
          FILTERS
          {(filterShortlisted || filterResume || filterGithub || filterLinkedin || filterTested || activeSkill) && (
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
          )}
        </button>
        <button
          onClick={() => setIsShortlistMobileOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-zinc-300 rounded-lg hover:border-zinc-700"
        >
          <Users className="h-3.5 w-3.5 text-yellow-500" />
          SHORTLIST ({shortlist.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. FILTERS SIDEBAR (Responsive) */}
      {/* ========================================================================= */}
      {/* Desktop sidebar */}
      <aside className="hidden lg:block space-y-6">
        <div className="panel p-4 space-y-5 bg-zinc-900/10 border-zinc-850">
          <div>
            <span className="label block mb-1">Recruiter Search</span>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-550" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search candidates..."
                className="field pl-9"
              />
            </div>
          </div>

          <div className="border-t border-zinc-850 pt-4">
            <span className="label block mb-2.5">Verification Filters</span>
            <div className="space-y-3 font-mono text-xs">
              <label className="flex items-center gap-2.5 text-zinc-400 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterShortlisted}
                  onChange={(e) => setFilterShortlisted(e.target.checked)}
                  className="rounded border-zinc-800 bg-black text-yellow-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Pinned Shortlist ({shortlist.length})</span>
              </label>

              <label className="flex items-center gap-2.5 text-zinc-400 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterResume}
                  onChange={(e) => setFilterResume(e.target.checked)}
                  className="rounded border-zinc-800 bg-black text-yellow-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Verified CV Ready</span>
              </label>

              <label className="flex items-center gap-2.5 text-zinc-400 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterGithub}
                  onChange={(e) => setFilterGithub(e.target.checked)}
                  className="rounded border-zinc-800 bg-black text-yellow-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span>GitHub Connected</span>
              </label>

              <label className="flex items-center gap-2.5 text-zinc-400 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterLinkedin}
                  onChange={(e) => setFilterLinkedin(e.target.checked)}
                  className="rounded border-zinc-800 bg-black text-yellow-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span>LinkedIn Connected</span>
              </label>

              <label className="flex items-center gap-2.5 text-zinc-400 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterTested}
                  onChange={(e) => setFilterTested(e.target.checked)}
                  className="rounded border-zinc-800 bg-black text-yellow-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Completed Tests</span>
              </label>
            </div>
          </div>

          <div className="border-t border-zinc-850 pt-4">
            <span className="label block mb-2 font-mono text-zinc-500">Placement Status Filter</span>
            <select
              value={filterPlacementStatus}
              onChange={(e) => setFilterPlacementStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-yellow-500/70 font-mono"
            >
              <option value="ALL">ALL CANDIDATES</option>
              <option value="Available">AVAILABLE</option>
              <option value="Shortlisted">SHORTLISTED</option>
              <option value="Interviewing">INTERVIEWING</option>
              <option value="Placed">PLACED</option>
            </select>
          </div>

          <div className="border-t border-zinc-850 pt-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="label">Skill Lane Filters</span>
              {activeSkill && (
                <button 
                  onClick={() => setActiveSkill("")} 
                  className="text-[9px] font-mono text-yellow-500 hover:underline"
                >
                  CLEAR
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto pr-1">
              <button
                onClick={() => setActiveSkill("")}
                className={cn(
                  "px-2 py-1 text-[9px] font-mono rounded border transition-all",
                  !activeSkill
                    ? "bg-yellow-500 text-black border-yellow-500 font-bold"
                    : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700"
                )}
              >
                ALL
              </button>
              {allSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setActiveSkill(skill)}
                  className={cn(
                    "px-2 py-1 text-[9px] font-mono rounded border transition-all",
                    activeSkill === skill
                      ? "bg-yellow-500 text-black border-yellow-500 font-bold"
                      : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700"
                  )}
                >
                  {skill.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          {(q || activeSkill || filterShortlisted || filterResume || filterGithub || filterLinkedin || filterTested || filterPlacementStatus !== "ALL" || jdText) && (
            <button
              onClick={() => {
                setQ("");
                setActiveSkill("");
                setFilterShortlisted(false);
                setFilterResume(false);
                setFilterGithub(false);
                setFilterLinkedin(false);
                setFilterTested(false);
                setFilterPlacementStatus("ALL");
                setJdText("");
              }}
              className="w-full text-center py-2 border border-dashed border-zinc-800 text-[10px] font-mono text-zinc-500 hover:text-white hover:border-zinc-750 rounded-lg transition-all"
            >
              RESET ALL FILTERS
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer (Filters) */}
      <AnimatePresence>
        {isFilterMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-start">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterMobileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="relative w-full max-w-[280px] bg-zinc-950 border-r border-zinc-850 p-5 h-full overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                  <span className="label text-[11px] text-white">Registry Filters</span>
                  <button onClick={() => setIsFilterMobileOpen(false)} className="text-zinc-500 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="label block">Keyword Search</span>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Name, skills..."
                      className="field pl-9"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-850 pt-3">
                  <span className="label block mb-2.5">Verification Dashboard</span>
                  <div className="space-y-3 font-mono text-xs">
                    <label className="flex items-center gap-2.5 text-zinc-400">
                      <input
                        type="checkbox"
                        checked={filterShortlisted}
                        onChange={(e) => {
                          setFilterShortlisted(e.target.checked);
                        }}
                        className="rounded border-zinc-800 bg-black text-yellow-500 focus:ring-0"
                      />
                      <span>Shortlisted ({shortlist.length})</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-zinc-400">
                      <input
                        type="checkbox"
                        checked={filterResume}
                        onChange={(e) => {
                          setFilterResume(e.target.checked);
                        }}
                        className="rounded border-zinc-800 bg-black text-yellow-500 focus:ring-0"
                      />
                      <span>Verified Resume</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-zinc-400">
                      <input
                        type="checkbox"
                        checked={filterGithub}
                        onChange={(e) => {
                          setFilterGithub(e.target.checked);
                        }}
                        className="rounded border-zinc-800 bg-black text-yellow-500 focus:ring-0"
                      />
                      <span>GitHub Connected</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-zinc-400">
                      <input
                        type="checkbox"
                        checked={filterLinkedin}
                        onChange={(e) => {
                          setFilterLinkedin(e.target.checked);
                        }}
                        className="rounded border-zinc-800 bg-black text-yellow-500 focus:ring-0"
                      />
                      <span>LinkedIn Connected</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-zinc-400">
                      <input
                        type="checkbox"
                        checked={filterTested}
                        onChange={(e) => {
                          setFilterTested(e.target.checked);
                        }}
                        className="rounded border-zinc-800 bg-black text-yellow-500 focus:ring-0"
                      />
                      <span>Completed Tests</span>
                    </label>
                  </div>
                </div>

                <div className="border-t border-zinc-850 pt-3">
                  <span className="label block mb-2 font-mono text-zinc-550">Placement Status</span>
                  <select
                    value={filterPlacementStatus}
                    onChange={(e) => setFilterPlacementStatus(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-yellow-500/70 font-mono"
                  >
                    <option value="ALL">ALL CANDIDATES</option>
                    <option value="Available">AVAILABLE</option>
                    <option value="Shortlisted">SHORTLISTED</option>
                    <option value="Interviewing">INTERVIEWING</option>
                    <option value="Placed">PLACED</option>
                  </select>
                </div>

                <div className="border-t border-zinc-850 pt-3">
                  <span className="label block mb-2">Technical Skills</span>
                  <div className="flex flex-wrap gap-1 max-h-[160px] overflow-y-auto">
                    {allSkills.map(skill => (
                      <button
                        key={`mob-${skill}`}
                        onClick={() => setActiveSkill(skill)}
                        className={cn(
                          "px-2 py-1 text-[9px] font-mono rounded border transition-all",
                          activeSkill === skill
                            ? "bg-yellow-500 text-black border-yellow-500"
                            : "bg-zinc-950 border-zinc-850 text-zinc-400"
                        )}
                      >
                        {skill.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setQ("");
                  setActiveSkill("");
                  setFilterShortlisted(false);
                  setFilterResume(false);
                  setFilterGithub(false);
                  setFilterLinkedin(false);
                  setFilterTested(false);
                  setFilterPlacementStatus("ALL");
                  setJdText("");
                  setIsFilterMobileOpen(false);
                }}
                className="w-full text-center py-2.5 border border-dashed border-zinc-800 text-[10px] font-mono text-zinc-500 hover:text-white rounded-lg transition-all mt-4"
              >
                CLEAR FILTER KEYS
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. CENTER PANEL (MAIN WORKSPACE) */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        
        {/* Horizontal Stats Grid */}
        <header className="panel p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/60 border-zinc-850">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Users className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-[8px] font-mono uppercase">Talents</p>
              <p className="text-sm font-bold text-white font-mono">{totalRecords}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <GitBranch className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-[8px] font-mono uppercase">GitHub</p>
              <p className="text-sm font-bold text-white font-mono">{githubLinkedCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <ExternalLink className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-[8px] font-mono uppercase">LinkedIn</p>
              <p className="text-sm font-bold text-white font-mono">{linkedinLinkedCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <FileText className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-[8px] font-mono uppercase">Resumes</p>
              <p className="text-sm font-bold text-white font-mono">{resumeReadyCount}</p>
            </div>
          </div>
        </header>

        {/* ATS JD Matcher Console */}
        <div className="panel overflow-hidden border border-zinc-800 bg-zinc-950/40">
          <button 
            onClick={() => setIsJdMatcherOpen(!isJdMatcherOpen)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-900/30 transition duration-200"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  ATS / Job Description Matcher
                </h3>
                <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                  {jdText.trim() 
                    ? `Active Analysis: ${matchedJdSkills.length} keywords identified from input` 
                    : "Paste a target JD to rank & score candidate profiles by relevance"}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-yellow-500 hover:text-yellow-400">
              {isJdMatcherOpen ? "[ COLLAPSE - ]" : "[ EXPAND + ]"}
            </span>
          </button>

          <AnimatePresence>
            {isJdMatcherOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-zinc-850 p-4 space-y-4"
              >
                <div className="space-y-1">
                  <span className="label text-[10px] block">Job Description Text</span>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste your target job description here (e.g. 'We are looking for a React developer with Node.js and TypeScript experience...')"
                    className="field min-h-[120px] font-mono text-xs bg-zinc-950/80 border border-zinc-850 focus:border-yellow-500/70"
                  />
                </div>

                {jdText.trim() && (
                  <div className="space-y-2">
                    <span className="label text-[10px] block">Extracted Keywords Matching Portfolio Vocabulary</span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedJdSkills.length > 0 ? (
                        matchedJdSkills.map((sk) => (
                          <span 
                            key={`jd-skill-${sk}`} 
                            className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md"
                          >
                            {sk.toUpperCase()}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-500 italic">No direct matching skills found in database vocabulary. Try adding keywords like React, Python, or SQL.</span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* List Title Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-yellow-500" />
            Registry Records ({processedStudents.length})
          </h2>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-500 text-[10px] uppercase font-bold">Sort By:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-850 text-zinc-300 rounded px-2.5 py-1 hover:border-zinc-700 focus:outline-none focus:border-yellow-500 text-[11px]"
            >
              <option value="name">Candidate Name (A-Z)</option>
              {jdText.trim() && <option value="jdScore">JD Match Score</option>}
              <option value="aptitude">Aptitude Score</option>
              <option value="domain">Domain Score</option>
            </select>
          </div>
        </div>

        {/* Bento Grid layout */}
        {processedStudents.length === 0 ? (
          <div className="panel p-12 text-center space-y-3 border-zinc-850">
            <AlertCircle className="h-8 w-8 text-zinc-650 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-350 uppercase font-mono">No Matching Talent Records</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              No students match the current filters. Update your keyword query or select another lane in the sidebar.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {processedStudents.map((student) => {
              const { percentage, checks } = evaluateProfile(student);
              const skills = skillsOf(student.skills);
              const isPinned = shortlist.includes(student.id);
              const isHovered = hoveredStudentId === student.id;

              const ghHandle = getGithubHandle(student.githubUrl);
              const lnHandle = getLinkedinHandle(student.linkedinUrl);

              return (
                <BentoCard 
                  key={student.id} 
                  className={cn(
                    "p-5 flex flex-col justify-between border min-h-[270px] relative transition-all duration-300",
                    isPinned ? "border-yellow-500 bg-zinc-900/10" : "border-zinc-850 bg-zinc-950/20",
                    percentage === 100 ? "shadow-[0_0_15px_rgba(234,179,8,0.04)]" : ""
                  )}
                  onMouseEnter={() => setHoveredStudentId(student.id)}
                  onMouseLeave={() => setHoveredStudentId(null)}
                >
                  <div>
                    {/* Header: Reg & Completion Gauge with Hover Tooltip */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="font-mono text-[9px] text-yellow-500 font-bold tracking-wider uppercase">{student.regNumber}</span>
                          <span className={cn(
                            "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                            student.placementStatus === "Placed" && "bg-yellow-500 text-black",
                            student.placementStatus === "Interviewing" && "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 animate-pulse",
                            student.placementStatus === "Shortlisted" && "bg-zinc-800 text-zinc-300 border border-zinc-700",
                            (student.placementStatus === "Available" || !student.placementStatus) && "bg-zinc-900 text-zinc-500 border border-zinc-850"
                          )}>
                            {student.placementStatus || "Available"}
                          </span>
                        </div>
                        <h3 className="mt-1.5 text-base font-bold text-white tracking-tight leading-snug hover:text-yellow-400 flex items-center gap-2 flex-wrap font-display">
                          <Link href={`/profile/${student.id}`}>{student.fullName}</Link>
                          
                          {jdText.trim() && (
                            <span className="inline-flex items-center gap-0.5 bg-yellow-500/10 border border-yellow-500/30 rounded px-1.5 py-0.5 text-[9px] font-bold text-yellow-500 font-mono">
                              <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                              {student.jdScore}% MATCH
                            </span>
                          )}
                        </h3>
                      </div>
                      
                      {/* Interactive Completeness Indicator */}
                      <div className="relative group">
                        <RadialProgress value={percentage} size={42} strokeWidth={3} className="cursor-pointer" />
                        
                        {/* Hover detailed checklist */}
                        <div className="absolute right-0 top-12 z-40 w-48 p-3 rounded-lg border border-zinc-800 bg-zinc-950/95 shadow-xl text-[9px] font-mono text-zinc-400 space-y-1.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
                          <p className="font-bold text-white border-b border-zinc-850 pb-1 uppercase">Profile strength: {percentage}%</p>
                          {checks.map((c, idx) => (
                            <div key={`check-${student.id}-${idx}`} className="flex items-center justify-between">
                              <span className={c.met ? "text-zinc-300" : "text-zinc-600"}>{c.name}</span>
                              <span className={c.met ? "text-yellow-500" : "text-zinc-700"}>{c.met ? "✓" : "×"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Summary Description */}
                    <p className="mt-3 text-xs leading-relaxed text-zinc-400 line-clamp-3">
                      {student.description || "Student summary is currently pending. Admin can upload verified details from cockpit."}
                    </p>

                    {/* Skills Badge Cloud */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {skills.slice(0, 4).map((skill, idx) => (
                        <Badge key={`${student.id}-skill-${skill}-${idx}`} variant={activeSkill === skill ? "gold" : "default"}>
                          {skill}
                        </Badge>
                      ))}
                      {skills.length > 4 && (
                        <span className="text-[9px] text-zinc-500 font-mono self-center px-1">
                          +{skills.length - 4} MORE
                        </span>
                      )}
                    </div>

                    {/* JD Matched Keywords (if JD active) */}
                    {jdText.trim() && student.matchedSkillsForStudent && student.matchedSkillsForStudent.length > 0 && (
                      <div className="mt-3 text-[9px] font-mono text-zinc-500 bg-zinc-950/40 p-2 rounded-lg border border-zinc-900/80">
                        <span className="text-yellow-500 font-bold uppercase tracking-wider text-[8px] block mb-1">Matched Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {student.matchedSkillsForStudent.map(s => (
                            <span key={`matched-badge-${student.id}-${s}`} className="text-zinc-300 bg-zinc-900 px-1 py-0.2 rounded border border-zinc-800/60 uppercase">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions and Verified Integrations */}
                  <div className="mt-5 border-t border-zinc-850 pt-4 flex flex-col gap-3 justify-end">
                    
                    {/* Proper integration of github & linkedin handles */}
                    <div className="flex flex-wrap items-center gap-2.5 font-mono text-[9px] text-zinc-500">
                      {student.githubUrl ? (
                        <a 
                          href={student.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-zinc-300 hover:text-yellow-500 transition"
                          title="Open GitHub Profile"
                        >
                          <GitBranch className="h-3 w-3 text-yellow-500/80" />
                          <span>{ghHandle}</span>
                        </a>
                      ) : (
                        <span className="text-zinc-700 select-none">GH offline</span>
                      )}
                      
                      <span className="text-zinc-800">•</span>
                      
                      {student.linkedinUrl ? (
                        <a 
                          href={student.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-zinc-300 hover:text-yellow-500 transition"
                          title="Open LinkedIn Profile"
                        >
                          <ExternalLink className="h-3 w-3 text-yellow-500/80" />
                          <span>{lnHandle}</span>
                        </a>
                      ) : (
                        <span className="text-zinc-700 select-none">LN offline</span>
                      )}

                      {student.resumeUrl && (
                        <>
                          <span className="text-zinc-800">•</span>
                          <a 
                            href={student.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-0.5 text-zinc-400 hover:text-white transition"
                          >
                            <FileText className="h-3 w-3" />
                            <span>CV</span>
                          </a>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-900/50">
                      {/* Apt/Domain metrics */}
                      <div className="font-mono text-[9px] text-zinc-400">
                        {student.aptitudeScore !== null || student.domainScore !== null ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <Check className="h-3 w-3" /> TESTED
                          </span>
                        ) : (
                          <span className="text-zinc-650">UNTESTED</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleShortlist(student.id)}
                          className={cn(
                            "px-2.5 py-1.5 rounded text-[10px] font-mono font-bold border transition-all active:scale-[0.97]",
                            isPinned
                              ? "bg-yellow-500 text-black border-yellow-500"
                              : "bg-zinc-950 border-zinc-850 text-zinc-450 hover:border-zinc-700 hover:text-white"
                          )}
                        >
                          {isPinned ? "PINNED" : "+ PIN"}
                        </button>
                        <Link 
                          href={`/profile/${student.id}`} 
                          className="px-2.5 py-1.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-350 hover:border-zinc-700 hover:text-white flex items-center gap-0.5"
                        >
                          VIEW
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </BentoCard>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. SHORTLIST TRAY (Responsive Sidebar + Mobile Drawer) */}
      {/* ========================================================================= */}
      {/* Desktop Tray */}
      <aside className="hidden lg:block space-y-6">
        <div className="panel p-4 space-y-4 bg-zinc-900/10 border-zinc-850 sticky top-24">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Shortlist Tray ({shortlist.length})
            </h3>
            {shortlist.length > 0 && (
              <button
                onClick={clearShortlist}
                className="text-[9px] font-mono text-zinc-550 hover:text-red-400 flex items-center gap-0.5 transition"
                title="Clear Shortlist"
              >
                <Trash2 className="h-3 w-3" />
                CLEAR
              </button>
            )}
          </div>

          {shortlistedStudents.length === 0 ? (
            <div className="text-center py-10 text-zinc-600 space-y-2">
              <p className="text-xs font-mono">Tray is empty.</p>
              <p className="text-[9px] leading-relaxed max-w-[180px] mx-auto">
                Click "+ PIN" on student cards to compile candidates here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
                {shortlistedStudents.map((s) => (
                  <div 
                    key={`short-item-${s.id}`}
                    className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-lg flex items-center justify-between gap-2 hover:border-zinc-750 transition"
                  >
                    <div className="min-w-0 font-mono">
                      <Link href={`/profile/${s.id}`} className="text-xs font-bold text-white hover:text-yellow-400 block truncate">
                        {s.fullName}
                      </Link>
                      <span className="text-[9px] text-zinc-550">{s.regNumber}</span>
                    </div>
                    <button 
                      onClick={() => toggleShortlist(s.id)}
                      className="text-zinc-650 hover:text-red-400 p-1 transition"
                      title="Remove"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-850 pt-3 space-y-2">
                <button
                  onClick={copyShortlistEmails}
                  className="w-full btn-secondary text-[11px] py-2 flex items-center justify-center gap-1.5 font-mono"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      COPIED MAILS!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      COPY EMAIL LIST
                    </>
                  )}
                </button>
                <button
                  onClick={copyShareLink}
                  className="w-full btn-secondary text-[11px] py-2 flex items-center justify-center gap-1.5 font-mono text-yellow-500 hover:text-yellow-400 hover:border-yellow-500/50"
                >
                  {isShareCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      LINK COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      SHARE SHORTLIST LINK
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsCompareOpen(true)}
                  className="w-full btn-primary text-[11px] py-2 flex items-center justify-center font-mono"
                >
                  COMPARE PIPELINE
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer (Shortlist) */}
      <AnimatePresence>
        {isShortlistMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShortlistMobileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="relative w-full max-w-[280px] bg-zinc-950 border-l border-zinc-850 p-5 h-full overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                  <span className="label text-[11px] text-white">Shortlist Tray ({shortlist.length})</span>
                  <button onClick={() => setIsShortlistMobileOpen(false)} className="text-zinc-500 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {shortlistedStudents.length === 0 ? (
                  <div className="text-center py-12 text-zinc-600 font-mono space-y-2">
                    <p className="text-xs">Tray is empty.</p>
                    <p className="text-[10px] leading-relaxed">
                      Click "+ PIN" on student cards to compile candidates.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                    {shortlistedStudents.map((s) => (
                      <div 
                        key={`mob-short-${s.id}`}
                        className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-lg flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 font-mono">
                          <Link 
                            href={`/profile/${s.id}`}
                            onClick={() => setIsShortlistMobileOpen(false)}
                            className="text-xs font-bold text-white hover:text-yellow-400 block truncate"
                          >
                            {s.fullName}
                          </Link>
                          <span className="text-[9px] text-zinc-500">{s.regNumber}</span>
                        </div>
                        <button 
                          onClick={() => toggleShortlist(s.id)}
                          className="text-zinc-600 hover:text-red-400 p-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {shortlistedStudents.length > 0 && (
                <div className="border-t border-zinc-850 pt-3 space-y-2 bg-zinc-950">
                  <button
                    onClick={copyShortlistEmails}
                    className="w-full btn-secondary text-[11px] py-2 flex items-center justify-center gap-1.5 font-mono"
                  >
                    {isCopied ? "COPIED EMAILS!" : "COPY EMAIL LIST"}
                  </button>
                  <button
                    onClick={copyShareLink}
                    className="w-full btn-secondary text-[11px] py-2 flex items-center justify-center gap-1.5 font-mono text-yellow-500 hover:text-yellow-400"
                  >
                    {isShareCopied ? "LINK COPIED!" : "SHARE SHORTLIST LINK"}
                  </button>
                  <button
                    onClick={() => {
                      setIsShortlistMobileOpen(false);
                      setIsCompareOpen(true);
                    }}
                    className="w-full btn-primary text-[11px] py-2 flex items-center justify-center font-mono"
                  >
                    COMPARE PIPELINE
                  </button>
                  <button
                    onClick={clearShortlist}
                    className="w-full text-center text-[10px] font-mono text-zinc-550 hover:text-red-400 py-1"
                  >
                    CLEAR ALL PINNED
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-5xl rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h2 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Pipeline Comparison Workspace
              </h2>
              <button 
                onClick={() => setIsCompareOpen(false)}
                className="text-xs font-mono text-zinc-500 hover:text-white"
              >
                CLOSE [X]
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-zinc-850 bg-zinc-900 text-zinc-400">
                    <th className="p-3 font-bold">Student</th>
                    <th className="p-3 font-bold">Status</th>
                    {jdText.trim() && <th className="p-3 font-bold text-yellow-500">JD Match</th>}
                    <th className="p-3 font-bold">Skills</th>
                    <th className="p-3 font-bold">Test Scores</th>
                    <th className="p-3 font-bold">Key Projects</th>
                    <th className="p-3 font-bold">Internships</th>
                    <th className="p-3 font-bold">Resume Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {shortlistedStudents.map((s) => (
                    <tr key={`comp-${s.id}`} className="hover:bg-zinc-900/30">
                      <td className="p-3">
                        <Link href={`/profile/${s.id}`} className="font-bold text-white hover:text-yellow-400 block">
                          {s.fullName}
                        </Link>
                        <span className="text-[10px] text-zinc-500 block">{s.regNumber}</span>
                      </td>
                      <td className="p-3">
                        <span className={cn(
                          "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase",
                          s.placementStatus === "Placed" && "bg-yellow-500 text-black",
                          s.placementStatus === "Interviewing" && "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30",
                          s.placementStatus === "Shortlisted" && "bg-zinc-800 text-zinc-300",
                          (s.placementStatus === "Available" || !s.placementStatus) && "bg-zinc-900 text-zinc-500"
                        )}>
                          {s.placementStatus || "Available"}
                        </span>
                      </td>
                      {jdText.trim() && (
                        <td className="p-3 font-bold text-yellow-500">
                          {s.jdScore}% Match
                        </td>
                      )}
                      <td className="p-3 max-w-[200px] whitespace-normal">
                        <div className="flex flex-wrap gap-1">
                          {skillsOf(s.skills).map((skill, idx) => (
                            <span key={`comp-${s.id}-s-${idx}`} className="text-[9px] bg-zinc-900 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-800">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-bold">
                        <div className="text-white">Aptitude: {s.aptitudeScore !== null ? `${s.aptitudeScore} / 4` : "N/A"}</div>
                        <div className="text-yellow-500">Domain: {s.domainScore !== null ? `${s.domainScore} / 5` : "N/A"}</div>
                      </td>
                      <td className="p-3 max-w-[250px] truncate-3-lines leading-relaxed text-zinc-400">
                        {s.projects || "No projects added."}
                      </td>
                      <td className="p-3 max-w-[250px] truncate-3-lines leading-relaxed text-zinc-400">
                        {s.internships || "No internships added."}
                      </td>
                      <td className="p-3">
                        {s.resumeUrl ? (
                          <a 
                            href={s.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-yellow-500 hover:underline inline-flex items-center gap-1"
                          >
                            Resume <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-zinc-650">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

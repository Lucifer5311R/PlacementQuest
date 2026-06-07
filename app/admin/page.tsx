import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  Users, GitBranch, ExternalLink, FileText, CheckCircle2, 
  Pencil, Search, HelpCircle, Plus, Trash2, Shield, ArrowRight 
} from "lucide-react";
import { Badge } from "@/components/ui/cards";
import { isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createQuestionAction, deleteQuestionAction } from "../actions";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; tab?: string }>;
}) {
  if (!(await isAdminSession())) {
    redirect("/login");
  }

  const params = await searchParams;
  const q = (params?.q || "").toLowerCase();
  const currentTab = params?.tab || "students";

  // Data fetching
  const students = await prisma.student.findMany({ orderBy: { fullName: "asc" } });
  const questions = await prisma.question.findMany({ orderBy: { category: "asc" } });

  const filteredStudents = students.filter((student) =>
    [student.fullName, student.regNumber, student.email, student.skills].join(" ").toLowerCase().includes(q)
  );

  const filteredQuestions = questions.filter((question) =>
    [question.content, question.category, question.subCategory].join(" ").toLowerCase().includes(q)
  );

  const stats = [
    { label: "Students", value: students.length, icon: Users },
    { label: "GitHub Links", value: students.filter((s) => s.githubUrl).length, icon: GitBranch },
    { label: "LinkedIn Links", value: students.filter((s) => s.linkedinUrl).length, icon: ExternalLink },
    { label: "Aptitude Tests", value: students.filter((s) => s.aptitudeScore !== null).length, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Admin Panel Header */}
      <header className="panel p-6 border border-zinc-800 bg-zinc-900/10">
        <div className="grid gap-6 md:grid-cols-[1fr_420px]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-yellow-500/20 bg-yellow-500/10 text-[10px] font-mono font-bold text-yellow-500 uppercase">
              <Shield className="h-3.5 w-3.5" /> SECURE ROOT
            </div>
            <h1 className="mt-3 text-2xl font-mono font-bold tracking-tight text-white uppercase">
              Student registry cockpit
            </h1>
            <p className="mt-1 font-mono text-xs text-zinc-500">
              Edit candidate files, verify links, and manage assessment questions for the talent matching drive.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg flex flex-col justify-center">
                  <Icon className="h-4 w-4 text-yellow-500 mb-2" />
                  <span className="text-[14px] font-mono font-bold text-white leading-none">{stat.value}</span>
                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-650 mt-1">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Tabs Layout navigation */}
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
        <div className="flex gap-2 text-xs font-mono font-bold">
          <Link
            href="/admin?tab=students"
            className={`px-4 py-2 border rounded-lg transition-all ${
              currentTab === "students"
                ? "bg-yellow-500 border-yellow-500 text-black"
                : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white"
            }`}
          >
            STUDENT REGISTRY ({students.length})
          </Link>
          <Link
            href="/admin?tab=questions"
            className={`px-4 py-2 border rounded-lg transition-all ${
              currentTab === "questions"
                ? "bg-yellow-500 border-yellow-500 text-black"
                : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white"
            }`}
          >
            QUIZ QUESTIONS ({questions.length})
          </Link>
        </div>

        {/* Search tool */}
        <form className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-550" />
          <input
            name="q"
            defaultValue={q}
            placeholder={currentTab === "students" ? "Search registry..." : "Search questions..."}
            className="field pl-9 text-xs font-mono"
          />
          <input type="hidden" name="tab" value={currentTab} />
        </form>
      </div>

      {/* Tab 1: Student Registry Control */}
      {currentTab === "students" && (
        <section className="panel overflow-hidden border border-zinc-850">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-850">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider">Candidate</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider">Contact details</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider">Scores (Apt / Dom)</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider">Verification Checklist</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-zinc-900/10 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white">{student.fullName}</div>
                      <div className="mt-0.5 text-[10px] text-yellow-500 font-bold">{student.regNumber.toUpperCase()}</div>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-400">
                      <div>{student.email}</div>
                      <div className="mt-0.5 text-zinc-650">{student.phone}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-white">
                      <span>Apt: {student.aptitudeScore !== null ? `${student.aptitudeScore}` : "—"}</span>
                      <span className="mx-2 text-zinc-700">/</span>
                      <span className="text-yellow-500">Dom: {student.domainScore !== null ? `${student.domainScore}` : "—"}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={student.githubUrl ? "success" : "pending"}>GitHub</Badge>
                        <Badge variant={student.linkedinUrl ? "success" : "pending"}>LinkedIn</Badge>
                        <Badge variant={student.resumeUrl ? "success" : "pending"}>Resume</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link 
                          href={`/profile/${student.id}`} 
                          className="px-2 py-1 rounded bg-zinc-950 border border-zinc-850 text-zinc-300 hover:border-zinc-700 hover:text-white"
                        >
                          View
                        </Link>
                        <Link 
                          href={`/admin/students/${student.id}/edit`} 
                          className="px-2 py-1 rounded bg-yellow-500 text-black font-bold hover:bg-yellow-400 inline-flex items-center gap-1"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 2: Quiz Question Manager Control */}
      {currentTab === "questions" && (
        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          
          {/* Question List Workspace */}
          <section className="panel overflow-hidden border border-zinc-850">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-850">
                  <tr>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Question details</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Section</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Correct Answer</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-zinc-900/10 transition">
                      <td className="px-4 py-3.5 max-w-[320px] whitespace-normal">
                        <div className="text-zinc-350 font-sans leading-relaxed">{q.content}</div>
                        <div className="mt-1 text-[9px] text-zinc-600">ID: {q.id}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-yellow-500 font-bold block">{q.category.toUpperCase()}</span>
                        <span className="text-zinc-550 text-[10px] block mt-0.5">{q.subCategory.toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-350 font-bold">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          {q.correctAnswer}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <form action={deleteQuestionAction.bind(null, q.id)}>
                          <button 
                            type="submit" 
                            className="p-1.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition"
                            title="Delete question"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {filteredQuestions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-650">
                        No quiz questions registered inside database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Question Creator Form */}
          <aside className="panel p-4 space-y-4 border border-zinc-850 bg-zinc-950/20 h-fit">
            <div className="border-b border-zinc-850 pb-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-yellow-500" />
                CREATE QUESTION
              </h3>
            </div>

            <form action={createQuestionAction} className="space-y-3 font-mono text-xs">
              <label className="block space-y-1">
                <span className="label text-[9px]">Select Category</span>
                <select 
                  name="category" 
                  className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-white outline-none focus:border-yellow-500"
                >
                  <option value="Aptitude">APTITUDE</option>
                  <option value="Domain">DOMAIN KNOWLEDGE</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="label text-[9px]">Subtopic Lane</span>
                <input 
                  required 
                  name="subCategory" 
                  placeholder="e.g. OS, Java, Quantitative" 
                  className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-white outline-none focus:border-yellow-500"
                />
              </label>

              <label className="block space-y-1">
                <span className="label text-[9px]">Difficulty</span>
                <select 
                  name="difficulty" 
                  className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-white outline-none focus:border-yellow-500"
                >
                  <option value="Easy">EASY</option>
                  <option value="Medium">MEDIUM</option>
                  <option value="Hard">HARD</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="label text-[9px]">Question Content</span>
                <textarea 
                  required 
                  name="content" 
                  placeholder="Type the question content..." 
                  className="w-full min-h-[70px] bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-white outline-none focus:border-yellow-500 resize-y"
                />
              </label>

              <label className="block space-y-1">
                <span className="label text-[9px]">Comma-separated options</span>
                <textarea 
                  required 
                  name="options" 
                  placeholder="Option A, Option B, Option C, Option D" 
                  className="w-full min-h-[50px] bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-white outline-none focus:border-yellow-500 resize-y"
                />
              </label>

              <label className="block space-y-1">
                <span className="label text-[9px]">Correct Option Content</span>
                <input 
                  required 
                  name="correctAnswer" 
                  placeholder="Must match exactly one option" 
                  className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-white outline-none focus:border-yellow-500"
                />
              </label>

              <button 
                type="submit" 
                className="w-full btn-primary py-2 text-center"
              >
                SUBMIT QUESTION
              </button>
            </form>
          </aside>
        </div>
      )}

    </div>
  );
}

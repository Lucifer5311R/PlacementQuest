import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, ExternalLink, FileText, GitBranch, Pencil, 
  ShieldCheck, Calendar, Phone, Mail, Award, CheckCircle2 
} from "lucide-react";
import { Badge, ShortlistButton } from "@/components/ui/cards";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AtsAnalyzer from "@/components/AtsAnalyzer";

function skillsOf(value?: string | null) {
  return (value || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function githubUsername(url?: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes("github.com") ? parsed.pathname.split("/").filter(Boolean)[0] : null;
  } catch {
    return url.replace("https://github.com/", "").replace(/\/$/, "") || null;
  }
}

async function getGithubReadme(username: string) {
  try {
    const res = await fetch(`https://api.github.com/repos/${username}/${username}/readme`, {
      headers: { Accept: "application/vnd.github.v3.raw" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [student, session] = await Promise.all([
    prisma.student.findUnique({ where: { id } }),
    getSession(),
  ]);

  if (!student) notFound();

  const isAuthorized = session?.role === "admin" || (session?.role === "student" && session?.studentId === id);
  const username = githubUsername(student.githubUrl);
  const readme = username ? await getGithubReadme(username) : null;
  const skills = skillsOf(student.skills);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2 font-bold text-zinc-300 hover:border-zinc-700 hover:text-white transition">
          <ArrowLeft className="h-4 w-4" />
          BACK TO DASHBOARD
        </Link>
        <div className="flex items-center gap-2">
          <ShortlistButton studentId={student.id} />
          {isAuthorized && (
            <Link href={`/admin/students/${student.id}/edit`} className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-bold text-black hover:bg-yellow-400 transition">
              <Pencil className="h-4 w-4" />
              EDIT RECORD
            </Link>
          )}
        </div>
      </div>

      {/* Main Student Header Card */}
      <header className="panel p-6 border border-zinc-800 bg-zinc-900/25">
        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <div>
              <span className="font-mono text-xs text-yellow-500 font-bold tracking-widest">{student.regNumber.toUpperCase()}</span>
              <h1 className="text-3xl font-bold text-white tracking-tight mt-1">{student.fullName}</h1>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400 max-w-2xl">
              {student.description || "Student summary description is pending. Admin can upload verified details from cockpit."}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Badge variant={student.resumeUrl ? "success" : "pending"}>
                {student.resumeUrl ? "Verified CV" : "Pending CV"}
              </Badge>
              <Badge variant="gold">Registry Synced</Badge>
              {(student.aptitudeScore !== null || student.domainScore !== null) ? (
                <Badge variant="success">Test Records Online</Badge>
              ) : (
                <Badge variant="pending">No Test Records</Badge>
              )}
            </div>
          </div>

          {/* Quick Stats Panel: Test Scores */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5">
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg flex flex-col justify-center min-h-[65px]">
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Aptitude Score</span>
              <span className="text-lg font-mono font-bold text-white mt-1">
                {student.aptitudeScore !== null ? `${student.aptitudeScore} / 4` : "PENDING"}
              </span>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg flex flex-col justify-center min-h-[65px]">
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Domain Score</span>
              <span className="text-lg font-mono font-bold text-yellow-500 mt-1">
                {student.domainScore !== null ? `${student.domainScore} / 5` : "PENDING"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Grid: Details & Proof vs Summary */}
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        
        {/* Left Side: Contact, Links, Skills */}
        <aside className="space-y-6">
          
          {/* Metadata Contact Card */}
          <section className="panel p-4 space-y-4">
            <h3 className="label border-b border-zinc-850 pb-2">Student Metadata</h3>
            <div className="space-y-3 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                <span className="truncate" title={student.email}>{student.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                <span>2026 Batch</span>
              </div>
            </div>
          </section>

          {/* Proof Links */}
          <section className="panel p-4 space-y-4">
            <h3 className="label border-b border-zinc-850 pb-2">Verified Proof Anchors</h3>
            <div className="flex flex-col gap-2 font-mono text-xs">
              {student.githubUrl ? (
                <a 
                  href={student.githubUrl} 
                  target="_blank" 
                  className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-white hover:border-yellow-500/50 transition"
                >
                  <span className="flex items-center gap-2">
                    <GitBranch className="h-3.5 w-3.5 text-yellow-500" />
                    GitHub
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-600" />
                </a>
              ) : (
                <div className="p-2.5 bg-zinc-950/20 border border-zinc-850 rounded-lg text-zinc-600">
                  GitHub offline
                </div>
              )}

              {student.linkedinUrl ? (
                <a 
                  href={student.linkedinUrl} 
                  target="_blank" 
                  className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-white hover:border-yellow-500/50 transition"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5 text-yellow-500" />
                    LinkedIn
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-600" />
                </a>
              ) : (
                <div className="p-2.5 bg-zinc-950/20 border border-zinc-850 rounded-lg text-zinc-600">
                  LinkedIn offline
                </div>
              )}

              {student.resumeUrl ? (
                <a 
                  href={student.resumeUrl} 
                  target="_blank" 
                  className="flex items-center justify-between p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 hover:bg-yellow-500/15 transition"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    Verified CV
                  </span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <div className="p-2.5 bg-zinc-950/20 border border-zinc-850 rounded-lg text-zinc-600">
                  CV verification pending
                </div>
              )}
            </div>
          </section>

          {/* Technical Stack Card */}
          <section className="panel p-4 space-y-3">
            <h3 className="label border-b border-zinc-850 pb-2">Technical Stack</h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.length ? (
                skills.map((skill, idx) => (
                  <Badge key={`prof-stack-${skill}-${idx}`} variant="default">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-zinc-600 font-mono">No verified skills added.</span>
              )}
            </div>
          </section>

          {/* Department Verified Stamp */}
          <section className="panel p-4 border border-zinc-850/80 bg-zinc-950/40">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold font-mono text-white">DEPT VERIFIED</p>
                <p className="text-[10px] font-mono text-zinc-500 mt-1 leading-normal">
                  All links, test metrics and registry keys are verified by the placement coordinator.
                </p>
              </div>
            </div>
          </section>
        </aside>

        {/* Right Side: Resume summary records & ATS Analyzer */}
        <main className="space-y-6">
          
          {/* Placement Details: Internships & Projects */}
          <section className="panel p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
              <Award className="h-4 w-4 text-yellow-500" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Placement Summary
              </h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-zinc-950/50 border border-zinc-850 rounded-lg space-y-2">
                <span className="label text-zinc-500">Corporate Internships</span>
                <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {student.internships || "No corporate internships registered in this candidate cycle."}
                </p>
              </div>

              <div className="p-4 bg-zinc-950/50 border border-zinc-850 rounded-lg space-y-2">
                <span className="label text-zinc-500">Key Projects</span>
                <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {student.projects || "No verification keys uploaded for key software projects."}
                </p>
              </div>
            </div>
          </section>

          {/* Interactive ATS Resume Scorer Widget */}
          <AtsAnalyzer
            fullName={student.fullName}
            skills={student.skills || ""}
            description={student.description || ""}
            projects={student.projects || ""}
            internships={student.internships || ""}
          />

          {/* Live GitHub Readme sync */}
          <section className="panel p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-850 pb-3">
              <div>
                <span className="label">GitHub Port Readme</span>
                <h2 className="text-xs font-mono font-bold text-white mt-1">
                  {username ? `${username}/${username}` : "No profile linked"}
                </h2>
              </div>
              <Badge variant={readme ? "success" : "pending"}>
                {readme ? "LIVE OVERVIEW" : "STANDBY"}
              </Badge>
            </div>

            {readme ? (
              <pre className="max-h-[380px] overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-850 bg-black/60 p-4 font-mono text-[10px] leading-relaxed text-zinc-400">
                {readme}
              </pre>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-850 bg-zinc-900/10 p-6 text-center text-xs font-mono text-zinc-600 leading-normal">
                Add a verified GitHub profile link to load the user README sync card dynamically.
              </div>
            )}
          </section>
        </main>

      </div>
    </div>
  );
}

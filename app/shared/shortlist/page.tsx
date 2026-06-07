import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { 
  Users, GitBranch, ExternalLink, FileText, 
  Award, Sparkles, AlertCircle, Mail, Phone
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function SharedShortlistPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const idList = ids ? ids.split(",").filter(Boolean) : [];

  const students = await prisma.student.findMany({
    where: {
      id: { in: idList },
    },
    orderBy: { fullName: "asc" },
  });

  // Extract handles helper
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

  const skillsOf = (skills: string | null) => {
    return (skills || "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 font-mono pb-12">
      <header className="border-b border-zinc-800 pb-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="label bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded text-[10px] inline-block mb-3">
              RECRUITMENT DESK PORTAL (READ-ONLY)
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase font-display">
              Curated <span className="text-yellow-500">Pipeline Shortlist</span>
            </h1>
            <p className="mt-1 text-xs text-zinc-500">
              Interactive candidate evaluation cockpit shared with hiring managers.
            </p>
          </div>
          
          {students.length > 0 && (
            <div className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-800 rounded-xl p-3">
              <Users className="h-5 w-5 text-yellow-500" />
              <div>
                <span className="text-[9px] text-zinc-500 uppercase block font-bold">Shortlisted Profiles</span>
                <span className="text-sm font-bold text-white font-mono">{students.length} Candidates</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {students.length === 0 ? (
        <div className="panel p-16 text-center space-y-4 max-w-2xl mx-auto border-zinc-800 bg-zinc-950/40">
          <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto" />
          <h2 className="text-lg font-bold text-white uppercase">No Candidate Profiles Identified</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The shared pipeline link does not contain any valid candidate IDs, or the requested records have been updated in the cockpit registry.
          </p>
          <div className="pt-2">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white px-4 py-2 text-xs font-bold text-zinc-300 transition"
            >
              Go to Cockpit Homepage
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Comparison Desk Layout */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => {
              const skills = skillsOf(student.skills);
              const ghHandle = getGithubHandle(student.githubUrl);
              const lnHandle = getLinkedinHandle(student.linkedinUrl);

              return (
                <div 
                  key={student.id} 
                  className="panel overflow-hidden border border-zinc-850 bg-zinc-950/20 hover:border-zinc-700/80 transition duration-300 flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="font-mono text-[9px] text-yellow-500 font-bold tracking-wider uppercase">{student.regNumber}</span>
                        <h3 className="mt-0.5 text-base font-bold text-white tracking-tight leading-snug hover:text-yellow-400 font-display">
                          {student.fullName}
                        </h3>
                      </div>
                      
                      {/* Placement Status */}
                      <span className={cn(
                        "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                        student.placementStatus === "Placed" && "bg-yellow-500 text-black",
                        student.placementStatus === "Interviewing" && "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30",
                        student.placementStatus === "Shortlisted" && "bg-zinc-800 text-zinc-300 border border-zinc-700",
                        (student.placementStatus === "Available" || !student.placementStatus) && "bg-zinc-900 text-zinc-500 border border-zinc-850"
                      )}>
                        {student.placementStatus || "Available"}
                      </span>
                    </div>

                    {/* Scores Section */}
                    <div className="grid grid-cols-2 gap-2 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900/60 font-mono text-[10px]">
                      <div>
                        <span className="text-zinc-500 uppercase block font-bold text-[8px]">Aptitude Score</span>
                        <span className="text-white font-bold">{student.aptitudeScore !== null ? `${student.aptitudeScore} / 4` : "Pending"}</span>
                      </div>
                      <div>
                        <span className="text-yellow-500 uppercase block font-bold text-[8px]">Domain Score</span>
                        <span className="text-yellow-500 font-bold">{student.domainScore !== null ? `${student.domainScore} / 5` : "Pending"}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <span className="label text-[9px] block">Professional Summary</span>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-4">
                        {student.description || "Candidate summary is currently pending verification."}
                      </p>
                    </div>

                    {/* Skills */}
                    <div className="space-y-1.5">
                      <span className="label text-[9px] block">Tech Stack</span>
                      <div className="flex flex-wrap gap-1">
                        {skills.slice(0, 8).map((skill, idx) => (
                          <span key={`${student.id}-shared-s-${idx}`} className="text-[9px] bg-zinc-900 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-800 uppercase">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Projects & Internships summaries (short preview) */}
                    {student.internships && (
                      <div className="space-y-1">
                        <span className="label text-[9px] block">Internship Records</span>
                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                          {student.internships}
                        </p>
                      </div>
                    )}

                    {student.projects && (
                      <div className="space-y-1">
                        <span className="label text-[9px] block">Key Projects</span>
                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                          {student.projects}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer (Contact details, Social profiles, and Resume Link) */}
                  <div className="border-t border-zinc-850 p-5 bg-zinc-950/40 space-y-3 mt-auto">
                    {/* Contacts info */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-400 font-mono">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-zinc-550" />
                        <span>{student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-zinc-550" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Proper integration of social handles & resume link */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-900/50">
                      <div className="flex items-center gap-2.5 font-mono text-[9px]">
                        {student.githubUrl ? (
                          <a 
                            href={student.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-zinc-300 hover:text-yellow-500 transition"
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
                          >
                            <ExternalLink className="h-3 w-3 text-yellow-500/80" />
                            <span>{lnHandle}</span>
                          </a>
                        ) : (
                          <span className="text-zinc-700 select-none">LN offline</span>
                        )}
                      </div>

                      {student.resumeUrl ? (
                        <a 
                          href={student.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn-primary py-1 px-2.5 text-[9px] flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          VIEW CV
                        </a>
                      ) : (
                        <span className="text-[9px] text-zinc-650 font-mono">CV Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Detailed Side-by-side Table Comparison view */}
          <div className="panel p-6 space-y-4 border border-zinc-850 bg-zinc-950/20">
            <div className="border-b border-zinc-900 pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-display">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Talent Pipeline Matrix Comparison
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-zinc-850 bg-zinc-900 text-zinc-400">
                    <th className="p-3 font-bold">Student</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold">Aptitude Score</th>
                    <th className="p-3 font-bold">Domain Score</th>
                    <th className="p-3 font-bold">Verified Projects</th>
                    <th className="p-3 font-bold">Internship Records</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {students.map((s) => (
                    <tr key={`matrix-${s.id}`} className="hover:bg-zinc-900/30">
                      <td className="p-3">
                        <span className="font-bold text-white block">{s.fullName}</span>
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
                      <td className="p-3 font-bold text-white">
                        {s.aptitudeScore !== null ? `${s.aptitudeScore} / 4` : "Pending"}
                      </td>
                      <td className="p-3 font-bold text-yellow-500">
                        {s.domainScore !== null ? `${s.domainScore} / 5` : "Pending"}
                      </td>
                      <td className="p-3 max-w-[280px] whitespace-normal text-zinc-400 leading-relaxed">
                        {s.projects || "No projects verified."}
                      </td>
                      <td className="p-3 max-w-[280px] whitespace-normal text-zinc-400 leading-relaxed">
                        {s.internships || "No internships verified."}
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

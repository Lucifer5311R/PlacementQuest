import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { updateStudentAction } from "@/app/actions";
import { isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminSession())) {
    redirect("/login");
  }

  const { id } = await params;
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) notFound();

  const action = updateStudentAction.bind(null, student.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6 font-mono">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs font-bold text-zinc-300 hover:border-zinc-700 hover:text-white transition">
          <ArrowLeft className="h-4 w-4" />
          BACK TO COCKPIT
        </Link>
      </div>

      <form action={action} className="panel overflow-hidden border border-zinc-800">
        <header className="border-b border-zinc-850 p-6 bg-zinc-950/40">
          <span className="label">Registry Modifier</span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white uppercase">{student.fullName}</h1>
          <p className="mt-1 text-xs text-zinc-500">Registry changes update the matching dashboard and ATS scorer immediately.</p>
        </header>

        <div className="grid gap-4 p-6 text-xs sm:grid-cols-2">
          <label className="space-y-1 block">
            <span className="label block text-[10px]">Full Name</span>
            <input name="fullName" defaultValue={student.fullName} className="field" required />
          </label>
          <label className="space-y-1 block">
            <span className="label block text-[10px]">Registration Number</span>
            <input name="regNumber" defaultValue={student.regNumber} className="field" required />
          </label>
          <label className="space-y-1 block">
            <span className="label block text-[10px]">Email Address</span>
            <input name="email" type="email" defaultValue={student.email} className="field" required />
          </label>
          <label className="space-y-1 block">
            <span className="label block text-[10px]">Phone Number</span>
            <input name="phone" defaultValue={student.phone} className="field" required />
          </label>
          <label className="space-y-1 block">
            <span className="label block text-[10px]">LinkedIn Profile URL</span>
            <input name="linkedinUrl" defaultValue={student.linkedinUrl || ""} className="field" placeholder="https://linkedin.com/in/username" />
          </label>
          <label className="space-y-1 block">
            <span className="label block text-[10px]">GitHub Profile URL</span>
            <input name="githubUrl" defaultValue={student.githubUrl || ""} className="field" placeholder="https://github.com/username" />
          </label>
          <label className="space-y-1 block">
            <span className="label block text-[10px]">Placement Status</span>
            <select name="placementStatus" defaultValue={student.placementStatus || "Available"} className="field bg-zinc-900/60 text-zinc-100 border border-zinc-800 rounded-xl px-4 py-2.5">
              <option value="Available" className="bg-zinc-900 text-zinc-100">Available</option>
              <option value="Shortlisted" className="bg-zinc-900 text-zinc-100">Shortlisted</option>
              <option value="Interviewing" className="bg-zinc-900 text-zinc-100">Interviewing</option>
              <option value="Placed" className="bg-zinc-900 text-zinc-100">Placed</option>
            </select>
          </label>
          
          <label className="space-y-1 block sm:col-span-2">
            <span className="label block text-[10px]">Technical Stack (Comma-separated)</span>
            <input name="skills" defaultValue={student.skills || ""} className="field" placeholder="React, Node.js, SQLite, Python" />
          </label>
          
          <label className="space-y-1 block sm:col-span-2">
            <span className="label block text-[10px]">Professional Summary Description</span>
            <textarea name="description" defaultValue={student.description || ""} className="field min-h-24 resize-y" />
          </label>
          
          <label className="space-y-1 block sm:col-span-2">
            <span className="label block text-[10px]">Corporate Internships Summary</span>
            <textarea name="internships" defaultValue={student.internships || ""} className="field min-h-32 resize-y" />
          </label>
          
          <label className="space-y-1 block sm:col-span-2">
            <span className="label block text-[10px]">Verified Key Projects Summary</span>
            <textarea name="projects" defaultValue={student.projects || ""} className="field min-h-32 resize-y" />
          </label>
          
          <label className="space-y-1 block sm:col-span-2">
            <span className="label block text-[10px]">Verified Resume / CV File URL</span>
            <input name="resumeUrl" defaultValue={student.resumeUrl || ""} className="field" placeholder="Paste link (PDF, GDrive, Dropbox, etc.)" />
          </label>
        </div>

        <footer className="flex justify-end border-t border-zinc-850 p-6 bg-zinc-950/20">
          <button className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-6 py-2.5 font-bold text-black hover:bg-yellow-400 transition font-mono uppercase tracking-wider text-xs">
            <Save className="h-4 w-4" />
            COMMIT CHANGES
          </button>
        </footer>
      </form>
    </div>
  );
}

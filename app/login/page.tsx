import { redirect } from "next/navigation";
import { ShieldCheck, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { setSession, getSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/crypto";

async function loginAction(formData: FormData) {
  "use server";

  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!username || !password) {
    redirect("/login?error=1");
  }

  const userCount = await prisma.user.count();
  const user = await prisma.user.findUnique({ where: { username } });

  // 1. Bootstrap default admin on empty database
  const isDefaultAdmin = userCount === 0 && username === "admin" && password === "admin123";
  if (isDefaultAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        username,
        password: hashPassword(password),
        role: "admin",
      },
    });
    await setSession({
      userId: adminUser.id,
      username: adminUser.username,
      role: "admin",
    });
    redirect("/admin");
  }

  // 2. Bootstrap student user account on first login if registration number matches
  const isFirstStudentLogin = !user && password === username;
  if (isFirstStudentLogin) {
    const student = await prisma.student.findUnique({
      where: { regNumber: username },
    });
    if (student) {
      const studentUser = await prisma.user.create({
        data: {
          username,
          password: hashPassword(password),
          role: "student",
        },
      });
      await setSession({
        userId: studentUser.id,
        username: studentUser.username,
        role: "student",
        studentId: student.id,
      });
      redirect(`/profile/${student.id}`);
    }
  }

  // 3. Normal Authentication flow
  if (user && verifyPassword(password, user.password)) {
    const student = user.role === "student"
      ? await prisma.student.findUnique({ where: { regNumber: user.username } })
      : null;

    await setSession({
      userId: user.id,
      username: user.username,
      role: user.role as "admin" | "student",
      studentId: student?.id || null,
    });

    if (user.role === "admin") {
      redirect("/admin");
    } else if (student) {
      redirect(`/profile/${student.id}`);
    }
  }

  redirect("/login?error=1");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    if (session.role === "admin") {
      redirect("/admin");
    } else if (session.studentId) {
      redirect(`/profile/${session.studentId}`);
    }
  }

  const params = await searchParams;
  const hasError = params?.error === "1";

  return (
    <div className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-4xl items-center gap-10 font-mono text-xs sm:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-yellow-500/20 bg-yellow-500/10 text-[10px] font-bold text-yellow-500 uppercase">
          <ShieldCheck className="h-4 w-4" />
          SECURE PROTOCOL
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase leading-none">
            Registry <span className="text-yellow-500">Access Point</span>
          </h1>
          <p className="text-xs leading-relaxed text-zinc-400 max-w-md">
            Enter admin credentials or student registration details to update professional records, manage test scores, or review shortlists.
          </p>
        </div>
      </section>

      <form action={loginAction} className="panel p-6 border border-zinc-800 bg-zinc-950/40 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase">Authentication</h2>
          <p className="mt-1 text-[10px] text-zinc-550 leading-relaxed">
            Admin: admin / admin123<br />
            Student first login: Use your Registration Number as both Username and Password to activate your account.
          </p>
        </div>
        <div className="space-y-3">
          <input name="username" placeholder="Username / Reg Number" className="field" required />
          <input name="password" type="password" placeholder="Password" className="field" required />
        </div>
        {hasError && <p className="text-[10px] font-bold text-red-400 uppercase">ACCESS DENIED: INVALID CREDENTIALS</p>}
        <button className="w-full btn-primary py-2.5 text-center font-bold font-mono uppercase tracking-wider text-xs">
          ENTER COCKPIT
        </button>
      </form>
    </div>
  );
}

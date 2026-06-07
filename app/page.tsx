import { prisma } from "@/lib/prisma";
import DashboardWorkspace from "@/components/DashboardWorkspace";
import AnalyticsCharts from "@/components/AnalyticsCharts";

export default async function Home() {
  const studentsRaw = await prisma.student.findMany({
    orderBy: { fullName: "asc" },
  });

  // Serialize Prisma Date objects to safe JSON-serializable primitives for the client component
  const students = JSON.parse(JSON.stringify(studentsRaw));

  return (
    <div className="space-y-6">
      <header className="mb-4">
        <h1 className="text-3xl font-mono font-bold tracking-tight text-white uppercase">
          Placement <span className="text-yellow-500">Registry Cockpit</span>
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-500">
          Verify talent credentials, test scores, search skill lanes, and compile recruiter shortlist pipeline.
        </p>
      </header>

      {/* Dynamic SVG Charts */}
      <AnalyticsCharts students={students} />
      
      <DashboardWorkspace initialStudents={students} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import AssessmentTool from "@/components/AssessmentTool";

export default async function KnowledgeHubPage() {
  const questionsRaw = await prisma.question.findMany();

  // Convert SQLite stringified options into parsed array strings
  const questions = questionsRaw.map((q) => {
    let parsedOptions: string[] = [];
    try {
      parsedOptions = JSON.parse(q.options);
    } catch {
      parsedOptions = q.options.split(",").map((o) => o.trim());
    }

    return {
      id: q.id,
      category: q.category,
      subCategory: q.subCategory,
      content: q.content,
      options: parsedOptions,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
    };
  });

  return (
    <div className="space-y-6">
      <header className="mb-4 text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-mono font-bold tracking-tight text-white uppercase">
          Skill <span className="text-yellow-500">Evaluation Engine</span>
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-500 leading-relaxed">
          Select section to evaluate aptitude and core domain knowledge. Complete the test and submit your Registration Number to verify and post scores to your profile.
        </p>
      </header>

      <AssessmentTool initialQuestions={questions} />
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, isAdminSession, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/login");
}

export async function updateStudentAction(id: string, formData: FormData) {
  const session = await getSession();
  const isAuthorized = session?.role === "admin" || (session?.role === "student" && session?.studentId === id);
  if (!isAuthorized) {
    redirect("/login");
  }

  const isAdmin = session?.role === "admin";
  const updateData: any = {
    fullName: textValue(formData, "fullName") || "",
    regNumber: textValue(formData, "regNumber") || "",
    email: textValue(formData, "email") || "",
    phone: textValue(formData, "phone") || "",
    linkedinUrl: textValue(formData, "linkedinUrl"),
    githubUrl: textValue(formData, "githubUrl"),
    description: textValue(formData, "description"),
    internships: textValue(formData, "internships"),
    projects: textValue(formData, "projects"),
    skills: textValue(formData, "skills"),
    resumeUrl: textValue(formData, "resumeUrl"),
  };

  if (isAdmin) {
    const status = textValue(formData, "placementStatus");
    if (status) {
      updateData.placementStatus = status;
    }
  }

  await prisma.student.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/profile/${id}`);
  redirect("/admin");
}

export async function saveAssessmentScoreAction(regNumber: string, score: number, type: 'Aptitude' | 'Domain') {
  const cleanReg = regNumber.trim();
  const student = await prisma.student.findUnique({
    where: { regNumber: cleanReg },
  });

  if (!student) {
    return { success: false, error: `Student with Registration Number "${regNumber}" not found.` };
  }

  await prisma.student.update({
    where: { regNumber: cleanReg },
    data: {
      [type === 'Aptitude' ? 'aptitudeScore' : 'domainScore']: score,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/profile/${student.id}`);
  return { success: true, studentName: student.fullName, studentId: student.id };
}

export async function createQuestionAction(formData: FormData) {
  if (!(await isAdminSession())) {
    redirect("/login");
  }

  const category = textValue(formData, "category") || "Domain";
  const subCategory = textValue(formData, "subCategory") || "General";
  const content = textValue(formData, "content") || "";
  const correctAnswer = textValue(formData, "correctAnswer") || "";
  const difficulty = textValue(formData, "difficulty") || "Medium";
  
  const optionsRaw = textValue(formData, "options") || "";
  const options = optionsRaw
    .split(",")
    .map(o => o.trim())
    .filter(Boolean);

  if (!content || !correctAnswer || options.length < 2) {
    throw new Error("Invalid question details. Please specify content, options, and the correct answer.");
  }

  if (!options.includes(correctAnswer)) {
    options.push(correctAnswer);
  }

  await prisma.question.create({
    data: {
      category,
      subCategory,
      content,
      options: JSON.stringify(options),
      correctAnswer,
      difficulty,
    },
  });

  revalidatePath("/knowledge-hub");
  revalidatePath("/admin");
}

export async function deleteQuestionAction(id: string) {
  if (!(await isAdminSession())) {
    redirect("/login");
  }

  await prisma.question.delete({
    where: { id },
  });

  revalidatePath("/knowledge-hub");
  revalidatePath("/admin");
}

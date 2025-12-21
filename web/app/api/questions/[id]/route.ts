import { NextResponse } from "next/server";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { authorizeRequest } from "@/app/api/_utils/authorizeRequest";
import { db } from "@/lib/firebase/server";

function toDoc(label: unknown) {
  if (label && typeof label === "object" && "type" in (label as any)) return label;
  if (typeof label === "string") {
    return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: label }] }] };
  }
  return { type: "doc", content: [] };
}

function normalizeChoices(value: unknown): { key: string; label: unknown }[] {
  if (!Array.isArray(value)) return [];
  const result: { key: string; label: unknown }[] = [];
  value.forEach((choice, index) => {
    if (typeof choice === "object" && choice !== null && "key" in choice && "label" in choice) {
      const key = typeof (choice as any).key === "string" ? (choice as any).key.trim() : "";
      if (!key) return;
      result.push({ key, label: toDoc((choice as any).label) });
      return;
    }
    if (typeof choice === "string") {
      const label = choice.trim();
      if (!label) return;
      result.push({ key: `choice-${index + 1}`, label: toDoc(label) });
      return;
    }
  });
  return result;
}

function normalizeCorrectAnswer(value: unknown): string | string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") return value.trim();
  return "";
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin", "student"] });
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    return await respondQuestionDetail(id);
  } catch (error) {
    console.error("Failed to get question", error);
    return NextResponse.json({ error: "Failed to get question" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    return await respondQuestionDetail(id);
  } catch (error) {
    console.error("Failed to get question", error);
    return NextResponse.json({ error: "Failed to get question" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const body = auth.body as any;
    const docRef = doc(db, "questions", id);
    const normalizedChoices = normalizeChoices(body.choices);
    const normalizedCorrectAnswer = normalizeCorrectAnswer(body.correctAnswer);
    const normalizedTags = normalizeTags(body.tags);
    await updateDoc(docRef, {
      questionType: body.questionType,
      prompt: body.prompt,
      choices: normalizedChoices,
      correctAnswer: normalizedCorrectAnswer,
      explanation: body.explanation,
      difficulty: body.difficulty,
      order: body.order,
      tags: normalizedTags,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Failed to update question", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const docRef = doc(db, "questions", id);
    await deleteDoc(docRef);
    return NextResponse.json({ id });
  } catch (error) {
    console.error("Failed to delete question", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}

async function respondQuestionDetail(id: string) {
  const docRef = doc(db, "questions", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
}

import { NextRequest, NextResponse } from "next/server";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/server";

function normalizeChoices(value: unknown): { key: string; label: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((choice, index) => {
      if (typeof choice === "object" && choice !== null && "key" in choice && "label" in choice) {
        const key = typeof (choice as any).key === "string" ? (choice as any).key.trim() : "";
        const label = typeof (choice as any).label === "string" ? (choice as any).label.trim() : "";
        if (!key || !label) return null;
        return { key, label };
      }
      if (typeof choice === "string") {
        const label = choice.trim();
        if (!label) return null;
        return { key: `choice-${index + 1}`, label };
      }
      return null;
    })
    .filter((choice): choice is { key: string; label: string } => Boolean(choice));
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const docRef = doc(db, "questions", id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    console.error("Failed to get question", error);
    return NextResponse.json({ error: "Failed to get question" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const docRef = doc(db, "questions", id);
    const normalizedChoices = normalizeChoices(body.choices);
    const normalizedCorrectAnswer = normalizeCorrectAnswer(body.correctAnswer);
    await updateDoc(docRef, {
      questionType: body.questionType,
      prompt: body.prompt,
      choices: normalizedChoices,
      correctAnswer: normalizedCorrectAnswer,
      explanation: body.explanation,
      difficulty: body.difficulty,
      order: body.order,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Failed to update question", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

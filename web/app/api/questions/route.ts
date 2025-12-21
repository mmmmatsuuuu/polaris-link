import { NextResponse } from "next/server";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { authorizeRequest } from "@/app/api/_utils/authorizeRequest";
import { db } from "@/lib/firebase/server";

type RawChoice = { key?: string; label?: unknown } | string;

function toDoc(label: unknown) {
  if (label && typeof label === "object" && "type" in (label as any)) return label;
  if (typeof label === "string") {
    return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: label }] }] };
  }
  return { type: "doc", content: [] };
}

function normalizeChoices(value: unknown): { key: string; label: unknown }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((choice, index) => {
      if (typeof choice === "object" && choice !== null && "key" in choice && "label" in choice) {
        const key = typeof (choice as any).key === "string" ? (choice as any).key.trim() : "";
        if (!key) return null;
        return { key, label: toDoc((choice as any).label) };
      }
      if (typeof choice === "string") {
        const label = choice.trim();
        if (!label) return null;
        return { key: `choice-${index + 1}`, label: toDoc(label) };
      }
      return null;
    })
    .filter((choice): choice is { key: string; label: unknown } => Boolean(choice));
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

export async function GET(request: Request) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin", "student"] });
  if ("error" in auth) return auth.error;

  try {
    const searchParams = new URL(request.url).searchParams;
    const idsParam = searchParams.getAll("ids");
    const ids = idsParam
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);

    if (ids.length > 0) {
      const snaps = await Promise.all(ids.map((id) => getDoc(doc(db, "questions", id))));
      const questions = snaps.filter((snap) => snap.exists()).map((snap) => ({ id: snap.id, ...snap.data() }));
      return NextResponse.json({ questions });
    }

    const snapshot = await getDocs(collection(db, "questions"));
    const questions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Failed to list questions", error);
    return NextResponse.json({ error: "Failed to list questions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const body = auth.body as any;
    const existing = await getDocs(collection(db, "questions"));
    const nextOrder = existing.size + 1;
    const normalizedChoices = normalizeChoices(body.choices);
    const normalizedCorrectAnswer = normalizeCorrectAnswer(body.correctAnswer);

    const docRef = await addDoc(collection(db, "questions"), {
      questionType: body.questionType ?? "",
      prompt: body.prompt ?? "",
      choices: normalizedChoices,
      correctAnswer: normalizedCorrectAnswer,
      explanation: body.explanation ?? "",
      difficulty: body.difficulty ?? "easy",
      order: typeof body.order === "number" ? body.order : nextOrder,
      createdBy: body.createdBy ?? "admin",
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error("Failed to create question", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}

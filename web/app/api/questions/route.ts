import { NextRequest, NextResponse } from "next/server";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/server";

export async function GET(request: NextRequest) {
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
  try {
    const body = await request.json();
    const existing = await getDocs(collection(db, "questions"));
    const nextOrder = existing.size + 1;

    const docRef = await addDoc(collection(db, "questions"), {
      questionType: body.questionType ?? "",
      prompt: body.prompt ?? "",
      choices: body.choices ?? [],
      correctAnswer: body.correctAnswer ?? "",
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

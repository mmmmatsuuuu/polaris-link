import { NextRequest, NextResponse } from "next/server";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/server";

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
    await updateDoc(docRef, {
      questionType: body.questionType,
      prompt: body.prompt,
      choices: body.choices,
      correctAnswer: body.correctAnswer,
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

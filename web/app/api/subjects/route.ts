import { NextResponse } from "next/server";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/server";

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "subjects"));
    const subjects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Failed to list subjects", error);
    return NextResponse.json(
      { error: "Failed to list subjects" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const existing = await getDocs(collection(db, "subjects"));
    const nextOrder = existing.size + 1;
    const docRef = await addDoc(collection(db, "subjects"), {
      name: body.name ?? "",
      description: body.description ?? "",
      publishStatus: body.publishStatus ?? "private",
      order: nextOrder,
      createdBy: body.createdBy ?? "admin",
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error("Failed to create subject", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 },
    );
  }
}

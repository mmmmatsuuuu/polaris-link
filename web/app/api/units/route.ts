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
    const snapshot = await getDocs(collection(db, "units"));
    const units = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ units });
  } catch (error) {
    console.error("Failed to list units", error);
    return NextResponse.json({ error: "Failed to list units" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const existing = await getDocs(collection(db, "units"));
    const nextOrder = existing.size + 1;

    const docRef = await addDoc(collection(db, "units"), {
      name: body.name ?? "",
      description: body.description ?? "",
      subjectId: body.subjectId ?? "",
      publishStatus: body.publishStatus ?? "private",
      order: nextOrder,
      createdBy: body.createdBy ?? "admin",
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error("Failed to create unit", error);
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { authorizeRequest } from "@/app/api/_utils/authorizeRequest";
import { db } from "@/lib/firebase/server";

export async function GET(request: Request) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin", "student"] });
  if ("error" in auth) return auth.error;

  try {
    const snapshot = await getDocs(collection(db, "lessons"));
    const lessons = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ lessons });
  } catch (error) {
    console.error("Failed to list lessons", error);
    return NextResponse.json({ error: "Failed to list lessons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const body = auth.body as any;
    const existing = await getDocs(collection(db, "lessons"));
    const nextOrder = existing.size + 1;

    const docRef = await addDoc(collection(db, "lessons"), {
      title: body.title ?? "",
      description: body.description ?? "",
      unitId: body.unitId ?? "",
      contentIds: Array.isArray(body.contentIds) ? body.contentIds : [],
      publishStatus: body.publishStatus ?? "private",
      tags: Array.isArray(body.tags) ? body.tags : [],
      order: nextOrder,
      createdBy: body.createdBy ?? "admin",
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error("Failed to create lesson", error);
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}

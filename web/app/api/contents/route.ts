import { NextResponse } from "next/server";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { authorizeRequest } from "@/app/api/_utils/authorizeRequest";
import { db } from "@/lib/firebase/server";

export async function GET(request: Request) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin", "student"] });
  if ("error" in auth) return auth.error;

  try {
    const snapshot = await getDocs(collection(db, "contents"));
    const contents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ contents });
  } catch (error) {
    console.error("Failed to list contents", error);
    return NextResponse.json({ error: "Failed to list contents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const body = auth.body as any;
    const existing = await getDocs(collection(db, "contents"));
    const nextOrder = existing.size + 1;

    const docRef = await addDoc(collection(db, "contents"), {
      title: body.title ?? "",
      description: body.description ?? "",
      type: body.type ?? "video",
      tags: Array.isArray(body.tags) ? body.tags : [],
      publishStatus: body.publishStatus ?? "private",
      order: nextOrder,
      metadata: body.metadata ?? {},
      createdBy: body.createdBy ?? "admin",
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error("Failed to create content", error);
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 });
  }
}

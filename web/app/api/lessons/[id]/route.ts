import { NextResponse } from "next/server";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { authorizeRequest } from "@/app/api/_utils/authorizeRequest";
import { db } from "@/lib/firebase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin", "student"] });
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    return await respondLessonDetail(id);
  } catch (error) {
    console.error("Failed to get lesson", error);
    return NextResponse.json({ error: "Failed to get lesson" }, { status: 500 });
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
    return await respondLessonDetail(id);
  } catch (error) {
    console.error("Failed to get lesson", error);
    return NextResponse.json({ error: "Failed to get lesson" }, { status: 500 });
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
    const docRef = doc(db, "lessons", id);
    await updateDoc(docRef, {
      title: body.title,
      description: body.description,
      unitId: body.unitId,
      contentIds: Array.isArray(body.contentIds) ? body.contentIds : [],
      publishStatus: body.publishStatus,
      tags: Array.isArray(body.tags) ? body.tags : [],
      order: body.order,
      updatedAt: serverTimestamp(),
    });
    return NextResponse.json({ id: id });
  } catch (error) {
    console.error("Failed to update lesson", error);
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
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
    const docRef = doc(db, "lessons", id);
    await deleteDoc(docRef);
    return NextResponse.json({ id: id });
  } catch (error) {
    console.error("Failed to delete lesson", error);
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 });
  }
}

async function respondLessonDetail(id: string) {
  const docRef = doc(db, "lessons", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
}

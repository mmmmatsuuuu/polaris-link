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
    return await respondContentDetail(id);
  } catch (error) {
    console.error("Failed to get content", error);
    return NextResponse.json({ error: "Failed to get content" }, { status: 500 });
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
    return await respondContentDetail(id);
  } catch (error) {
    console.error("Failed to get content", error);
    return NextResponse.json({ error: "Failed to get content" }, { status: 500 });
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
    const docRef = doc(db, "contents", id);
    await updateDoc(docRef, {
      title: body.title,
      description: body.description,
      type: body.type,
      tags: body.tags,
      publishStatus: body.publishStatus,
      order: body.order,
      metadata: body.metadata ?? {},
      updatedAt: serverTimestamp(),
    });
    return NextResponse.json({ id: id });
  } catch (error) {
    console.error("Failed to update content", error);
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
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
    const docRef = doc(db, "contents", id);
    await deleteDoc(docRef);
    return NextResponse.json({ id: id });
  } catch (error) {
    console.error("Failed to delete content", error);
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 });
  }
}

async function respondContentDetail(id: string) {
  const docRef = doc(db, "contents", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
}

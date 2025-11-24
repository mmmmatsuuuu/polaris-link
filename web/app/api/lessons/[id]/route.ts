import { NextResponse } from "next/server";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const docRef = doc(db, "lessons", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    console.error("Failed to get lesson", error);
    return NextResponse.json({ error: "Failed to get lesson" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const body = await request.json();
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
  _request: Request,
  { params }: { params: { id: string } },
) {
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

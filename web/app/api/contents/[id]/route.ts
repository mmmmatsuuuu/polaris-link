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
    const docRef = doc(db, "contents", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    console.error("Failed to get content", error);
    return NextResponse.json({ error: "Failed to get content" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const body = await request.json();
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
  _request: Request,
  { params }: { params: { id: string } },
) {
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

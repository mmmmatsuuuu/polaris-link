import { NextRequest, NextResponse } from "next/server";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const docRef = doc(db, "units", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    console.error("Failed to get unit", error);
    return NextResponse.json({ error: "Failed to get unit" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const docRef = doc(db, "units", id);
    await updateDoc(docRef, {
      name: body.name,
      description: body.description,
      subjectId: body.subjectId,
      publishStatus: body.publishStatus,
      order: body.order,
      updatedAt: serverTimestamp(),
    });
    return NextResponse.json({ id: id });
  } catch (error) {
    console.error("Failed to update unit", error);
    return NextResponse.json({ error: "Failed to update unit" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const docRef = doc(db, "units", id);
    await deleteDoc(docRef);
    return NextResponse.json({ id: id });
  } catch (error) {
    console.error("Failed to delete unit", error);
    return NextResponse.json({ error: "Failed to delete unit" }, { status: 500 });
  }
}

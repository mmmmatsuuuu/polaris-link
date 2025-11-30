import { NextRequest, NextResponse } from "next/server";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/server";
import { adminAuth } from "@/lib/firebase/admin";

type IncomingStudentPayload = {
  displayName?: unknown;
  email?: unknown;
  studentNumber?: unknown;
  notes?: unknown;
  lastLogin?: unknown;
};

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const snap = await getDoc(doc(db, "users", id));
    if (!snap.exists()) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ id: snap.id, ...snap.data() });
  } catch (error) {
    console.error("Failed to get student", error);
    return NextResponse.json(
      { error: "Failed to get student" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const snap = await getDoc(doc(db, "users", id));
    if (!snap.exists()) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 },
      );
    }

    const body = (await request.json()) as IncomingStudentPayload;
    const data = normalizeStudentPayload(body);

    await updateDoc(doc(db, "users", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id: id });
  } catch (error) {
    console.error("Failed to update student", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userDocRef = doc(db, "users", id);
    const snap = await getDoc(userDocRef);
    const data = snap.data() as { authId?: string } | undefined;

    await deleteDoc(userDocRef);
    const targetAuthId = data?.authId || id;
    await adminAuth.deleteUser(targetAuthId).catch((err) => {
      // Auth側に存在しなくてもFirestore削除は済んでいるのでエラーは握りつぶす
      console.warn("Auth delete skipped", err);
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Failed to delete student", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}

function normalizeStudentPayload(body: IncomingStudentPayload) {
  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : undefined;
  const email = typeof body.email === "string" ? body.email.trim() : undefined;
  const studentNumber = toStudentNumber(body.studentNumber);
  const notes = typeof body.notes === "string" ? body.notes : undefined;
  const lastLogin =
    typeof body.lastLogin === "string" && body.lastLogin
      ? body.lastLogin
      : undefined;

  return {
    ...(displayName !== undefined ? { displayName } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(studentNumber !== undefined ? { studentNumber } : {}),
    ...(notes !== undefined ? { notes } : {}),
    ...(lastLogin !== undefined ? { lastLogin } : {}),
  };
}

function toStudentNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed =
    typeof value === "string" && value.trim()
      ? Number.parseInt(value.trim(), 10)
      : NaN;
  if (Number.isFinite(parsed)) return parsed;
  return undefined;
}

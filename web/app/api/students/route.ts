import { NextResponse } from "next/server";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { authorizeRequest } from "@/app/api/_utils/authorizeRequest";
import { db } from "@/lib/firebase/server";

type IncomingStudentPayload = {
  displayName?: unknown;
  email?: unknown;
  studentNumber?: unknown;
  notes?: unknown;
  lastLogin?: unknown;
};

export async function GET(request: Request) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const snapshot = await getDocs(
      query(collection(db, "users"), where("role", "==", "student")),
    );
    const students = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ students });
  } catch (error) {
    console.error("Failed to list students", error);
    return NextResponse.json(
      { error: "Failed to list students" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const body = auth.body as IncomingStudentPayload;
    const data = normalizeStudentPayload(body);
    if (!data.email) {
      return NextResponse.json(
        { error: "email is required" },
        { status: 400 },
      );
    }

    const docRef = await addDoc(collection(db, "users"), {
      ...data,
      role: "student",
      authId: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: data.lastLogin ?? serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error("Failed to create student", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}

function normalizeStudentPayload(body: IncomingStudentPayload) {
  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const studentNumber = toStudentNumber(body.studentNumber);
  const notes = typeof body.notes === "string" ? body.notes : "";
  const lastLogin =
    typeof body.lastLogin === "string" && body.lastLogin
      ? body.lastLogin
      : undefined;

  return { displayName, email, studentNumber, notes, lastLogin };
}

function toStudentNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed =
    typeof value === "string" && value.trim()
      ? Number.parseInt(value.trim(), 10)
      : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

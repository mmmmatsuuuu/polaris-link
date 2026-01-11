import { NextResponse } from "next/server";
import { collection, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { authorizeRequest } from "@/app/api/_utils/authorizeRequest";
import { db } from "@/lib/firebase/server";

type StudentBulkItem = {
  displayName?: unknown;
  email?: unknown;
  studentNumber?: unknown;
  notes?: unknown;
};

type StudentBulkPayload = {
  students?: unknown;
  userId?: unknown;
};

type ValidationError = {
  index: number;
  field: string;
  code: "required" | "invalid" | "duplicate" | "limit_exceeded";
  message: string;
};

const MAX_ITEMS = 300;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const auth = await authorizeRequest<StudentBulkPayload>(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const { body, user } = auth;
    if (!body || typeof body !== "object" || !("students" in body)) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            { index: 0, field: "students", code: "required", message: "students is required" },
          ],
        },
        { status: 400 },
      );
    }

    const studentsValue = (body as StudentBulkPayload).students;
    if (!Array.isArray(studentsValue)) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            { index: 0, field: "students", code: "invalid", message: "students must be an array" },
          ],
        },
        { status: 400 },
      );
    }

    if (studentsValue.length > MAX_ITEMS) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            {
              index: 0,
              field: "students",
              code: "limit_exceeded",
              message: `students must be <= ${MAX_ITEMS}`,
            },
          ],
        },
        { status: 400 },
      );
    }

    const existingSnap = await getDocs(collection(db, "users"));
    const existingEmails = new Set<string>();
    existingSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (typeof data.email === "string") {
        existingEmails.add(data.email.trim().toLowerCase());
      }
    });

    const errors: ValidationError[] = [];
    const seenEmails = new Set<string>();

    const normalized = studentsValue.map((raw, index) => {
      if (typeof raw !== "object" || raw === null) {
        errors.push({
          index,
          field: "students",
          code: "invalid",
          message: "student must be an object",
        });
        return { email: "" };
      }

      const item = raw as StudentBulkItem;
      const email = typeof item.email === "string" ? item.email.trim().toLowerCase() : "";
      if (!email) {
        errors.push({
          index,
          field: "email",
          code: "required",
          message: "email is required",
        });
      } else if (!isEmail(email)) {
        errors.push({
          index,
          field: "email",
          code: "invalid",
          message: "email is invalid",
        });
      } else if (seenEmails.has(email) || existingEmails.has(email)) {
        errors.push({
          index,
          field: "email",
          code: "duplicate",
          message: "email is duplicated",
        });
      } else {
        seenEmails.add(email);
      }

      const displayName = typeof item.displayName === "string" ? item.displayName.trim() : "";
      const studentNumber =
        typeof item.studentNumber === "number" && Number.isFinite(item.studentNumber)
          ? item.studentNumber
          : undefined;
      const notes = typeof item.notes === "string" ? item.notes : undefined;

      return { displayName, email, studentNumber, notes };
    });

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: errors,
        },
        { status: 400 },
      );
    }

    const batch = writeBatch(db);
    const now = serverTimestamp();

    normalized.forEach((item) => {
      const docRef = doc(collection(db, "users"));
      batch.set(docRef, {
        role: "student",
        displayName: item.displayName ?? "",
        email: item.email,
        studentNumber: item.studentNumber ?? 0,
        notes: item.notes ?? "",
        authId: "",
        createdAt: now,
        updatedAt: now,
        lastLogin: now,
        createdBy: user.id,
      });
    });

    await batch.commit();
    return NextResponse.json({ status: "success", count: normalized.length });
  } catch (error) {
    console.error("Failed to bulk create students", error);
    return NextResponse.json(
      { error: "Failed to create students" },
      { status: 500 },
    );
  }
}

"use client";

export type StudentBulkItem = {
  displayName?: string;
  email: string;
  studentNumber?: number;
  notes?: string;
};

export type StudentBulkPayload = {
  students: StudentBulkItem[];
};

export type ValidationError = {
  index: number;
  field: string;
  code: "required" | "invalid" | "duplicate" | "limit_exceeded";
  message: string;
};

const MAX_ITEMS = 300;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateStudentsPayload(payload: unknown): {
  data?: StudentBulkPayload;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];
  if (typeof payload !== "object" || payload === null || !("students" in payload)) {
    errors.push({
      index: 0,
      field: "students",
      code: "required",
      message: "students is required",
    });
    return { errors };
  }

  const studentsValue = (payload as { students: unknown }).students;
  if (!Array.isArray(studentsValue)) {
    errors.push({
      index: 0,
      field: "students",
      code: "invalid",
      message: "students must be an array",
    });
    return { errors };
  }

  if (studentsValue.length > MAX_ITEMS) {
    errors.push({
      index: 0,
      field: "students",
      code: "limit_exceeded",
      message: `students must be <= ${MAX_ITEMS}`,
    });
    return { errors };
  }

  const seenEmails = new Set<string>();
  const normalized: StudentBulkItem[] = studentsValue.map((raw, index) => {
    if (typeof raw !== "object" || raw === null) {
      errors.push({
        index,
        field: "students",
        code: "invalid",
        message: "student must be an object",
      });
      return { email: "" };
    }

    const item = raw as Record<string, unknown>;
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
    } else if (seenEmails.has(email)) {
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

  if (errors.length > 0) return { errors };
  return { data: { students: normalized }, errors };
}

"use client";

export type SubjectBulkItem = {
  name: string;
  description?: unknown;
  publishStatus?: "public" | "private";
  order?: number;
};

export type SubjectBulkPayload = {
  subjects: SubjectBulkItem[];
};

export type ValidationError = {
  index: number;
  field: string;
  code: "required" | "invalid" | "duplicate" | "limit_exceeded";
  message: string;
};

const MAX_ITEMS = 300;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRichTextDoc(value: unknown): boolean {
  return typeof value === "object" && value !== null && "type" in value;
}

function isPublishStatus(value: unknown): value is "public" | "private" {
  return value === "public" || value === "private";
}

export function validateSubjectsPayload(payload: unknown): {
  data?: SubjectBulkPayload;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];
  if (typeof payload !== "object" || payload === null || !("subjects" in payload)) {
    errors.push({
      index: 0,
      field: "subjects",
      code: "required",
      message: "subjects is required",
    });
    return { errors };
  }

  const subjectsValue = (payload as { subjects: unknown }).subjects;
  if (!Array.isArray(subjectsValue)) {
    errors.push({
      index: 0,
      field: "subjects",
      code: "invalid",
      message: "subjects must be an array",
    });
    return { errors };
  }

  if (subjectsValue.length > MAX_ITEMS) {
    errors.push({
      index: 0,
      field: "subjects",
      code: "limit_exceeded",
      message: `subjects must be <= ${MAX_ITEMS}`,
    });
    return { errors };
  }

  const names = new Set<string>();

  const normalized: SubjectBulkItem[] = subjectsValue.map((raw, index) => {
    if (typeof raw !== "object" || raw === null) {
      errors.push({
        index,
        field: "subjects",
        code: "invalid",
        message: "subject must be an object",
      });
      return { name: "" };
    }

    const item = raw as Record<string, unknown>;
    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (!name) {
      errors.push({
        index,
        field: "name",
        code: "required",
        message: "name is required",
      });
    } else if (names.has(name)) {
      errors.push({
        index,
        field: "name",
        code: "duplicate",
        message: "name is duplicated",
      });
    } else {
      names.add(name);
    }

    const description = item.description;
    if (typeof description !== "undefined" && !isRichTextDoc(description)) {
      errors.push({
        index,
        field: "description",
        code: "invalid",
        message: "description must be a TipTap doc",
      });
    }

    const publishStatus = item.publishStatus;
    if (typeof publishStatus !== "undefined" && !isPublishStatus(publishStatus)) {
      errors.push({
        index,
        field: "publishStatus",
        code: "invalid",
        message: "publishStatus must be public or private",
      });
    }

    const order = item.order;
    if (typeof order !== "undefined" && !(typeof order === "number" && order >= 1)) {
      errors.push({
        index,
        field: "order",
        code: "invalid",
        message: "order must be a number >= 1",
      });
    }

    return {
      name,
      description,
      publishStatus: publishStatus as "public" | "private" | undefined,
      order: typeof order === "number" ? order : undefined,
    };
  });

  if (errors.length > 0) return { errors };
  return { data: { subjects: normalized }, errors };
}

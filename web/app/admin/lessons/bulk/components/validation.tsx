"use client";

export type LessonBulkItem = {
  unitId: string;
  title: string;
  description?: unknown;
  contentIds?: string[];
  tags?: string[];
  publishStatus?: "public" | "private";
  order?: number;
};

export type LessonBulkPayload = {
  lessons: LessonBulkItem[];
};

export type ValidationError = {
  index: number;
  field: string;
  code: "required" | "invalid" | "duplicate" | "limit_exceeded";
  message: string;
};

const MAX_ITEMS = 300;

function isRichTextDoc(value: unknown): boolean {
  return typeof value === "object" && value !== null && "type" in value;
}

function isPublishStatus(value: unknown): value is "public" | "private" {
  return value === "public" || value === "private";
}

export function validateLessonsPayload(payload: unknown): {
  data?: LessonBulkPayload;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];
  if (typeof payload !== "object" || payload === null || !("lessons" in payload)) {
    errors.push({
      index: 0,
      field: "lessons",
      code: "required",
      message: "lessons is required",
    });
    return { errors };
  }

  const lessonsValue = (payload as { lessons: unknown }).lessons;
  if (!Array.isArray(lessonsValue)) {
    errors.push({
      index: 0,
      field: "lessons",
      code: "invalid",
      message: "lessons must be an array",
    });
    return { errors };
  }

  if (lessonsValue.length > MAX_ITEMS) {
    errors.push({
      index: 0,
      field: "lessons",
      code: "limit_exceeded",
      message: `lessons must be <= ${MAX_ITEMS}`,
    });
    return { errors };
  }

  const seenKeys = new Set<string>();

  const normalized: LessonBulkItem[] = lessonsValue.map((raw, index) => {
    if (typeof raw !== "object" || raw === null) {
      errors.push({
        index,
        field: "lessons",
        code: "invalid",
        message: "lesson must be an object",
      });
      return { unitId: "", title: "" };
    }

    const item = raw as Record<string, unknown>;
    const unitId = typeof item.unitId === "string" ? item.unitId.trim() : "";
    if (!unitId) {
      errors.push({
        index,
        field: "unitId",
        code: "required",
        message: "unitId is required",
      });
    }

    const title = typeof item.title === "string" ? item.title.trim() : "";
    if (!title) {
      errors.push({
        index,
        field: "title",
        code: "required",
        message: "title is required",
      });
    }

    if (unitId && title) {
      const key = `${unitId}::${title.toLowerCase()}`;
      if (seenKeys.has(key)) {
        errors.push({
          index,
          field: "title",
          code: "duplicate",
          message: "title is duplicated",
        });
      } else {
        seenKeys.add(key);
      }
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

    const contentIds = item.contentIds;
    if (typeof contentIds !== "undefined" && (!Array.isArray(contentIds) || contentIds.some((id) => typeof id !== "string"))) {
      errors.push({
        index,
        field: "contentIds",
        code: "invalid",
        message: "contentIds must be an array of strings",
      });
    }

    const tags = item.tags;
    if (typeof tags !== "undefined" && (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string"))) {
      errors.push({
        index,
        field: "tags",
        code: "invalid",
        message: "tags must be an array of strings",
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
      unitId,
      title,
      description,
      contentIds: Array.isArray(contentIds) ? (contentIds as string[]) : undefined,
      tags: Array.isArray(tags) ? (tags as string[]) : undefined,
      publishStatus: publishStatus as "public" | "private" | undefined,
      order: typeof order === "number" ? order : undefined,
    };
  });

  if (errors.length > 0) return { errors };
  return { data: { lessons: normalized }, errors };
}

"use client";

export type UnitBulkItem = {
  subjectId: string;
  name: string;
  description?: unknown;
  publishStatus?: "public" | "private";
  order?: number;
};

export type UnitBulkPayload = {
  units: UnitBulkItem[];
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

export function validateUnitsPayload(payload: unknown): {
  data?: UnitBulkPayload;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];
  if (typeof payload !== "object" || payload === null || !("units" in payload)) {
    errors.push({
      index: 0,
      field: "units",
      code: "required",
      message: "units is required",
    });
    return { errors };
  }

  const unitsValue = (payload as { units: unknown }).units;
  if (!Array.isArray(unitsValue)) {
    errors.push({
      index: 0,
      field: "units",
      code: "invalid",
      message: "units must be an array",
    });
    return { errors };
  }

  if (unitsValue.length > MAX_ITEMS) {
    errors.push({
      index: 0,
      field: "units",
      code: "limit_exceeded",
      message: `units must be <= ${MAX_ITEMS}`,
    });
    return { errors };
  }

  const seenKeys = new Set<string>();

  const normalized: UnitBulkItem[] = unitsValue.map((raw, index) => {
    if (typeof raw !== "object" || raw === null) {
      errors.push({
        index,
        field: "units",
        code: "invalid",
        message: "unit must be an object",
      });
      return { subjectId: "", name: "" };
    }

    const item = raw as Record<string, unknown>;
    const subjectId = typeof item.subjectId === "string" ? item.subjectId.trim() : "";
    if (!subjectId) {
      errors.push({
        index,
        field: "subjectId",
        code: "required",
        message: "subjectId is required",
      });
    }

    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (!name) {
      errors.push({
        index,
        field: "name",
        code: "required",
        message: "name is required",
      });
    }

    if (subjectId && name) {
      const key = `${subjectId}::${name.toLowerCase()}`;
      if (seenKeys.has(key)) {
        errors.push({
          index,
          field: "name",
          code: "duplicate",
          message: "name is duplicated",
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
      subjectId,
      name,
      description,
      publishStatus: publishStatus as "public" | "private" | undefined,
      order: typeof order === "number" ? order : undefined,
    };
  });

  if (errors.length > 0) return { errors };
  return { data: { units: normalized }, errors };
}

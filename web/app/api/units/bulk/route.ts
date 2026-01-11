import { NextResponse } from "next/server";
import { collection, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { authorizeRequest } from "@/app/api/_utils/authorizeRequest";
import { db } from "@/lib/firebase/server";

type UnitBulkItem = {
  subjectId?: unknown;
  name?: unknown;
  description?: unknown;
  publishStatus?: unknown;
  order?: unknown;
};

type UnitBulkPayload = {
  units?: unknown;
  userId?: unknown;
};

type ValidationError = {
  index: number;
  field: string;
  code: "required" | "invalid" | "duplicate" | "limit_exceeded";
  message: string;
};

const MAX_ITEMS = 300;
const emptyDoc = { type: "doc", content: [] as unknown[] };

function isRichTextDoc(value: unknown): boolean {
  return typeof value === "object" && value !== null && "type" in value;
}

function isPublishStatus(value: unknown): value is "public" | "private" {
  return value === "public" || value === "private";
}

function normalizeKey(subjectId: string, name: string) {
  return `${subjectId}::${name.trim().toLowerCase()}`;
}

export async function POST(request: Request) {
  const auth = await authorizeRequest<UnitBulkPayload>(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const { body, user } = auth;
    if (!body || typeof body !== "object" || !("units" in body)) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            { index: 0, field: "units", code: "required", message: "units is required" },
          ],
        },
        { status: 400 },
      );
    }

    const unitsValue = (body as UnitBulkPayload).units;
    if (!Array.isArray(unitsValue)) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            { index: 0, field: "units", code: "invalid", message: "units must be an array" },
          ],
        },
        { status: 400 },
      );
    }

    if (unitsValue.length > MAX_ITEMS) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            {
              index: 0,
              field: "units",
              code: "limit_exceeded",
              message: `units must be <= ${MAX_ITEMS}`,
            },
          ],
        },
        { status: 400 },
      );
    }

    const [subjectsSnap, unitsSnap] = await Promise.all([
      getDocs(collection(db, "subjects")),
      getDocs(collection(db, "units")),
    ]);

    const subjectIds = new Set<string>();
    subjectsSnap.forEach((docSnap) => subjectIds.add(docSnap.id));

    const existingKeys = new Set<string>();
    const maxOrderBySubject = new Map<string, number>();
    unitsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const subjectId = typeof data.subjectId === "string" ? data.subjectId : "";
      const name = typeof data.name === "string" ? data.name : "";
      if (subjectId && name) {
        existingKeys.add(normalizeKey(subjectId, name));
      }
      if (subjectId) {
        const order = typeof data.order === "number" ? data.order : 0;
        const current = maxOrderBySubject.get(subjectId) ?? 0;
        if (order > current) maxOrderBySubject.set(subjectId, order);
      }
    });

    const errors: ValidationError[] = [];
    const seenKeys = new Set<string>();

    const normalized = unitsValue.map((raw, index) => {
      if (typeof raw !== "object" || raw === null) {
        errors.push({
          index,
          field: "units",
          code: "invalid",
          message: "unit must be an object",
        });
        return { subjectId: "", name: "" };
      }

      const item = raw as UnitBulkItem;
      const subjectId = typeof item.subjectId === "string" ? item.subjectId.trim() : "";
      if (!subjectId) {
        errors.push({
          index,
          field: "subjectId",
          code: "required",
          message: "subjectId is required",
        });
      } else if (!subjectIds.has(subjectId)) {
        errors.push({
          index,
          field: "subjectId",
          code: "invalid",
          message: "subjectId does not exist",
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
        const key = normalizeKey(subjectId, name);
        if (seenKeys.has(key) || existingKeys.has(key)) {
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
    const nextOrderBySubject = new Map(maxOrderBySubject);

    normalized.forEach((item) => {
      const docRef = doc(collection(db, "units"));
      const current = nextOrderBySubject.get(item.subjectId) ?? 0;
      const order = typeof item.order === "number" ? item.order : current + 1;
      if (typeof item.order !== "number") {
        nextOrderBySubject.set(item.subjectId, order);
      }
      batch.set(docRef, {
        subjectId: item.subjectId,
        name: item.name,
        description: item.description ?? emptyDoc,
        publishStatus: item.publishStatus ?? "private",
        order,
        createdBy: user.id,
        updatedAt: now,
      });
    });

    await batch.commit();

    return NextResponse.json({ status: "success", count: normalized.length });
  } catch (error) {
    console.error("Failed to bulk create units", error);
    return NextResponse.json(
      { error: "Failed to create units" },
      { status: 500 },
    );
  }
}

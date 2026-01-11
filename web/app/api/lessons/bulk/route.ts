import { NextResponse } from "next/server";
import { collection, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { authorizeRequest } from "@/app/api/_utils/authorizeRequest";
import { db } from "@/lib/firebase/server";

type LessonBulkItem = {
  unitId?: unknown;
  title?: unknown;
  description?: unknown;
  contentIds?: unknown;
  tags?: unknown;
  publishStatus?: unknown;
  order?: unknown;
};

type LessonBulkPayload = {
  lessons?: unknown;
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

function normalizeKey(unitId: string, title: string) {
  return `${unitId}::${title.trim().toLowerCase()}`;
}

export async function POST(request: Request) {
  const auth = await authorizeRequest<LessonBulkPayload>(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const { body, user } = auth;
    if (!body || typeof body !== "object" || !("lessons" in body)) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            { index: 0, field: "lessons", code: "required", message: "lessons is required" },
          ],
        },
        { status: 400 },
      );
    }

    const lessonsValue = (body as LessonBulkPayload).lessons;
    if (!Array.isArray(lessonsValue)) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            { index: 0, field: "lessons", code: "invalid", message: "lessons must be an array" },
          ],
        },
        { status: 400 },
      );
    }

    if (lessonsValue.length > MAX_ITEMS) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            {
              index: 0,
              field: "lessons",
              code: "limit_exceeded",
              message: `lessons must be <= ${MAX_ITEMS}`,
            },
          ],
        },
        { status: 400 },
      );
    }

    const [unitsSnap, lessonsSnap, contentsSnap] = await Promise.all([
      getDocs(collection(db, "units")),
      getDocs(collection(db, "lessons")),
      getDocs(collection(db, "contents")),
    ]);

    const unitIds = new Set<string>();
    unitsSnap.forEach((docSnap) => unitIds.add(docSnap.id));

    const contentIds = new Set<string>();
    contentsSnap.forEach((docSnap) => contentIds.add(docSnap.id));

    const existingKeys = new Set<string>();
    const maxOrderByUnit = new Map<string, number>();
    lessonsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const unitId = typeof data.unitId === "string" ? data.unitId : "";
      const title = typeof data.title === "string" ? data.title : "";
      if (unitId && title) {
        existingKeys.add(normalizeKey(unitId, title));
      }
      if (unitId) {
        const order = typeof data.order === "number" ? data.order : 0;
        const current = maxOrderByUnit.get(unitId) ?? 0;
        if (order > current) maxOrderByUnit.set(unitId, order);
      }
    });

    const errors: ValidationError[] = [];
    const seenKeys = new Set<string>();

    const normalized = lessonsValue.map((raw, index) => {
      if (typeof raw !== "object" || raw === null) {
        errors.push({
          index,
          field: "lessons",
          code: "invalid",
          message: "lesson must be an object",
        });
        return { unitId: "", title: "" };
      }

      const item = raw as LessonBulkItem;
      const unitId = typeof item.unitId === "string" ? item.unitId.trim() : "";
      if (!unitId) {
        errors.push({
          index,
          field: "unitId",
          code: "required",
          message: "unitId is required",
        });
      } else if (!unitIds.has(unitId)) {
        errors.push({
          index,
          field: "unitId",
          code: "invalid",
          message: "unitId does not exist",
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
        const key = normalizeKey(unitId, title);
        if (seenKeys.has(key) || existingKeys.has(key)) {
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

      const contentIdsValue = item.contentIds;
      if (typeof contentIdsValue !== "undefined") {
        if (!Array.isArray(contentIdsValue) || contentIdsValue.some((id) => typeof id !== "string")) {
          errors.push({
            index,
            field: "contentIds",
            code: "invalid",
            message: "contentIds must be an array of strings",
          });
        } else {
          contentIdsValue.forEach((id) => {
            if (!contentIds.has(id)) {
              errors.push({
                index,
                field: "contentIds",
                code: "invalid",
                message: "contentIds contains unknown id",
              });
            }
          });
        }
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
        contentIds: Array.isArray(contentIdsValue) ? (contentIdsValue as string[]) : undefined,
        tags: Array.isArray(tags) ? (tags as string[]) : undefined,
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
    const nextOrderByUnit = new Map(maxOrderByUnit);

    normalized.forEach((item) => {
      const docRef = doc(collection(db, "lessons"));
      const current = nextOrderByUnit.get(item.unitId) ?? 0;
      const order = typeof item.order === "number" ? item.order : current + 1;
      if (typeof item.order !== "number") {
        nextOrderByUnit.set(item.unitId, order);
      }
      batch.set(docRef, {
        unitId: item.unitId,
        title: item.title,
        description: item.description ?? emptyDoc,
        contentIds: item.contentIds ?? [],
        tags: item.tags ?? [],
        publishStatus: item.publishStatus ?? "private",
        order,
        createdBy: user.id,
        updatedAt: now,
      });
    });

    await batch.commit();
    return NextResponse.json({ status: "success", count: normalized.length });
  } catch (error) {
    console.error("Failed to bulk create lessons", error);
    return NextResponse.json(
      { error: "Failed to create lessons" },
      { status: 500 },
    );
  }
}

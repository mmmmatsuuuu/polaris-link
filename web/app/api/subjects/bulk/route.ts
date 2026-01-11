import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { collection, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { authorizeRequest } from "@/app/api/_utils/authorizeRequest";
import { db } from "@/lib/firebase/server";

type SubjectBulkItem = {
  name?: unknown;
  description?: unknown;
  publishStatus?: unknown;
  order?: unknown;
};

type SubjectBulkPayload = {
  subjects?: unknown;
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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRichTextDoc(value: unknown): boolean {
  return typeof value === "object" && value !== null && "type" in value;
}

function isPublishStatus(value: unknown): value is "public" | "private" {
  return value === "public" || value === "private";
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

export async function POST(request: Request) {
  const auth = await authorizeRequest<SubjectBulkPayload>(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const { body, user } = auth;
    const errors: ValidationError[] = [];

    if (!body || typeof body !== "object" || !("subjects" in body)) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            {
              index: 0,
              field: "subjects",
              code: "required",
              message: "subjects is required",
            },
          ],
        },
        { status: 400 },
      );
    }

    const subjectsValue = (body as SubjectBulkPayload).subjects;
    if (!Array.isArray(subjectsValue)) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            {
              index: 0,
              field: "subjects",
              code: "invalid",
              message: "subjects must be an array",
            },
          ],
        },
        { status: 400 },
      );
    }

    if (subjectsValue.length > MAX_ITEMS) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            {
              index: 0,
              field: "subjects",
              code: "limit_exceeded",
              message: `subjects must be <= ${MAX_ITEMS}`,
            },
          ],
        },
        { status: 400 },
      );
    }

    const existingSnap = await getDocs(collection(db, "subjects"));
    const existingNames = new Set<string>();
    existingSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (typeof data.name === "string") {
        existingNames.add(normalizeName(data.name));
      }
    });

    const seenNames = new Set<string>();
    const normalized = subjectsValue.map((raw, index) => {
      if (typeof raw !== "object" || raw === null) {
        errors.push({
          index,
          field: "subjects",
          code: "invalid",
          message: "subject must be an object",
        });
        return { name: "" };
      }

      const item = raw as SubjectBulkItem;
      const name = isNonEmptyString(item.name) ? item.name.trim() : "";
      if (!name) {
        errors.push({
          index,
          field: "name",
          code: "required",
          message: "name is required",
        });
      } else {
        const normalizedName = normalizeName(name);
        if (seenNames.has(normalizedName) || existingNames.has(normalizedName)) {
          errors.push({
            index,
            field: "name",
            code: "duplicate",
            message: "name is duplicated",
          });
        } else {
          seenNames.add(normalizedName);
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

    let nextOrder = existingSnap.size + 1;
    const batch = writeBatch(db);
    const now = serverTimestamp();

    normalized.forEach((item) => {
      const docRef = doc(collection(db, "subjects"));
      const order = typeof item.order === "number" ? item.order : nextOrder++;
      batch.set(docRef, {
        name: item.name,
        description: item.description ?? emptyDoc,
        publishStatus: item.publishStatus ?? "private",
        order,
        createdBy: user.id,
        updatedAt: now,
      });
    });

    await batch.commit();
    revalidatePath("/lessons");

    return NextResponse.json({ status: "success", count: normalized.length });
  } catch (error) {
    console.error("Failed to bulk create subjects", error);
    return NextResponse.json(
      { error: "Failed to create subjects" },
      { status: 500 },
    );
  }
}

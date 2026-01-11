import { NextResponse } from "next/server";
import { collection, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { authorizeRequest } from "@/app/api/_utils/authorizeRequest";
import { db } from "@/lib/firebase/server";

type ContentBulkItem = {
  type?: unknown;
  title?: unknown;
  description?: unknown;
  tags?: unknown;
  publishStatus?: unknown;
  order?: unknown;
  metadata?: unknown;
};

type ContentBulkPayload = {
  contents?: unknown;
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

function isContentType(value: unknown): value is "video" | "quiz" | "link" {
  return value === "video" || value === "quiz" || value === "link";
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const auth = await authorizeRequest<ContentBulkPayload>(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const { body, user } = auth;
    if (!body || typeof body !== "object" || !("contents" in body)) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            { index: 0, field: "contents", code: "required", message: "contents is required" },
          ],
        },
        { status: 400 },
      );
    }

    const contentsValue = (body as ContentBulkPayload).contents;
    if (!Array.isArray(contentsValue)) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            { index: 0, field: "contents", code: "invalid", message: "contents must be an array" },
          ],
        },
        { status: 400 },
      );
    }

    if (contentsValue.length > MAX_ITEMS) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            {
              index: 0,
              field: "contents",
              code: "limit_exceeded",
              message: `contents must be <= ${MAX_ITEMS}`,
            },
          ],
        },
        { status: 400 },
      );
    }

    const contentsSnap = await getDocs(collection(db, "contents"));
    const existingTitles = new Set<string>();
    contentsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (typeof data.title === "string") {
        existingTitles.add(data.title.trim().toLowerCase());
      }
    });

    const errors: ValidationError[] = [];
    const seenTitles = new Set<string>();

    const normalized = contentsValue.map((raw, index) => {
      if (typeof raw !== "object" || raw === null) {
        errors.push({
          index,
          field: "contents",
          code: "invalid",
          message: "content must be an object",
        });
        return { type: "video", title: "", metadata: { type: "video", youtubeVideoId: "", durationSec: 0 } };
      }

      const item = raw as ContentBulkItem;
      const type = item.type;
      if (!isContentType(type)) {
        errors.push({
          index,
          field: "type",
          code: "required",
          message: "type is required",
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
      } else {
        const key = title.toLowerCase();
        if (seenTitles.has(key) || existingTitles.has(key)) {
          errors.push({
            index,
            field: "title",
            code: "duplicate",
            message: "title is duplicated",
          });
        } else {
          seenTitles.add(key);
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

      const metadata = item.metadata as Record<string, unknown> | undefined;
      if (!metadata || typeof metadata !== "object") {
        errors.push({
          index,
          field: "metadata",
          code: "required",
          message: "metadata is required",
        });
      }

      if (type === "video") {
        const youtubeVideoId = typeof metadata?.youtubeVideoId === "string" ? metadata.youtubeVideoId.trim() : "";
        const durationSec = typeof metadata?.durationSec === "number" ? metadata.durationSec : 0;
        if (!youtubeVideoId) {
          errors.push({
            index,
            field: "metadata.youtubeVideoId",
            code: "required",
            message: "metadata.youtubeVideoId is required",
          });
        }
        if (!(durationSec > 0)) {
          errors.push({
            index,
            field: "metadata.durationSec",
            code: "invalid",
            message: "metadata.durationSec must be > 0",
          });
        }
        return {
          type: "video",
          title,
          description,
          tags: Array.isArray(tags) ? (tags as string[]) : undefined,
          publishStatus: publishStatus as "public" | "private" | undefined,
          order: typeof order === "number" ? order : undefined,
          metadata: { type: "video", youtubeVideoId, durationSec },
        };
      }

      if (type === "quiz") {
        const questionIds = Array.isArray(metadata?.questionIds)
          ? metadata.questionIds.filter((id): id is string => typeof id === "string")
          : [];
        const questionsPerAttempt = typeof metadata?.questionsPerAttempt === "number" ? metadata.questionsPerAttempt : 0;
        const allowRetry = typeof metadata?.allowRetry === "boolean" ? metadata.allowRetry : false;
        const timeLimitSec = typeof metadata?.timeLimitSec === "number" ? metadata.timeLimitSec : undefined;
        if (!(questionsPerAttempt > 0)) {
          errors.push({
            index,
            field: "metadata.questionsPerAttempt",
            code: "invalid",
            message: "metadata.questionsPerAttempt must be > 0",
          });
        }
        if (typeof metadata?.allowRetry !== "boolean") {
          errors.push({
            index,
            field: "metadata.allowRetry",
            code: "required",
            message: "metadata.allowRetry is required",
          });
        }
        if (typeof timeLimitSec !== "undefined" && !(timeLimitSec > 0)) {
          errors.push({
            index,
            field: "metadata.timeLimitSec",
            code: "invalid",
            message: "metadata.timeLimitSec must be > 0",
          });
        }
        return {
          type: "quiz",
          title,
          description,
          tags: Array.isArray(tags) ? (tags as string[]) : undefined,
          publishStatus: publishStatus as "public" | "private" | undefined,
          order: typeof order === "number" ? order : undefined,
          metadata: {
            type: "quiz",
            questionIds,
            questionsPerAttempt,
            allowRetry,
            ...(typeof timeLimitSec === "number" ? { timeLimitSec } : {}),
          },
        };
      }

      const url = typeof metadata?.url === "string" ? metadata.url.trim() : "";
      if (!url) {
        errors.push({
          index,
          field: "metadata.url",
          code: "required",
          message: "metadata.url is required",
        });
      } else if (!isValidUrl(url)) {
        errors.push({
          index,
          field: "metadata.url",
          code: "invalid",
          message: "metadata.url must be a valid URL",
        });
      }
      return {
        type: "link",
        title,
        description,
        tags: Array.isArray(tags) ? (tags as string[]) : undefined,
        publishStatus: publishStatus as "public" | "private" | undefined,
        order: typeof order === "number" ? order : undefined,
        metadata: { type: "link", url },
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

    normalized.forEach((item) => {
      const docRef = doc(collection(db, "contents"));
      const order = typeof item.order === "number" ? item.order : contentsSnap.size + 1;
      batch.set(docRef, {
        type: item.type,
        title: item.title,
        description: item.description ?? emptyDoc,
        tags: item.tags ?? [],
        publishStatus: item.publishStatus ?? "private",
        order,
        metadata: item.metadata,
        createdBy: user.id,
        updatedAt: now,
      });
    });

    await batch.commit();
    return NextResponse.json({ status: "success", count: normalized.length });
  } catch (error) {
    console.error("Failed to bulk create contents", error);
    return NextResponse.json(
      { error: "Failed to create contents" },
      { status: 500 },
    );
  }
}

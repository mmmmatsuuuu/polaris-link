import { NextResponse } from "next/server";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const collections = normalizePayload(body);

    if (collections.length === 0) {
      return NextResponse.json(
        {
          error:
            "Invalid payload. Provide { collectionName: [{ id: string, ... }] } or an array of documents.",
        },
        { status: 400 },
      );
    }

    const results: string[] = [];

    for (const { path, documents } of collections) {
      const pathSegments = path
        .split("/")
        .map((segment) => segment.trim())
        .filter(Boolean);

      if (pathSegments.length === 0 || pathSegments.length % 2 === 0) {
        throw new Error(
          `Invalid collection path "${path}". Provide a collection path like "lessons" or "subjects/subjectA/units".`,
        );
      }

      // @ts-expect-error Firestore SDK 型の汎用引数を省略しているため
      const collectionRef = collection(db, ...pathSegments);
      for (const { id, data } of documents) {
        if (!id) continue;
        const docRef = doc(collectionRef, id);
        await setDoc(docRef, data);
        results.push(`${path}/${id}`);
      }
    }

    return NextResponse.json({ imported: results });
  } catch (error) {
    console.error("Mock import failed", error);
    return NextResponse.json(
      { error: "Failed to import lessons", detail: (error as Error).message },
      { status: 500 },
    );
  }
}

type RawPayload = Record<string, unknown>;
type NormalizedCollection = {
  path: string;
  documents: Array<{ id: string; data: Record<string, unknown> }>;
};

function normalizePayload(body: unknown): NormalizedCollection[] {
  let payload: RawPayload | unknown = body;

  if (Array.isArray(body)) {
    payload = { lessons: body };
  }

  if (!isPlainObject(payload)) {
    return [];
  }

  const collections: NormalizedCollection[] = [];

  for (const [path, value] of Object.entries(payload)) {
    if (!value) continue;

    const documents = toDocumentsArray(value);
    if (!documents.length) continue;

    collections.push({ path, documents });
  }

  return collections;
}

function toDocumentsArray(
  value: unknown,
): Array<{ id: string; data: Record<string, unknown> }> {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (!isPlainObject(item)) {
          throw new Error(`Document at index ${index} is not an object.`);
        }
        const docId = extractId(item);
        if (!docId) {
          throw new Error(`Document at index ${index} is missing an "id" field.`);
        }
        return { id: docId, data: item };
      })
      .filter(({ id }) => Boolean(id));
  }

  if (isPlainObject(value)) {
    return Object.entries(value).map(([key, docValue]) => {
      if (!isPlainObject(docValue)) {
        throw new Error(`Document "${key}" is not an object.`);
      }
      const docId = extractId(docValue) ?? key;
      if (!docId) {
        throw new Error(`Document "${key}" is missing an id.`);
      }
      return { id: docId, data: docValue };
    });
  }

  return [];
}

function extractId(data: Record<string, unknown>): string | null {
  const idCandidate = data.id ?? data.docId;
  if (typeof idCandidate === "string" && idCandidate.trim()) {
    return idCandidate.trim();
  }
  return null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

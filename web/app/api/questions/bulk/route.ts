import { NextResponse } from "next/server";
import { collection, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { authorizeRequest } from "@/app/api/_utils/authorizeRequest";
import { db } from "@/lib/firebase/server";

type QuestionBulkItem = {
  questionType?: unknown;
  prompt?: unknown;
  choices?: unknown;
  correctAnswer?: unknown;
  explanation?: unknown;
  difficulty?: unknown;
  tags?: unknown;
  order?: unknown;
};

type QuestionBulkPayload = {
  questions?: unknown;
  userId?: unknown;
};

type ValidationError = {
  index: number;
  field: string;
  code: "required" | "invalid" | "duplicate" | "limit_exceeded";
  message: string;
};

const MAX_ITEMS = 300;

function isQuestionType(value: unknown): value is "multipleChoice" | "ordering" | "shortAnswer" {
  return value === "multipleChoice" || value === "ordering" || value === "shortAnswer";
}

function isDifficulty(value: unknown): value is "easy" | "medium" | "hard" {
  return value === "easy" || value === "medium" || value === "hard";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRichTextDoc(value: unknown): boolean {
  return typeof value === "object" && value !== null && "type" in value;
}

function docToPlain(value: unknown): string {
  try {
    const content = (value as { content?: unknown[] })?.content;
    if (Array.isArray(content)) {
      const texts: string[] = [];
      const walk = (nodes: unknown[]) => {
        nodes.forEach((node) => {
          const typed = node as { type?: string; text?: string; content?: unknown[] };
          if (typed?.type === "text" && typeof typed.text === "string") texts.push(typed.text);
          if (Array.isArray(typed?.content)) walk(typed.content);
        });
      };
      walk(content);
      if (texts.length) return texts.join(" ");
    }
  } catch {
    /* noop */
  }
  return "";
}

function hasPromptContent(value: unknown): boolean {
  if (isNonEmptyString(value)) return true;
  if (isRichTextDoc(value)) return docToPlain(value).trim().length > 0;
  return false;
}

function toDoc(value: unknown) {
  if (value && typeof value === "object" && "type" in (value as any)) return value;
  if (typeof value === "string") {
    return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: value }] }] };
  }
  return { type: "doc", content: [] };
}

function normalizeChoices(value: unknown): { key: string; label: unknown }[] {
  if (!Array.isArray(value)) return [];
  const result: { key: string; label: unknown }[] = [];
  value.forEach((choice, index) => {
    if (typeof choice === "object" && choice !== null && "key" in choice && "label" in choice) {
      const key = typeof (choice as any).key === "string" ? (choice as any).key.trim() : "";
      if (!key) return;
      result.push({ key, label: toDoc((choice as any).label) });
      return;
    }
    if (typeof choice === "string") {
      const label = choice.trim();
      if (!label) return;
      result.push({ key: `choice-${index + 1}`, label: toDoc(label) });
      return;
    }
  });
  return result;
}

function normalizeCorrectAnswer(value: unknown): string | string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") return value.trim();
  return "";
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

function promptKey(questionType: string, prompt: unknown) {
  try {
    return `${questionType}::${JSON.stringify(prompt)}`;
  } catch {
    return `${questionType}::`;
  }
}

export async function POST(request: Request) {
  const auth = await authorizeRequest<QuestionBulkPayload>(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const { body, user } = auth;
    if (!body || typeof body !== "object" || !("questions" in body)) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            { index: 0, field: "questions", code: "required", message: "questions is required" },
          ],
        },
        { status: 400 },
      );
    }

    const questionsValue = (body as QuestionBulkPayload).questions;
    if (!Array.isArray(questionsValue)) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            { index: 0, field: "questions", code: "invalid", message: "questions must be an array" },
          ],
        },
        { status: 400 },
      );
    }

    if (questionsValue.length > MAX_ITEMS) {
      return NextResponse.json(
        {
          error: "validation_failed",
          message: "Invalid payload",
          details: [
            {
              index: 0,
              field: "questions",
              code: "limit_exceeded",
              message: `questions must be <= ${MAX_ITEMS}`,
            },
          ],
        },
        { status: 400 },
      );
    }

    const existingSnap = await getDocs(collection(db, "questions"));
    const existingKeys = new Set<string>();
    existingSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (typeof data.questionType === "string" && data.prompt) {
        existingKeys.add(promptKey(data.questionType, data.prompt));
      }
    });

    const errors: ValidationError[] = [];
    const seenKeys = new Set<string>();

    const normalized = questionsValue.map((raw, index) => {
      if (typeof raw !== "object" || raw === null) {
        errors.push({
          index,
          field: "questions",
          code: "invalid",
          message: "question must be an object",
        });
        return { questionType: "multipleChoice", prompt: "" };
      }

      const item = raw as QuestionBulkItem;
      const questionType = item.questionType;
      if (!isQuestionType(questionType)) {
        errors.push({
          index,
          field: "questionType",
          code: "required",
          message: "questionType is required",
        });
      }

      const prompt = item.prompt;
      if (!hasPromptContent(prompt)) {
        errors.push({
          index,
          field: "prompt",
          code: "required",
          message: "prompt is required",
        });
      } else if (!isRichTextDoc(prompt) && typeof prompt !== "string") {
        errors.push({
          index,
          field: "prompt",
          code: "invalid",
          message: "prompt must be a TipTap doc",
        });
      }

      const correctAnswer = item.correctAnswer;
      const normalizedCorrectAnswer = normalizeCorrectAnswer(correctAnswer);
      const correctAnswerValid =
        (typeof normalizedCorrectAnswer === "string" && normalizedCorrectAnswer.length > 0) ||
        (Array.isArray(normalizedCorrectAnswer) && normalizedCorrectAnswer.length > 0);
      if (!correctAnswerValid) {
        errors.push({
          index,
          field: "correctAnswer",
          code: "required",
          message: "correctAnswer is required",
        });
      }

      if (questionType === "multipleChoice" || questionType === "ordering") {
        if (!Array.isArray(item.choices) || item.choices.length === 0) {
          errors.push({
            index,
            field: "choices",
            code: "required",
            message: "choices is required",
          });
        }
      }

      const choices = normalizeChoices(item.choices);

      const explanation = item.explanation;
      if (typeof explanation !== "undefined" && !isRichTextDoc(explanation) && typeof explanation !== "string") {
        errors.push({
          index,
          field: "explanation",
          code: "invalid",
          message: "explanation must be a TipTap doc",
        });
      }

      const difficulty = item.difficulty;
      if (typeof difficulty !== "undefined" && !isDifficulty(difficulty)) {
        errors.push({
          index,
          field: "difficulty",
          code: "invalid",
          message: "difficulty must be easy, medium, or hard",
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

      const order = item.order;
      if (typeof order !== "undefined" && !(typeof order === "number" && order >= 1)) {
        errors.push({
          index,
          field: "order",
          code: "invalid",
          message: "order must be a number >= 1",
        });
      }

      if (questionType && prompt) {
        const key = promptKey(questionType as string, prompt);
        if (seenKeys.has(key) || existingKeys.has(key)) {
          errors.push({
            index,
            field: "prompt",
            code: "duplicate",
            message: "prompt is duplicated",
          });
        } else {
          seenKeys.add(key);
        }
      }

      return {
        questionType: questionType as "multipleChoice" | "ordering" | "shortAnswer",
        prompt: toDoc(prompt),
        choices,
        correctAnswer: normalizedCorrectAnswer,
        explanation: toDoc(explanation),
        difficulty: (difficulty as "easy" | "medium" | "hard" | undefined) ?? "easy",
        tags: normalizeTags(tags),
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

    const existingCount = existingSnap.size;
    let nextOrder = existingCount + 1;
    const batch = writeBatch(db);
    const now = serverTimestamp();

    normalized.forEach((item) => {
      const docRef = doc(collection(db, "questions"));
      const order = typeof item.order === "number" ? item.order : nextOrder++;
      batch.set(docRef, {
        questionType: item.questionType,
        prompt: item.prompt,
        choices: item.choices,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        difficulty: item.difficulty ?? "easy",
        order,
        createdBy: user.id,
        tags: item.tags ?? [],
        updatedAt: now,
      });
    });

    await batch.commit();
    return NextResponse.json({ status: "success", count: normalized.length });
  } catch (error) {
    console.error("Failed to bulk create questions", error);
    return NextResponse.json(
      { error: "Failed to create questions" },
      { status: 500 },
    );
  }
}

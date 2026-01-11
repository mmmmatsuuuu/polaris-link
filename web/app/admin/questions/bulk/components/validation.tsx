"use client";

export type QuestionChoice = {
  key: string;
  label: unknown;
};

export type QuestionBulkItem = {
  questionType: "multipleChoice" | "ordering" | "shortAnswer";
  prompt: unknown;
  choices?: QuestionChoice[];
  correctAnswer: string | string[];
  explanation?: unknown;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  order?: number;
};

export type QuestionBulkPayload = {
  questions: QuestionBulkItem[];
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

function isQuestionType(value: unknown): value is QuestionBulkItem["questionType"] {
  return value === "multipleChoice" || value === "ordering" || value === "shortAnswer";
}

function isDifficulty(value: unknown): value is "easy" | "medium" | "hard" {
  return value === "easy" || value === "medium" || value === "hard";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
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

function normalizePromptKey(prompt: unknown) {
  if (typeof prompt === "string") return prompt.trim().toLowerCase();
  try {
    return JSON.stringify(prompt);
  } catch {
    return "";
  }
}

export function validateQuestionsPayload(payload: unknown): {
  data?: QuestionBulkPayload;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];
  if (typeof payload !== "object" || payload === null || !("questions" in payload)) {
    errors.push({
      index: 0,
      field: "questions",
      code: "required",
      message: "questions is required",
    });
    return { errors };
  }

  const questionsValue = (payload as { questions: unknown }).questions;
  if (!Array.isArray(questionsValue)) {
    errors.push({
      index: 0,
      field: "questions",
      code: "invalid",
      message: "questions must be an array",
    });
    return { errors };
  }

  if (questionsValue.length > MAX_ITEMS) {
    errors.push({
      index: 0,
      field: "questions",
      code: "limit_exceeded",
      message: `questions must be <= ${MAX_ITEMS}`,
    });
    return { errors };
  }

  const seenKeys = new Set<string>();
  const normalized: QuestionBulkItem[] = questionsValue.map((raw, index) => {
    if (typeof raw !== "object" || raw === null) {
      errors.push({
        index,
        field: "questions",
        code: "invalid",
        message: "question must be an object",
      });
      return {
        questionType: "multipleChoice",
        prompt: "",
        correctAnswer: "",
      };
    }

    const item = raw as Record<string, unknown>;
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

    const choices = item.choices;
    if (questionType === "multipleChoice" || questionType === "ordering") {
      if (!Array.isArray(choices) || choices.length === 0) {
        errors.push({
          index,
          field: "choices",
          code: "required",
          message: "choices is required",
        });
      }
    }
    if (Array.isArray(choices)) {
      choices.forEach((choice, choiceIndex) => {
        if (typeof choice !== "object" || choice === null) {
          errors.push({
            index,
            field: `choices.${choiceIndex}`,
            code: "invalid",
            message: "choice must be an object",
          });
          return;
        }
        const key = (choice as Record<string, unknown>).key;
        const label = (choice as Record<string, unknown>).label;
        if (typeof key !== "string" || !key.trim()) {
          errors.push({
            index,
            field: `choices.${choiceIndex}.key`,
            code: "required",
            message: "choice.key is required",
          });
        }
        if (typeof label !== "undefined" && !isRichTextDoc(label) && typeof label !== "string") {
          errors.push({
            index,
            field: `choices.${choiceIndex}.label`,
            code: "invalid",
            message: "choice.label must be a TipTap doc",
          });
        }
      });
    }

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
      const key = `${questionType}::${normalizePromptKey(prompt)}`;
      if (key && seenKeys.has(key)) {
        errors.push({
          index,
          field: "prompt",
          code: "duplicate",
          message: "prompt is duplicated",
        });
      } else if (key) {
        seenKeys.add(key);
      }
    }

    return {
      questionType: (questionType as QuestionBulkItem["questionType"]) ?? "multipleChoice",
      prompt,
      choices: Array.isArray(choices) ? (choices as QuestionChoice[]) : undefined,
      correctAnswer: normalizedCorrectAnswer,
      explanation,
      difficulty: difficulty as "easy" | "medium" | "hard" | undefined,
      tags: Array.isArray(tags) ? (tags as string[]) : undefined,
      order: typeof order === "number" ? order : undefined,
    };
  });

  if (errors.length > 0) return { errors };
  return { data: { questions: normalized }, errors };
}

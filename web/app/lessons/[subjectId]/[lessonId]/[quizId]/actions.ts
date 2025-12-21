"use server";

import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/server";
import type {
  LessonContent,
  LessonContentMetadata,
  LessonContentType,
  QuizQuestion,
  QuizQuestionType,
  RichTextDoc,
} from "@/types/catalog";

export type QuizContentPayload = Pick<LessonContent, "id" | "title" | "description" | "tags" | "metadata" | "publishStatus"> & {
  type?: LessonContentType;
};

export type QuizQuestionPayload = Pick<QuizQuestion, "id" | "questionType" | "prompt" | "choices" | "correctAnswer" | "explanation">;

export type GradeResult = {
  summary: { total: number; correct: number; accuracy: number };
  questions: Array<{
    id: string;
    questionType: QuizQuestionType;
    prompt: RichTextDoc;
    choices?: { key: string; label: RichTextDoc }[];
    correctAnswer?: string | string[];
    userAnswer?: string | string[];
    explanation?: RichTextDoc;
    isCorrect: boolean;
  }>;
};

type NormalizeChoice = { key: string; label: RichTextDoc };

export async function loadQuizContent(quizId: string) {
  const contentSnap = await getDoc(doc(db, "contents", quizId));
  if (!contentSnap.exists()) throw new Error("content not found");
  const contentData = contentSnap.data();
  if (contentData.type !== "quiz") throw new Error("content is not quiz");

  const metadata = (contentData.metadata ?? {}) as LessonContentMetadata & {
    questionIds?: unknown;
    questionsPerAttempt?: unknown;
  };
  const questionIds = Array.isArray(metadata.questionIds)
    ? metadata.questionIds.filter((id): id is string => typeof id === "string")
    : [];
  const questionsPerAttempt =
    typeof metadata.questionsPerAttempt === "number" && metadata.questionsPerAttempt > 0
      ? metadata.questionsPerAttempt
      : questionIds.length;

  const content: QuizContentPayload = {
    id: contentSnap.id,
    title: (contentData.title as string) ?? "",
    description: normalizeDoc(contentData.description),
    tags: Array.isArray(contentData.tags) ? (contentData.tags as string[]) : [],
    metadata: contentData.metadata as LessonContentMetadata,
    publishStatus: contentData.publishStatus as LessonContent["publishStatus"],
    type: contentData.type as LessonContentType,
  };

  return { content, questionIds, questionsPerAttempt };
}

export async function pickRandomIds(ids: string[], count: number): Promise<string[]> {
  const shuffled = [...ids];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export async function loadQuestionsByIds(ids: string[]): Promise<QuizQuestionPayload[]> {
  const snaps = await Promise.all(ids.map((id) => getDoc(doc(db, "questions", id))));
  return snaps
    .filter((snap) => snap.exists())
    .map((snap) => {
      const data = snap.data() as Partial<QuizQuestion>;
      const questionType = (data.questionType as QuizQuestionType) ?? "multipleChoice";
      const normalizedChoices = normalizeChoices(data.choices);
      const shuffledChoices =
        questionType === "multipleChoice" || questionType === "ordering"
          ? shuffleChoices(normalizedChoices)
          : normalizedChoices;
      return {
        id: snap.id,
        questionType,
        prompt: normalizeDoc(data.prompt),
        choices: shuffledChoices,
        correctAnswer: data.correctAnswer ?? "",
        explanation: normalizeDoc(data.explanation),
      };
    });
}

export async function gradeQuiz(input: {
  contentId: string;
  selectedQuestionIds: string[];
  answers: Record<string, string | string[]>;
}): Promise<GradeResult> {
  const { contentId, selectedQuestionIds, answers } = input;

  const { content, questionIds } = await loadQuizContent(contentId);
  const ids = selectedQuestionIds.filter((id) => questionIds.includes(id));
  const questions = await loadQuestionsByIds(ids);

  const evaluated = questions.map((question) => evaluateQuestion(question, answers[question.id]));
  const correct = evaluated.filter((q) => q.isCorrect).length;
  const total = evaluated.length;
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

  return {
    summary: { total, correct, accuracy },
    questions: evaluated,
  };
}

function normalizeDoc(value: unknown): RichTextDoc {
  if (value && typeof value === "object" && "type" in value) {
    return value as RichTextDoc;
  }
  const text = typeof value === "string" ? value : "";
  return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] };
}

function docToPlain(value: RichTextDoc): string {
  try {
    const content = (value as any)?.content;
    if (Array.isArray(content)) {
      const texts: string[] = [];
      const walk = (nodes: any[]) => {
        nodes.forEach((node) => {
          if (node?.type === "text" && typeof node.text === "string") texts.push(node.text);
          if (Array.isArray(node?.content)) walk(node.content);
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

function normalizeChoices(value: unknown): NormalizeChoice[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((choice, index) => {
      if (typeof choice === "object" && choice !== null && "key" in choice && "label" in choice) {
        const key = typeof (choice as any).key === "string" ? (choice as any).key.trim() : "";
        if (!key) return null;
        return { key, label: normalizeDoc((choice as any).label) };
      }
      if (typeof choice === "string") {
        const label = choice.trim();
        if (!label) return null;
        return { key: `choice-${index + 1}`, label: normalizeDoc(label) };
      }
      return null;
    })
    .filter((c): c is NormalizeChoice => Boolean(c));
}

function shuffleChoices<T>(choices: T[]): T[] {
  const result = [...choices];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function normalizeAnswerArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") return [value.trim()].filter(Boolean);
  return [];
}

function evaluateQuestion(question: QuizQuestionPayload, answer: unknown) {
  const questionType = (question.questionType as QuizQuestionType) ?? "multipleChoice";
  const choices = normalizeChoices(question.choices);
  const userAnswerRaw = typeof answer === "string" || Array.isArray(answer) ? answer : undefined;
  const correctAnswerRaw =
    typeof question.correctAnswer === "string" || Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : undefined;

  let isCorrect = false;
  let userAnswerDisplay: string | string[] | undefined;
  let correctAnswerDisplay: string | string[] | undefined;

  if (questionType === "multipleChoice") {
    const expectedKeys = normalizeAnswerArray(correctAnswerRaw);
    const userKeys = normalizeAnswerArray(userAnswerRaw);
    if (expectedKeys.length > 1) {
      isCorrect = isSetEqual(expectedKeys, userKeys);
    } else {
      isCorrect = expectedKeys[0] ? userKeys[0] === expectedKeys[0] : false;
    }
    correctAnswerDisplay = expectedKeys.length ? mapKeysToLabels(expectedKeys, choices) : undefined;
    userAnswerDisplay = userKeys.length ? mapKeysToLabels(userKeys, choices) : undefined;
  } else if (questionType === "ordering") {
    const expectedKeys = normalizeAnswerArray(correctAnswerRaw);
    const userKeys = normalizeAnswerArray(userAnswerRaw);
    isCorrect = isArrayEqual(expectedKeys, userKeys);
    correctAnswerDisplay = expectedKeys.length ? mapKeysToLabels(expectedKeys, choices) : undefined;
    userAnswerDisplay = userKeys.length ? mapKeysToLabels(userKeys, choices) : undefined;
  } else if (questionType === "shortAnswer") {
    const expected = typeof correctAnswerRaw === "string" ? correctAnswerRaw.trim() : "";
    const user = typeof userAnswerRaw === "string" ? userAnswerRaw.trim() : "";
    isCorrect = expected.length > 0 && expected.toLowerCase() === user.toLowerCase();
    correctAnswerDisplay = expected || undefined;
    userAnswerDisplay = user || undefined;
  }

  return {
    id: question.id,
    questionType,
    prompt: normalizeDoc(question.prompt),
    explanation: question.explanation ? normalizeDoc(question.explanation) : undefined,
    choices,
    correctAnswer: correctAnswerDisplay ?? correctAnswerRaw,
    userAnswer: userAnswerDisplay ?? userAnswerRaw,
    isCorrect,
  };
}

function mapKeysToLabels(keys: string[], choices: { key: string; label: RichTextDoc }[]): string[] {
  return keys.map((key) => {
    const label = choices.find((c) => c.key === key)?.label;
    return label ? docToPlain(label) : key;
  });
}

function isSetEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size !== setB.size) return false;
  return Array.from(setA).every((item) => setB.has(item));
}

function isArrayEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

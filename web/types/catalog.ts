export type PublishStatus = "public" | "private";

export type TimestampIsoString = string;

export type RichTextDoc = {
  type: "doc";
  content?: unknown[];
  [key: string]: unknown;
};

export type BaseDocument = {
  id: string;
  order: number;
  publishStatus: PublishStatus;
  availableYears: number[];
  createdBy?: string;
  updatedAt?: TimestampIsoString;
};

export type Subject = BaseDocument & {
  name: string;
  description: RichTextDoc;
};

export type Unit = BaseDocument & {
  subjectId: string;
  name: string;
  description: RichTextDoc;
};

export type Lesson = BaseDocument & {
  subjectId: string;
  unitId: string | null;
  title: string;
  description: RichTextDoc;
  tags: string[];
};

export type LessonContentType = "video" | "quiz" | "link";

export type LessonContentMetadata =
  | {
      type: "video";
      youtubeVideoId: string;
      durationSec: number;
      badgeLabel?: string;
    }
  | {
      type: "quiz";
      questionPoolSize: number;
      questionsPerAttempt: number;
      timeLimitSec?: number;
      allowRetry: boolean;
    }
  | {
      type: "link";
      url: string;
      badge?: string;
    };

export type LessonContent = {
  id: string;
  lessonId: string;
  type: LessonContentType;
  title: string;
  description: RichTextDoc;
  tags: string[];
  publishStatus: PublishStatus;
  order: number;
  metadata: LessonContentMetadata;
  createdBy?: string;
  updatedAt?: TimestampIsoString;
};

export type QuizQuestionType =
  | "multipleChoice"
  | "ordering"
  | "shortAnswer";

export type QuizQuestionChoice = {
  key: string;
  label: RichTextDoc;
};

export type QuizQuestion = {
  id: string;
  contentId: string;
  questionType: QuizQuestionType;
  prompt: RichTextDoc;
  choices?: QuizQuestionChoice[];
  correctAnswer: string | string[];
  explanation?: RichTextDoc;
  order: number;
  difficulty: "easy" | "medium" | "hard";
  isActive: boolean;
  tags: string[];
};

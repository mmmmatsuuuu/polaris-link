export type PublishStatus = "public" | "private";

export type TimestampIsoString = string;

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
  description: string;
};

export type Unit = BaseDocument & {
  subjectId: string;
  name: string;
  description: string;
};

export type Lesson = BaseDocument & {
  subjectId: string;
  unitId: string | null;
  title: string;
  description: string;
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
  description: string;
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

export type QuizQuestion = {
  id: string;
  contentId: string;
  questionType: QuizQuestionType;
  prompt: string;
  choices?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  order: number;
  difficulty: "easy" | "medium" | "hard";
  isActive: boolean;
  tags: string[];
};

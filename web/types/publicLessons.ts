export type PublicContentItem = {
  id: string;
  title: string;
  kind: "video" | "quiz" | "resource";
  description: string;
  meta?: string;
};

export type PublicLesson = {
  id: string;
  title: string;
  subject: string;
  unit: string;
  academicYear: string;
  description: string;
  summary: string;
  lastUpdated: string;
  tags: string[];
  highlights: PublicContentItem[];
  videos: PublicContentItem[];
  quizzes: PublicContentItem[];
  resources: PublicContentItem[];
};

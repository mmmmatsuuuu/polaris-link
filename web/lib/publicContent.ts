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

const lessons: PublicLesson[] = [
  {
    id: "world-history-01",
    title: "世界史A：産業革命と近代社会",
    subject: "世界史",
    unit: "ヨーロッパの近代化",
    academicYear: "2024",
    description:
      "18世紀の産業革命が社会や政治、文化に与えた影響を動画と小テストで学びます。",
    summary:
      "産業革命の背景から結果までを体系的に学ぶ授業。動画50分、小テスト計15問を収録。",
    lastUpdated: "2024-04-12",
    tags: ["歴史", "近代", "世界史A"],
    highlights: [
      {
        id: "highlight-video",
        title: "産業革命のキーワードを15分で総復習",
        kind: "video",
        description:
          "主要な発明と社会変化を図解で整理。初学者でも理解しやすい構成です。",
        meta: "15min",
      },
      {
        id: "highlight-quiz",
        title: "蒸気機関と工場制手工業",
        kind: "quiz",
        description: "発明者や年代を問う基礎クイズ5問で理解を確認。",
        meta: "5問",
      },
    ],
    videos: [
      {
        id: "video-01",
        title: "産業革命の背景",
        kind: "video",
        description: "農業革命や人口増加など、産業革命前夜を解説します。",
        meta: "12min",
      },
      {
        id: "video-02",
        title: "技術革新と社会構造の変化",
        kind: "video",
        description: "紡績機や蒸気機関の広がりと工場制度を学びます。",
        meta: "20min",
      },
    ],
    quizzes: [
      {
        id: "quiz-01",
        title: "技術革新チェック",
        kind: "quiz",
        description: "発明品と発明者をマッチさせる問題構成。",
        meta: "5問",
      },
    ],
    resources: [
      {
        id: "resource-01",
        title: "授業スライドPDF",
        kind: "resource",
        description: "授業で使用するスライド資料。",
      },
    ],
  },
  {
    id: "math-geometry-angles",
    title: "数学I：図形の性質と証明",
    subject: "数学",
    unit: "平面図形",
    academicYear: "2024",
    description:
      "平行線と角、合同条件など図形の基本定理を動画と演習で確認します。",
    summary: "図形の基本を押さえる授業。例題動画と正誤判定付き小テストを収録。",
    lastUpdated: "2024-05-02",
    tags: ["数学", "図形", "数学I"],
    highlights: [
      {
        id: "highlight-math-video",
        title: "平行線と錯角・同位角の関係",
        kind: "video",
        description: "色付けアニメーションで視覚的に理解します。",
        meta: "10min",
      },
    ],
    videos: [
      {
        id: "math-video-1",
        title: "図形の基本用語",
        kind: "video",
        description: "三角形や多角形の定義を確認。",
        meta: "8min",
      },
    ],
    quizzes: [
      {
        id: "math-quiz-1",
        title: "平行線と角の関係",
        kind: "quiz",
        description: "図を見て角度を求める問題。",
        meta: "5問",
      },
    ],
    resources: [],
  },
];

export async function getPublicLessons(): Promise<PublicLesson[]> {
  return lessons;
}

export async function getPublicLessonById(
  id: string,
): Promise<PublicLesson | undefined> {
  return lessons.find((lesson) => lesson.id === id);
}

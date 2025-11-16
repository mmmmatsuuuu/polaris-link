import type { LessonContent } from "@/types/catalog";

export function formatYears(years: number[]): string {
  if (!years.length) {
    return "年度未設定";
  }
  return years.map((year) => `${year}年度`).join(" / ");
}

export function formatContentStats(contents: LessonContent[]): string {
  const counts: Record<LessonContent["type"], number> = {
    video: 0,
    quiz: 0,
    link: 0,
  };

  contents.forEach((content) => {
    counts[content.type] += 1;
  });

  const labels: string[] = [];
  if (counts.video) labels.push(`${counts.video}動画`);
  if (counts.quiz) labels.push(`${counts.quiz}小テスト`);
  if (counts.link) labels.push(`${counts.link}資料`);

  return labels.join(" / ") || "構成準備中";
}

export function getContentLabel(content: LessonContent): string {
  switch (content.metadata.type) {
    case "video":
      if (content.metadata.badgeLabel) {
        return content.metadata.badgeLabel;
      }
      if (content.metadata.durationSec) {
        const minutes = Math.round(content.metadata.durationSec / 60);
        return minutes ? `${minutes}分` : "動画";
      }
      return "動画";
    case "quiz":
      if (content.metadata.timeLimitSec) {
        const limitMinutes = Math.round(content.metadata.timeLimitSec / 60);
        return `${content.metadata.questionsPerAttempt}問 / ${limitMinutes}分`;
      }
      return `${content.metadata.questionsPerAttempt}問`;
    case "link":
      return content.metadata.badge ?? "資料";
    default:
      return "コンテンツ";
  }
}

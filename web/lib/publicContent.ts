import type { PublicLesson } from "@/types/publicLessons";

const lessons: PublicLesson[] = [
  {
    id: "info1-open-data",
    title: "情報I：オープンデータで社会課題を読み解く",
    subject: "情報I",
    unit: "データの活用と情報モラル",
    academicYear: "2024",
    description:
      "政府統計ポータルなどのオープンデータから課題を読み解き、可視化・考察する基礎を学ぶ授業です。",
    summary:
      "統計ポータルの使い方からCSV取り込み、スプレッドシートでのグラフ化までを一気通貫で扱います。",
    lastUpdated: "2024-06-15",
    tags: ["データ活用", "情報モラル"],
    highlights: [
      {
        id: "info1-highlight-video",
        title: "社会を変えるデータ活用の事例",
        kind: "video",
        description: "国内外の成功事例をピックアップしてモチベーションを高めます。",
        meta: "12min",
      },
      {
        id: "info1-highlight-quiz",
        title: "統計リテラシーチェック",
        kind: "quiz",
        description: "平均・中央値・グラフの読み取りなど基礎力を確認。",
        meta: "6問",
      },
    ],
    videos: [
      {
        id: "info1-hands-on-video",
        title: "CSVをスプレッドシートに読み込む",
        kind: "video",
        description: "e-StatからダウンロードしたCSVを整形し、グラフにする手順を解説。",
        meta: "18min",
      },
    ],
    quizzes: [
      {
        id: "info1-quiz-basics",
        title: "データ活用の注意点",
        kind: "quiz",
        description: "公開データを扱う際の倫理や注意点を問う選択式問題。",
        meta: "6問",
      },
    ],
    resources: [
      {
        id: "info1-resource-guideline",
        title: "オープンデータサイト一覧",
        kind: "resource",
        description: "e-Statや自治体ポータルなどのURLをまとめたリンク集。",
      },
    ],
  },
  {
    id: "info2-network-design",
    title: "情報II：学校LANの設計とセキュリティ",
    subject: "情報II",
    unit: "コンピュータシステムとネットワーク",
    academicYear: "2024",
    description:
      "学校LANを題材にネットワーク構成図の読み書き、セキュリティ脅威への備えを学ぶ授業です。",
    summary:
      "IPv4/IPv6、VLAN設計、認証方式などを俯瞰し、実際の構成案をチームでまとめる演習を含みます。",
    lastUpdated: "2024-06-20",
    tags: ["ネットワーク", "セキュリティ"],
    highlights: [
      {
        id: "info2-highlight-video",
        title: "学校LANの全体像を10分で理解",
        kind: "video",
        description: "必要な機器と配置、利用者導線を俯瞰するイントロ動画。",
        meta: "10min",
      },
      {
        id: "info2-highlight-quiz",
        title: "セキュリティリスク診断",
        kind: "quiz",
        description: "よくある脅威と対策をケーススタディ形式で出題。",
        meta: "8問",
      },
    ],
    videos: [
      {
        id: "info2-config-video",
        title: "VLANとDHCPの設定デモ",
        kind: "video",
        description: "仮想環境での設定手順とポイントを解説。",
        meta: "22min",
      },
    ],
    quizzes: [
      {
        id: "info2-quiz-security",
        title: "ネットワーク基礎力チェック",
        kind: "quiz",
        description: "IPアドレス計算やアクセス制御に関する基礎問題。",
        meta: "8問",
      },
    ],
    resources: [
      {
        id: "info2-resource-checklist",
        title: "LAN設計チェックリスト",
        kind: "resource",
        description: "ヒアリング項目やセキュリティ確認手順をまとめたPDF想定資料。",
      },
    ],
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

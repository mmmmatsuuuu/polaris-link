"use client";

import { useMemo, useState } from "react";

const SAMPLE_PAYLOAD = {
  lessons: [
    {
      id: "info1-open-data",
      title: "情報I：オープンデータで社会課題を読み解く",
      subject: "情報I",
      unit: "データの活用と情報モラル",
      academicYear: 2024,
      description:
        "政府統計ポータルなどのオープンデータから課題を読み解き、可視化・考察する基礎を学ぶ授業です。",
      summary:
        "統計ポータルの使い方からCSV取り込み、スプレッドシートでのグラフ化までを一気通貫で扱います。",
      tags: ["データ活用", "情報モラル"],
      contents: [
        {
          id: "info1-highlight-video",
          title: "社会を変えるデータ活用の事例",
          type: "video",
          metadata: { isHighlight: true, durationLabel: "12min" },
        },
        {
          id: "info1-highlight-quiz",
          title: "統計リテラシーチェック",
          type: "quiz",
          metadata: { isHighlight: true, questionCountLabel: "6問" },
        },
        {
          id: "info1-hands-on-video",
          title: "CSVをスプレッドシートに読み込む",
          type: "video",
          metadata: { durationLabel: "18min" },
        },
        {
          id: "info1-resource-guideline",
          title: "オープンデータサイト一覧",
          type: "resource",
        },
      ],
    },
    {
      id: "info2-network-design",
      title: "情報II：学校LANの設計とセキュリティ",
      subject: "情報II",
      unit: "コンピュータシステムとネットワーク",
      academicYear: 2024,
      description:
        "学校LANを題材にネットワーク構成図の読み書き、セキュリティ脅威への備えを学ぶ授業です。",
      summary:
        "IPv4/IPv6、VLAN設計、認証方式などを俯瞰し、実際の構成案をチームでまとめる演習を含みます。",
      tags: ["ネットワーク", "セキュリティ"],
      contents: [
        {
          id: "info2-highlight-video",
          title: "学校LANの全体像を10分で理解",
          type: "video",
          metadata: { isHighlight: true, durationLabel: "10min" },
        },
        {
          id: "info2-highlight-quiz",
          title: "セキュリティリスク診断",
          type: "quiz",
          metadata: { isHighlight: true, questionCountLabel: "8問" },
        },
        {
          id: "info2-config-video",
          title: "VLANとDHCPの設定デモ",
          type: "video",
          metadata: { durationLabel: "22min" },
        },
        {
          id: "info2-resource-checklist",
          title: "LAN設計チェックリスト",
          type: "resource",
        },
      ],
    },
  ],
};

export default function MockImportPage() {
  const sampleJson = useMemo(
    () => JSON.stringify(SAMPLE_PAYLOAD, null, 2),
    [],
  );
  const [jsonText, setJsonText] = useState(sampleJson);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setStatus(null);
    try {
      JSON.parse(jsonText);
      console.log("JSON parsed successfully");
    } catch (error) {
      setStatus(`JSONのパースに失敗しました: ${(error as Error).message}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/dev/mock-lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonText,
      });
      console.log("Response received:", response);
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? response.statusText);
      }

      const payload = (await response.json()) as { imported: string[] };
      console.log("Import payload:", payload);
      setStatus(
        `インポート完了: ${payload.imported.length}件 (${payload.imported.join(", ")})`,
      );
    } catch (error) {
      setStatus(`インポートに失敗しました: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Firestore Mock Importer</h1>
      <p className="mt-3 text-gray-600">
        JSONで授業データを記述し、Firestore Emulator の
        <code className="mx-1 rounded bg-gray-100 px-1 py-0.5">
          lessons
        </code>
        コレクションに書き込みます。`lessons` 配列 or そのまま配列形式を受け付けます。
      </p>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          className="rounded border border-gray-300 px-4 py-2 text-sm"
          onClick={() => setJsonText(sampleJson)}
        >
          サンプルを読み込む
        </button>
        <button
          type="button"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "インポート中..." : "Firestoreへ書き込む"}
        </button>
      </div>

      <textarea
        className="mt-4 h-[500px] w-full rounded border border-gray-300 bg-gray-50 p-3 font-mono text-sm"
        value={jsonText}
        onChange={(event) => setJsonText(event.target.value)}
      />

      {status && (
        <p className="mt-4 rounded border border-gray-200 bg-gray-50 p-3 text-sm">
          {status}
        </p>
      )}
    </main>
  );
}

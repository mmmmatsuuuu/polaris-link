import Link from "next/link";

const progressCards = [
  { subject: "情報リテラシー", completed: 6, total: 10 },
  { subject: "理科探究", completed: 4, total: 8 },
];

const timeline = [
  { time: "09:00", label: "SNSセキュリティ動画を視聴", type: "動画" },
  { time: "09:20", label: "小テストA 80%", type: "小テスト" },
  { time: "10:00", label: "理科: 化学反応授業を開始", type: "動画" },
];

export default function StudentDashboardPage() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">こんにちは、山田さん</p>
            <h1 className="text-3xl font-bold text-slate-900">今期の学習時間 12h 30m</h1>
            <p className="mt-2 text-slate-600">最近の学習ログと未完了コンテンツを確認できます。</p>
          </div>
          <Link
            href="/student/subjects"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
          >
            科目利用状況ページへ
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-2">
        {progressCards.map((card) => (
          <div key={card.subject} className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">科目</p>
            <h2 className="text-xl font-semibold text-slate-900">{card.subject}</h2>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-sky-500"
                style={{ width: `${Math.round((card.completed / card.total) * 100)}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              完了 {card.completed} / {card.total}
            </p>
          </div>
        ))}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">お知らせ</p>
          <h2 className="text-xl font-semibold text-slate-900">教師からのメッセージ</h2>
          <p className="mt-3 text-sm text-slate-600">
            5月の小テストは5/20(月)までに受験してください。疑問点は教師ページのメッセージフォームから連絡してください。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">最近の学習履歴</h2>
          <div className="mt-4 space-y-3">
            {timeline.map((entry) => (
              <div key={entry.time} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{entry.label}</p>
                  <p className="text-slate-500">{entry.time}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">{entry.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

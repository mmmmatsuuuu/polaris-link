import Link from "next/link";

const questions = [
  { prompt: "SNS投稿前に確認する項目は?", type: "選択", difficulty: "★☆☆", status: "公開" },
  { prompt: "危険な投稿例を挙げよ", type: "記述", difficulty: "★★☆", status: "公開" },
];

export default function QuestionAdminPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">管理</p>
            <h1 className="text-3xl font-bold text-slate-900">問題管理</h1>
            <p className="mt-2 text-slate-600">小テスト問題の編集やプレビューのUI例です。</p>
          </div>
          <div className="flex gap-2 text-sm">
            <button className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white">問題を追加</button>
            <Link href="/admin/questions/bulk" className="rounded-full border border-slate-300 px-4 py-2 text-slate-700">
              一括登録
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 space-y-3">
        {questions.map((question) => (
          <div key={question.prompt} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs text-slate-500">{question.type} / 難易度 {question.difficulty}</p>
                <h2 className="text-lg font-semibold text-slate-900">{question.prompt}</h2>
              </div>
              <span className="text-sm font-semibold text-emerald-600">{question.status}</span>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

import Link from "next/link";

const lessons = [
  { title: "SNSと個人情報", subject: "情報リテラシー", unit: "情報モラル", contents: 3, status: "公開" },
  { title: "クラウド活用", subject: "情報リテラシー", unit: "デジタル基礎", contents: 2, status: "非公開" },
];

export default function LessonAdminPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">管理</p>
            <h1 className="text-3xl font-bold text-slate-900">授業管理</h1>
            <p className="mt-2 text-slate-600">授業とコンテンツの紐付けを編集するUI例です。</p>
          </div>
          <div className="flex gap-2 text-sm">
            <button className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white">授業を追加</button>
            <Link href="/admin/lessons/bulk" className="rounded-full border border-slate-300 px-4 py-2 text-slate-700">
              一括登録
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 space-y-3">
        {lessons.map((lesson) => (
          <div key={lesson.title} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs text-slate-500">科目: {lesson.subject} / 単元: {lesson.unit}</p>
                <h2 className="text-xl font-semibold text-slate-900">{lesson.title}</h2>
                <p className="text-sm text-slate-500">コンテンツ {lesson.contents} 件</p>
              </div>
              <span className={`text-sm font-semibold ${lesson.status === "公開" ? "text-emerald-600" : "text-slate-400"}`}>
                {lesson.status}
              </span>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

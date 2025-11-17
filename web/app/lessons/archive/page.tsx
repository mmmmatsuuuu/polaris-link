const archivedLessons = [
  {
    title: "デザイン思考入門",
    subject: "未分類",
    tags: ["動画", "資料"],
    updated: "2024/03/01",
  },
  {
    title: "課題解決ワークショップ",
    subject: "未分類",
    tags: ["動画", "小テスト"],
    updated: "2024/02/15",
  },
];

export default function ArchivePage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-sky-600">アーカイブ</p>
            <h1 className="text-3xl font-bold text-slate-900">未紐付け授業一覧</h1>
            <p className="mt-2 text-slate-600">タグや更新日でソートして授業を探せます（UIモックのため動作は固定です）。</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-white px-3 py-1">フィルター: 動画</span>
            <span className="rounded-full bg-white px-3 py-1">ソート: 更新日</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 py-10">
        {archivedLessons.map((lesson) => (
          <div key={lesson.title} className="rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900">{lesson.title}</p>
                <p className="text-sm text-slate-500">所属: {lesson.subject}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  {lesson.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-slate-500">
                <p>更新日 {lesson.updated}</p>
                <p>公開状態: 公開</p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

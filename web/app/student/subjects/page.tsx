const tree = [
  {
    subject: "情報リテラシー",
    units: [
      {
        name: "デジタル基礎",
        lessons: [
          { title: "授業01", video: 100, quiz: 80 },
          { title: "授業02", video: 40, quiz: null },
        ],
      },
    ],
  },
  {
    subject: "理科探究",
    units: [
      {
        name: "化学反応",
        lessons: [
          { title: "授業05", video: 20, quiz: 0 },
        ],
      },
    ],
  },
];

export default function StudentSubjectUsagePage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-sm text-slate-500">自分の学習状況</p>
          <h1 className="text-3xl font-bold text-slate-900">科目別利用状況</h1>
          <p className="mt-2 text-slate-600">期間: 2024/04/01 - 2024/04/30（UIモックのため固定表示）</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        {tree.map((subject) => (
          <div key={subject.subject} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{subject.subject}</h2>
            <div className="mt-4 space-y-4">
              {subject.units.map((unit) => (
                <div key={unit.name} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">{unit.name}</p>
                  <div className="mt-3 space-y-3">
                    {unit.lessons.map((lesson) => (
                      <div key={lesson.title} className="rounded-2xl bg-white p-4">
                        <p className="font-medium text-slate-900">{lesson.title}</p>
                        <div className="mt-2 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                          <div>
                            <p className="text-xs text-slate-500">動画視聴率</p>
                            <div className="mt-2 h-2 rounded-full bg-slate-100">
                              <div
                                className="h-2 rounded-full bg-sky-500"
                                style={{ width: `${lesson.video}%` }}
                              />
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{lesson.video}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">小テスト正答率</p>
                            {lesson.quiz === null ? (
                              <p className="mt-2 text-xs text-slate-400">未受験</p>
                            ) : (
                              <>
                                <div className="mt-2 h-2 rounded-full bg-slate-100">
                                  <div
                                    className="h-2 rounded-full bg-emerald-500"
                                    style={{ width: `${lesson.quiz}%` }}
                                  />
                                </div>
                                <p className="mt-1 text-xs text-slate-500">{lesson.quiz}%</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

const subjects = [
  {
    name: "情報リテラシー",
    completion: 72,
    quizAccuracy: 68,
    units: [
      { name: "デジタル基礎", completion: 80, quizAccuracy: 70 },
      { name: "情報モラル", completion: 60, quizAccuracy: 65 },
    ],
  },
  {
    name: "理科探究",
    completion: 54,
    quizAccuracy: 62,
    units: [
      { name: "化学反応", completion: 50, quizAccuracy: 58 },
    ],
  },
];

export default function TeacherSubjectUsagePage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-sm text-slate-500">集計</p>
          <h1 className="text-3xl font-bold text-slate-900">科目別利用状況</h1>
          <p className="mt-2 text-slate-600">フィルター: 科目=すべて / 期間=今月（UIモック）</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        {subjects.map((subject) => (
          <div key={subject.name} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{subject.name}</h2>
                <p className="text-sm text-slate-500">完了率 {subject.completion}% / 小テスト正答率 {subject.quizAccuracy}%</p>
              </div>
              <div className="flex gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">公開中</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">閲覧 230 件</span>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {subject.units.map((unit) => (
                <div key={unit.name} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">{unit.name}</p>
                  <p className="text-xs text-slate-500">完了率 {unit.completion}% / 正答率 {unit.quizAccuracy}%</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

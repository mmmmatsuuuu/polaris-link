import Link from "next/link";

const subjects = [
  {
    id: "literacy",
    name: "情報リテラシー",
    description: "基本操作から情報モラルまでを網羅した入門コース。",
    units: [
      { name: "デジタル基礎", lessons: 3 },
      { name: "情報モラル", lessons: 2 },
    ],
  },
  {
    id: "science",
    name: "理科探究",
    description: "動画・演習を通じて観察力と考察力を鍛える科目。",
    units: [
      { name: "化学反応", lessons: 4 },
      { name: "生物の仕組み", lessons: 3 },
    ],
  },
  {
    id: "history",
    name: "世界史",
    description: "時代別のストーリーを映像と年表で学ぶ。",
    units: [
      { name: "古代文明", lessons: 2 },
      { name: "近代革命", lessons: 3 },
    ],
  },
];

export default function LessonsPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold text-sky-600">公開授業カタログ</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">科目一覧</h1>
          <p className="mt-3 text-slate-600">
            科目カードをクリックするとサンプルの科目ページに遷移し、さらに授業ページや小テストページへ移動できます。
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-4 py-1">科目数 3</span>
            <span className="rounded-full bg-slate-100 px-4 py-1">単元数 8</span>
            <span className="rounded-full bg-slate-100 px-4 py-1">授業数 20</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-16 md:grid-cols-2">
        {subjects.map((subject) => (
          <div key={subject.id} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{subject.name}</h2>
                <p className="text-sm text-slate-500">{subject.description}</p>
              </div>
              <Link
                href="/lessons/subject-sample"
                className="rounded-full border border-slate-200 px-4 py-1 text-sm font-medium text-slate-700"
              >
                詳細
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {subject.units.map((unit) => (
                <div
                  key={unit.name}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"
                >
                  <span>{unit.name}</span>
                  <span className="text-slate-500">授業 {unit.lessons}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-900">紐付けのない授業も公開中</h3>
          <p className="mt-2 text-sm text-slate-600">
            科目や単元に属していない授業はアーカイブページから検索できます。
          </p>
          <Link
            href="/lessons/archive"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
          >
            アーカイブを見る
          </Link>
        </div>
      </section>
    </main>
  );
}

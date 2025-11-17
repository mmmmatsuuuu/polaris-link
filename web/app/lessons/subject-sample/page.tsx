import Link from "next/link";

const units = [
  {
    name: "デジタル基礎",
    summary: "OSの基本操作とオンライン情報の扱い方を学習。",
    lessons: [
      { title: "授業01: キーボードの使い方", status: "視聴済み", tags: ["動画", "小テスト"] },
      { title: "授業02: クラウド活用", status: "未視聴", tags: ["動画"] },
    ],
  },
  {
    name: "情報モラル",
    summary: "SNSや著作権など情報倫理を扱う単元。",
    lessons: [
      { title: "授業03: SNSと個人情報", status: "進行中", tags: ["動画", "小テスト"] },
      { title: "授業04: 著作権入門", status: "未視聴", tags: ["リンク教材"] },
    ],
  },
];

const breadcrumbs = [
  { label: "授業一覧", href: "/lessons" },
  { label: "情報リテラシー", href: "/lessons/subject-sample" },
];

export default function SubjectSamplePage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <nav className="text-sm text-slate-500">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.label}>
                <Link href={crumb.href} className="text-slate-600 hover:text-slate-900">
                  {crumb.label}
                </Link>
                {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
              </span>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-600">科目</p>
              <h1 className="text-3xl font-bold text-slate-900">情報リテラシー</h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                ハードウェア・ソフトウェアの基礎、クラウドサービス、安全な情報の扱い方などを動画と小テストで段階的に学びます。
              </p>
            </div>
            <div className="grid gap-2 text-sm text-slate-600 md:text-right">
              <span>単元数: 2</span>
              <span>公開授業: 4</span>
              <span>最終更新: 2024/04/01</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6">
          {units.map((unit) => (
            <div key={unit.name} className="rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{unit.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">{unit.summary}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  授業 {unit.lessons.length}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {unit.lessons.map((lesson) => (
                  <div key={lesson.title} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-base font-medium text-slate-900">{lesson.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {lesson.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-white px-3 py-1 text-slate-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-2 text-sm text-slate-500 md:items-end">
                        <span>{lesson.status}</span>
                        <Link
                          href="/lessons/subject-sample/lesson-sample"
                          className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold text-white"
                        >
                          授業ページへ
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

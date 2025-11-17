import Link from "next/link";

const units = [
  { name: "デジタル基礎", subject: "情報リテラシー", lessons: 4, status: "公開" },
  { name: "情報モラル", subject: "情報リテラシー", lessons: 3, status: "公開" },
];

export default function UnitAdminPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">管理</p>
            <h1 className="text-3xl font-bold text-slate-900">単元管理</h1>
            <p className="mt-2 text-slate-600">単元と科目・授業の紐付けを編集するUI例です。</p>
          </div>
          <div className="flex gap-2 text-sm">
            <button className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white">単元を追加</button>
            <Link href="/admin/units/bulk" className="rounded-full border border-slate-300 px-4 py-2 text-slate-700">
              CSV一括登録
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 space-y-3">
        {units.map((unit) => (
          <div key={unit.name} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs text-slate-500">科目: {unit.subject}</p>
                <h2 className="text-xl font-semibold text-slate-900">{unit.name}</h2>
              </div>
              <div className="text-sm text-slate-500">
                授業 {unit.lessons} / 状態 <span className="font-semibold text-emerald-600">{unit.status}</span>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

import Link from "next/link";

const subjects = [
  { name: "情報リテラシー", status: "公開", units: 2, updated: "2024/04/01" },
  { name: "理科探究", status: "非公開", units: 3, updated: "2024/03/28" },
];

export default function SubjectAdminPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">管理</p>
            <h1 className="text-3xl font-bold text-slate-900">科目管理</h1>
            <p className="mt-2 text-slate-600">科目の登録・公開切替・単元紐付けを行うUI例です。</p>
          </div>
          <div className="flex gap-2 text-sm">
            <button className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white">科目を追加</button>
            <Link href="/admin/subjects/bulk" className="rounded-full border border-slate-300 px-4 py-2 text-slate-700">
              CSV一括登録
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">科目名</th>
                <th className="px-6 py-3">公開状態</th>
                <th className="px-6 py-3">紐付け単元</th>
                <th className="px-6 py-3">更新日</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.name} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-900">{subject.name}</td>
                  <td className="px-6 py-4">
                    <span className={subject.status === "公開" ? "text-emerald-600" : "text-slate-400"}>{subject.status}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{subject.units} 単元</td>
                  <td className="px-6 py-4 text-slate-500">{subject.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

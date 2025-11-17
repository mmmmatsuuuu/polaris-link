import Link from "next/link";

const students = [
  { name: "山田 花子", email: "hanako@example.com", status: "有効", lastLogin: "今日" },
  { name: "佐藤 太郎", email: "taro@example.com", status: "無効", lastLogin: "30日前" },
];

export default function StudentAdminPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">管理</p>
            <h1 className="text-3xl font-bold text-slate-900">生徒管理</h1>
            <p className="mt-2 text-slate-600">メールアドレスのホワイトリスト登録やステータス変更を行うUI例です。</p>
          </div>
          <div className="flex gap-2 text-sm">
            <button className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white">生徒を追加</button>
            <Link href="/admin/students/bulk" className="rounded-full border border-slate-300 px-4 py-2 text-slate-700">
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
                <th className="px-6 py-3">氏名</th>
                <th className="px-6 py-3">メール</th>
                <th className="px-6 py-3">最終ログイン</th>
                <th className="px-6 py-3">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.email} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                  <td className="px-6 py-4 text-slate-500">{student.email}</td>
                  <td className="px-6 py-4 text-slate-500">{student.lastLogin}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs ${student.status === "有効" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

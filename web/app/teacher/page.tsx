import Link from "next/link";

const stats = [
  { label: "公開授業", value: 24 },
  { label: "今月の学習ログ", value: 132 },
  { label: "小テスト実施", value: 58 },
];

const activities = [
  { label: "CSVインポート (授業)", detail: "成功 15件", time: "10:12" },
  { label: "授業公開: SNSセキュリティ", detail: "公開済みに変更", time: "09:40" },
];

export default function TeacherDashboardPage() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">教師ダッシュボード</p>
            <h1 className="text-3xl font-bold text-slate-900">生徒の状況を俯瞰</h1>
            <p className="mt-2 text-slate-600">概要カードから公開授業・ログ数を確認し、下部のリンクで詳細ページへ遷移します。</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link href="/teacher/subjects" className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white">
              科目利用状況
            </Link>
            <Link href="/teacher/students" className="rounded-full border border-slate-300 px-4 py-2 text-slate-700">
              生徒別利用状況
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-10 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">最近の活動</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {activities.map((activity) => (
              <div key={activity.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{activity.label}</p>
                  <p>{activity.detail}</p>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

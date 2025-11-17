const logs = [
  { subject: "情報リテラシー", lesson: "SNSと個人情報", user: "hanako@example.com", watch: "12分", quiz: "80%" },
  { subject: "理科探究", lesson: "化学反応", user: "taro@example.com", watch: "5分", quiz: "未受験" },
];

export default function HistoryAdminPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-sm text-slate-500">ログ確認</p>
          <h1 className="text-3xl font-bold text-slate-900">利用履歴管理</h1>
          <p className="mt-2 text-slate-600">フィルター: 期間=2024/04/01-2024/04/30、科目=情報リテラシー（UIモック）</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">期間: 今月</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">科目: 情報リテラシー</span>
            </div>
            <div className="flex gap-2 text-sm">
              <button className="rounded-full border border-slate-300 px-4 py-2 text-slate-700">CSVエクスポート</button>
              <button className="rounded-full border border-rose-300 px-4 py-2 text-rose-700">古いログを削除</button>
            </div>
          </div>
          <div className="mt-6 overflow-auto text-sm">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">科目/授業</th>
                  <th className="px-4 py-2">ユーザー</th>
                  <th className="px-4 py-2">視聴時間</th>
                  <th className="px-4 py-2">小テスト</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.lesson} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{log.lesson}</p>
                      <p className="text-xs text-slate-500">{log.subject}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{log.user}</td>
                    <td className="px-4 py-3 text-slate-500">{log.watch}</td>
                    <td className="px-4 py-3 text-slate-500">{log.quiz}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

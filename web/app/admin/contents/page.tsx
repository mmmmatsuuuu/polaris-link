import Link from "next/link";

const tabs = ["動画", "小テスト", "その他教材"];
const contents = [
  { title: "SNS動画01", type: "動画", lesson: "SNSと個人情報", status: "公開" },
  { title: "小テストA", type: "小テスト", lesson: "SNSと個人情報", status: "公開" },
];

export default function ContentAdminPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">管理</p>
            <h1 className="text-3xl font-bold text-slate-900">コンテンツ管理</h1>
            <p className="mt-2 text-slate-600">動画・小テスト・教材をタブで切り替えて確認するUI例です。</p>
          </div>
          <Link href="/admin/contents/bulk" className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700">
            CSV一括登録
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              className={`rounded-full px-4 py-2 text-sm ${index === 0 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {contents.map((content) => (
            <div key={content.title} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs text-slate-500">{content.type} / 授業: {content.lesson}</p>
                  <h2 className="text-xl font-semibold text-slate-900">{content.title}</h2>
                </div>
                <span className="text-sm font-semibold text-emerald-600">{content.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

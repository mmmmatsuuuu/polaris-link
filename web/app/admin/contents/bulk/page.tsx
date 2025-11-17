export default function ContentBulkPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900">コンテンツ一括登録</h1>
        <p className="mt-2 text-slate-600">コンテンツ種別ごとにCSVをアップロードするUI例です。</p>
        <div className="mt-8 space-y-4">
          {["動画", "小テスト", "その他"].map((type) => (
            <div key={type} className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">{type}</p>
              <button className="mt-3 w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                テンプレートをダウンロード
              </button>
              <div className="mt-3 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                CSVをアップロード
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

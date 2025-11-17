export default function UnitBulkPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900">単元一括登録</h1>
        <p className="mt-2 text-slate-600">科目IDと単元情報をCSVで登録するUI例です。</p>
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="space-y-4 text-sm text-slate-600">
            <button className="w-full rounded-full bg-slate-900 px-4 py-2 font-semibold text-white">
              テンプレートをダウンロード
            </button>
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
              CSVをここにドラッグ
            </div>
            <p className="text-xs text-slate-400">エラー時は行番号とメッセージを表示します。</p>
          </div>
        </div>
      </section>
    </main>
  );
}

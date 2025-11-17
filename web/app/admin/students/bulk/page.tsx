export default function StudentBulkPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900">生徒一括登録</h1>
        <p className="mt-2 text-slate-600">氏名・メールアドレス・ステータスをCSVで登録するUI例です。</p>
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <button className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            テンプレートをダウンロード
          </button>
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            CSVをアップロード
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
            成功 20件 / 失敗 1件
          </div>
        </div>
      </section>
    </main>
  );
}

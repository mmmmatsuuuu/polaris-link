const steps = [
  "CSVテンプレートをダウンロード",
  "科目名/説明/公開状態を入力",
  "ファイルをアップロード",
  "結果ログを確認",
];

export default function SubjectBulkPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900">科目一括登録</h1>
        <p className="mt-2 text-slate-600">CSVを使って複数の科目をまとめて登録するUI例です。</p>
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">手順</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="mt-0.5 h-6 w-6 rounded-full bg-slate-900 text-center text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 space-y-3 text-sm">
            <button className="w-full rounded-full bg-slate-900 px-4 py-2 font-semibold text-white">
              テンプレートをダウンロード
            </button>
            <button className="w-full rounded-full border border-dashed border-slate-300 px-4 py-10 text-slate-500">
              ファイルをドラッグ & ドロップ
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

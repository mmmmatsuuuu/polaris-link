export default function LessonBulkPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900">授業一括登録</h1>
        <p className="mt-2 text-slate-600">CSVで授業と紐付け単元を登録するUI例です。</p>
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="space-y-4 text-sm text-slate-600">
            <button className="w-full rounded-full bg-slate-900 px-4 py-2 font-semibold text-white">
              CSVテンプレート
            </button>
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
              ファイルをアップロード
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
              例: 行12 科目IDが存在しません
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

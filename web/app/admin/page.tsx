import Link from "next/link";

const links = [
  { label: "科目管理", href: "/admin/subjects", description: "科目の登録・公開切替" },
  { label: "単元管理", href: "/admin/units", description: "単元の紐付けを編集" },
  { label: "授業管理", href: "/admin/lessons", description: "授業・コンテンツを編集" },
  { label: "コンテンツ管理", href: "/admin/contents", description: "動画・小テスト・教材" },
  { label: "問題管理", href: "/admin/questions", description: "小テスト問題の編集" },
  { label: "生徒管理", href: "/admin/students", description: "生徒の登録/無効化" },
  { label: "利用履歴管理", href: "/admin/history", description: "ログのエクスポート/削除" },
];

export default function AdminHubPage() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-sm text-slate-500">管理メニュー</p>
          <h1 className="text-3xl font-bold text-slate-900">教師向け管理ページ</h1>
          <p className="mt-2 text-slate-600">各カードから個別の管理画面へ遷移します。UIモックのため実際の操作は行えません。</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-10 md:grid-cols-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{link.label}</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{link.description}</p>
            <p className="mt-4 text-sm text-slate-500">一括登録ページも各画面から参照できます。</p>
          </Link>
        ))}
      </section>
    </main>
  );
}

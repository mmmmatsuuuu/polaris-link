import Link from "next/link";

const highlights = [
  { title: "公開授業", description: "科目ごとに整理された動画と小テストを自由に閲覧できます。" },
  { title: "学習ログ", description: "登録済みの生徒は視聴状況と小テスト結果を自分のダッシュボードで確認。" },
  { title: "教師管理", description: "教師専用の管理画面から科目・授業・生徒をまとめて更新。" },
];

const heroLinks = [
  { href: "/lessons", label: "授業一覧へ" },
  { href: "/student", label: "生徒ダッシュボード", accent: true },
  { href: "/teacher", label: "教師ダッシュボード" },
  { href: "/admin", label: "管理メニュー" },
];

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-slate-50 to-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-24 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-sky-500">Polaris Link</p>
        <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
          学習コンテンツを公開し、ダッシュボードで進捗を共有するための
          <span className="block text-sky-600">シンプルな教室ポータル</span>
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-slate-600">
          トップページから公開授業を閲覧し、登録済みの生徒はログイン後に進捗記録や小テストを利用できます。
          教師は同じプラットフォームから科目・授業・生徒の管理を行います。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {heroLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                link.accent
                  ? "bg-sky-600 text-white hover:bg-sky-500"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-100 p-6 text-left shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

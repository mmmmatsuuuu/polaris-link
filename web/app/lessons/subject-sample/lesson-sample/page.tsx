import Link from "next/link";

const videos = [
  { title: "動画01: SNSの危険性", duration: "12:34", status: "視聴済み" },
  { title: "動画02: 情報共有のマナー", duration: "08:20", status: "未視聴" },
];

const quizzes = [
  { title: "小テストA", progress: 80, attempts: 2 },
];

const extras = [
  { title: "チェックリスト", type: "PDF", note: "投稿前の確認フロー" },
];

export default function LessonSamplePage() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Link href="/lessons/subject-sample" className="text-sm text-slate-500">
            ← 情報リテラシーに戻る
          </Link>
          <div className="mt-4">
            <p className="text-sm font-semibold text-sky-600">授業</p>
            <h1 className="text-3xl font-bold text-slate-900">SNSと個人情報の守り方</h1>
            <p className="mt-2 text-slate-600">
              SNSで起こりがちな個人情報の拡散事故を事例ベースで学び、安全な投稿方法を考える授業です。
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-wide text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">タグ: 情報モラル</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">公開中</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">動画</h2>
            <span className="text-sm text-slate-500">{videos.length} 本</span>
          </div>
          <div className="mt-4 space-y-3">
            {videos.map((video) => (
              <div key={video.title} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{video.title}</p>
                    <p className="text-sm text-slate-500">{video.duration}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{video.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">小テスト</h2>
            <span className="text-sm text-slate-500">{quizzes.length} 件</span>
          </div>
          <div className="mt-4 space-y-3">
            {quizzes.map((quiz) => (
              <div key={quiz.title} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{quiz.title}</p>
                    <p className="text-sm text-slate-500">正答率 {quiz.progress}%</p>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <span className="text-xs text-slate-500">受験 {quiz.attempts} 回</span>
                    <Link
                      href="/lessons/subject-sample/lesson-sample/quiz"
                      className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold text-white"
                    >
                      小テストへ
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">その他教材</h2>
          <div className="mt-4 space-y-3">
            {extras.map((extra) => (
              <div key={extra.title} className="rounded-2xl border border-slate-100 p-4">
                <p className="font-medium text-slate-900">{extra.title}</p>
                <p className="text-sm text-slate-500">{extra.type} / {extra.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";

const questions = [
  {
    prompt: "SNSに投稿する前に確認すべきことは?",
    choices: ["個人情報が含まれていないか", "写真の色味", "投稿時間"],
  },
  {
    prompt: "パスワードを共有してよい相手は?",
    choices: ["親しい友人", "システム管理者", "誰にも共有しない"],
  },
];

export default function QuizPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <Link href="/lessons/subject-sample/lesson-sample" className="text-sm text-slate-500">
            ← 授業ページに戻る
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">小テスト: SNSセキュリティチェック</h1>
          <p className="mt-2 text-slate-600">
            全5問 / 制限時間 5 分 / 再受験可。下記の「テストを開始」ボタンを押すと、各問題が一覧表示されます。
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-white px-3 py-1">前回正答率 80%</span>
            <span className="rounded-full bg-white px-3 py-1">受験 2 回</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10 space-y-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">テスト開始</p>
              <h2 className="text-xl font-bold text-slate-900">問題一覧</h2>
              <p className="text-sm text-slate-500">このモックでは回答操作は行いません。</p>
            </div>
            <Link
              href="/lessons/subject-sample/lesson-sample/quiz/result"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
            >
              テストを開始（結果ページ例へ）
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.prompt} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">問題 {index + 1}</p>
              <p className="mt-2 text-lg font-medium text-slate-900">{question.prompt}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {question.choices.map((choice) => (
                  <li key={choice} className="rounded-2xl bg-slate-50 px-4 py-2">
                    {choice}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

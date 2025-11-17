import Link from "next/link";

const summary = {
  score: 4,
  total: 5,
  accuracy: 80,
  time: "4分12秒",
};

const questions = [
  {
    prompt: "SNSに投稿する前に確認すべきことは?",
    answer: "個人情報が含まれていないか",
    explanation: "個人情報の公開可否を第三者視点でチェックする。",
    correct: true,
  },
  {
    prompt: "パスワードを共有してよい相手は?",
    answer: "誰にも共有しない",
    explanation: "ID/パスワードは家族間でも共有しない。",
    correct: true,
  },
  {
    prompt: "公開範囲が限定されている投稿は安全か?",
    answer: "キャプチャで拡散されるため油断は禁物",
    explanation: "限定公開でもスクリーンショットで広がることを説明。",
    correct: false,
  },
];

export default function QuizResultPage() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">採点結果</p>
            <h1 className="text-3xl font-bold text-slate-900">SNSセキュリティチェック</h1>
            <p className="mt-1 text-slate-600">受験日時: 2024/04/12 10:00</p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-500 md:items-end">
            <span>正答率 {summary.accuracy}% ({summary.score}/{summary.total})</span>
            <span>所要時間 {summary.time}</span>
            <Link href="/lessons/subject-sample/lesson-sample/quiz" className="text-sky-600">
              再受験する
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10 space-y-6">
        {questions.map((question, index) => (
          <div key={question.prompt} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">問題 {index + 1}</p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  question.correct ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}
              >
                {question.correct ? "正解" : "不正解"}
              </span>
            </div>
            <p className="mt-2 text-lg font-medium text-slate-900">{question.prompt}</p>
            <p className="mt-3 text-sm text-slate-500">あなたの回答: {question.answer}</p>
            <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{question.explanation}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

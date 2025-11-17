const students = [
  { name: "山田 花子", lastActive: "今日", progress: "65%", quizzes: "70%" },
  { name: "佐藤 太郎", lastActive: "昨日", progress: "40%", quizzes: "55%" },
];

const focusStudent = {
  name: "山田 花子",
  logs: [
    { label: "動画視聴", value: "12本" },
    { label: "小テスト", value: "4回" },
  ],
  weakPoints: ["SNSの危険性", "情報モラル"],
};

export default function TeacherStudentUsagePage() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-sm text-slate-500">生徒別</p>
          <h1 className="text-3xl font-bold text-slate-900">個別利用状況</h1>
          <p className="mt-2 text-slate-600">検索・並び替え（UIモック）: 氏名/最終ログイン/学習時間</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">生徒一覧</h2>
          <div className="mt-4 space-y-3 text-sm">
            {students.map((student) => (
              <div key={student.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{student.name}</p>
                  <p className="text-slate-500">最終 {student.lastActive}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>進捗 {student.progress}</p>
                  <p>正答率 {student.quizzes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">詳細ドロワー例</h2>
          <p className="text-sm text-slate-500">選択中: {focusStudent.name}</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {focusStudent.logs.map((log) => (
              <div key={log.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">{log.label}</p>
                <p className="text-lg font-semibold text-slate-900">{log.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">誤答が多い問題</p>
            <ul className="mt-2 list-disc pl-6 text-sm text-slate-600">
              {focusStudent.weakPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

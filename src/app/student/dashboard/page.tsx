import Link from 'next/link';
import SubjectCard from '@/components/student/SubjectCard';

export default function StudentDashboardPage() {
  const dummySubjects = [
    { id: '1', name: '情報I', description: '情報社会の仕組みとデータの活用' },
    { id: '2', name: '情報II', description: 'プログラミングと情報システム' },
    { id: '3', name: '数学A', description: '場合の数と確率、図形の性質' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dummySubjects.map((subject) => (
          <Link key={subject.id} href={`/lessons`}>
            <SubjectCard name={subject.name} description={subject.description} />
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from 'next/link';
import LessonList from '@/components/student/LessonList';

export default function LessonsListPage() {
  const dummyLessons = [
    { id: 'lesson1', name: '情報社会と情報倫理', description: '情報社会における倫理的な課題について学びます。' },
    { id: 'lesson2', name: 'データの表現と処理', description: 'コンピュータ内部でのデータの表現方法と処理について学びます。' },
    { id: 'lesson3', name: 'ネットワークの基礎', description: 'インターネットの仕組みと通信技術の基礎を学びます。' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">授業一覧</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dummyLessons.map((lesson) => (
          <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
            <LessonList name={lesson.name} description={lesson.description} />
          </Link>
        ))}
      </div>
    </div>
  );
}

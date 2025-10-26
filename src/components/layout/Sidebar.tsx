import Link from "next/link";
import { useAuth } from '@/components/auth/AuthProvider';

export function Sidebar() {
  const { user } = useAuth();
  const userRole = user?.role; // Assuming user object has a 'role' property

  return (
    <div className="flex flex-col space-y-4 p-4">
      <Link href="/" className="flex items-center space-x-2 mb-6">
        <span className="font-bold text-lg">Polaris-Link</span>
      </Link>
      <div className="flex-1 flex flex-col space-y-2">
        <h3 className="text-md font-semibold text-gray-700">共通</h3>
        <Link href="/lessons" className="text-gray-600 hover:text-blue-600">授業一覧</Link>

        {userRole === 'student' && (
          <>
            <h3 className="text-md font-semibold text-gray-700 mt-4">生徒用</h3>
            <Link href="/student/dashboard" className="text-gray-600 hover:text-blue-600">ダッシュボード</Link>
            <Link href="/student/analytics" className="text-gray-600 hover:text-blue-600">学習分析</Link>
          </>
        )}

        {userRole === 'teacher' && (
          <> 
            <h3 className="text-md font-semibold text-gray-700 mt-4">教師用</h3>
            <Link href="/teacher/dashboard" className="text-gray-600 hover:text-blue-600">ダッシュボード</Link>
            <Link href="/teacher/subjects" className="text-gray-600 hover:text-blue-600">科目・単元・授業管理</Link>
            <Link href="/teacher/students" className="text-gray-600 hover:text-blue-600">生徒管理</Link>
            <Link href="/teacher/contents" className="text-gray-600 hover:text-blue-600">コンテンツ管理</Link>
            <Link href="/teacher/analytics/students" className="text-gray-600 hover:text-blue-600">生徒利用状況分析</Link>
          </>
        )}
      </div>
    </div>
  );
}

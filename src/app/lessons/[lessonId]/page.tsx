'use client';

import { useState } from 'react';
import ContentPlayerShell from '@/components/content/ContentPlayerShell';
import QuizFormShell from '@/components/content/QuizFormShell';
import MarkdownEditor from '@/components/common/MarkdownEditor';
import PlaygroundModal from '@/components/common/PlaygroundModal';

export default function LessonDetailPage() {
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);

  const dummyContent = {
    id: 'content1',
    type: 'video',
    title: '情報社会と情報倫理の概要',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Example YouTube URL
    description: 'このレッスンでは、情報社会における倫理的な問題と、それらにどう向き合うべきかについて学びます。',
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{dummyContent.title}</h1>
      <p className="mb-4">{dummyContent.description}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="lg:col-span-1">
          <ContentPlayerShell />
          <div className="mt-4">
            <QuizFormShell />
          </div>
        </div>
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-2">Notes</h2>
          <MarkdownEditor />
          <button
            onClick={() => setIsPlaygroundOpen(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Open Playground
          </button>
        </div>
      </div>

      {isPlaygroundOpen && <PlaygroundModal onClose={() => setIsPlaygroundOpen(false)} />}
    </div>
  );
}

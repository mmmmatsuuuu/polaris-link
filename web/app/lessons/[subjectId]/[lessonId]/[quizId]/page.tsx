import { notFound } from "next/navigation";
import { QuizClient } from "./QuizClient";
import { loadQuizContent, loadQuestionsByIds, pickRandomIds } from "./actions";

export default async function QuizPage({
  params,
}: {
  params: { subjectId: string; lessonId: string; quizId: string };
}) {
  const { subjectId, lessonId, quizId } = await params;

  try {
    const { content, questionIds, questionsPerAttempt } = await loadQuizContent(quizId);
    if (content.publishStatus !== "public") notFound();
    // 一旦 metadata の questionIds からサーバ側で抽選
    const selectedQuestionIds = await pickRandomIds(questionIds, questionsPerAttempt || questionIds.length);
    const questions = await loadQuestionsByIds(selectedQuestionIds);

    return (
      <QuizClient content={content} questions={questions} selectedQuestionIds={selectedQuestionIds} />
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}

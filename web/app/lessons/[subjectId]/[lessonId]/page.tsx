import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Section,
  Tabs,
  Text,
} from "@radix-ui/themes";
import { doc, getDoc } from "firebase/firestore";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { HeroSection } from "@/components/ui/HeroSection";
import { CardList } from "@/components/ui/CardList";
import { YoutubePlayer } from "@/components/ui/YoutubePlayer";
import { db } from "@/lib/firebase/server";
import { getContentLabel } from "../../utils";

type ContentItem = {
  id: string;
  type: "video" | "quiz" | "link";
  title: string;
  description: string;
  order: number;
  metadata: Record<string, unknown>;
};

type LessonPageData = {
  subjectName: string;
  unitName: string;
  lesson: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    publishStatus: "public" | "private";
  };
  contents: ContentItem[];
};

async function fetchLessonPageData(subjectId: string, lessonId: string): Promise<LessonPageData> {
  const [subjectSnap, lessonSnap] = await Promise.all([
    getDoc(doc(db, "subjects", subjectId)),
    getDoc(doc(db, "lessons", lessonId)),
  ]);

  if (!subjectSnap.exists() || subjectSnap.data().publishStatus !== "public") {
    notFound();
  }
  if (!lessonSnap.exists() || lessonSnap.data().publishStatus !== "public") {
    notFound();
  }

  const lessonData = lessonSnap.data();
  const unitId = (lessonData.unitId as string | undefined) ?? "";
  const unitSnap = unitId ? await getDoc(doc(db, "units", unitId)) : null;

  if (!unitSnap || !unitSnap.exists()) {
    notFound();
  }
  const unitData = unitSnap.data();
  if (unitData.subjectId !== subjectId) {
    notFound();
  }

  const contentIds = Array.isArray(lessonData.contentIds)
    ? (lessonData.contentIds as string[])
    : [];

  const contents: ContentItem[] = [];
  for (const contentId of contentIds) {
    const contentSnap = await getDoc(doc(db, "contents", contentId));
    if (!contentSnap.exists()) continue;
    const contentData = contentSnap.data();
    if (contentData.publishStatus !== "public") continue;
    contents.push({
      id: contentSnap.id,
      type: contentData.type as ContentItem["type"],
      title: (contentData.title as string) ?? "",
      description: (contentData.description as string) ?? "",
      order:
        typeof contentData.order === "number" ? contentData.order : Number.MAX_SAFE_INTEGER,
      metadata: (contentData.metadata as Record<string, unknown>) ?? {},
    });
  }

  contents.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  return {
    subjectName: (subjectSnap.data().name as string) ?? "",
    unitName: (unitData?.name as string) ?? "",
    lesson: {
      id: lessonSnap.id,
      title: (lessonData.title as string) ?? "",
      description: (lessonData.description as string) ?? "",
      tags: Array.isArray(lessonData.tags) ? (lessonData.tags as string[]) : [],
      publishStatus: (lessonData.publishStatus as "public" | "private") ?? "private",
    },
    contents,
  };
}

export default async function LessonPage({
  params,
}: {
  params: { subjectId: string; lessonId: string };
}) {
  const { subjectId, lessonId } = await params;
  const data = await fetchLessonPageData(subjectId, lessonId);

  const breadcrumbs = [
    { label: "トップ", href: "/" },
    { label: "授業一覧", href: "/lessons" },
    { label: data.subjectName, href: `/lessons/${subjectId}` },
    { label: data.lesson.title },
  ];

  const videos = data.contents.filter((c) => c.type === "video");
  const quizzes = data.contents.filter((c) => c.type === "quiz");
  const links = data.contents.filter((c) => c.type === "link");

  return (
    <Box className="bg-slate-50">
      <Section className="border-b border-slate-200 bg-white px-4">
        <HeroSection
          kicker={<Breadcrumb items={breadcrumbs} />}
          title={data.lesson.title}
          subtitle={data.lesson.description}
          actions={
            <Flex gap="2" wrap="wrap">
              {data.lesson.tags.map((tag) => (
                <Badge key={tag} variant="soft">
                  {tag}
                </Badge>
              ))}
              <Badge variant="soft" color={data.lesson.publishStatus === "public" ? "green" : "gray"}>
                {data.lesson.publishStatus === "public" ? "公開中" : "非公開"}
              </Badge>
            </Flex>
          }
        />
      </Section>

      <Section>
        <Flex direction="column" gap="5" className="mx-auto max-w-5xl">
          <Card variant="classic">
            <Flex justify="between" align="center">
              <Heading size="5">動画</Heading>
              <Text color="gray">{videos.length} 本</Text>
            </Flex>
            {videos.length ? (
              <Tabs.Root defaultValue={videos[0]?.id ?? ""} className="mt-4">
                <Tabs.List>
                  {videos.map((video) => (
                    <Tabs.Trigger key={video.id} value={video.id}>
                      {video.title}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
                {videos.map((video) => {
                  const youtubeVideoId = (video.metadata as { youtubeVideoId?: string }).youtubeVideoId;
                  return (
                    <Tabs.Content key={video.id} value={video.id} className="mt-4">
                      <Card variant="ghost">
                        <Flex
                          direction="column"
                          justify="between"
                          align="start"
                        >
                          <div>
                            <Text weight="medium">{video.title}</Text>
                            <Text size="2" color="gray">
                              {getContentLabel({
                                id: video.id,
                                lessonId: lessonId,
                                type: "video",
                                title: video.title,
                                description: video.description,
                                publishStatus: "public",
                                order: video.order,
                                metadata: video.metadata as any,
                              })}
                            </Text>
                          </div>
                        </Flex>
                        <Box className="mt-4">
                          {youtubeVideoId ? (
                            <YoutubePlayer videoId={youtubeVideoId} title={video.title} />
                          ) : (
                            <Card variant="surface" className="h-64">
                              <Flex align="center" justify="center" className="h-full text-sm text-slate-600">
                                動画IDが未設定です
                              </Flex>
                            </Card>
                          )}
                        </Box>
                      </Card>
                    </Tabs.Content>
                  );
                })}
              </Tabs.Root>
            ) : (
              <Text color="gray" size="2" className="mt-4">
                公開中の動画はありません。
              </Text>
            )}
          </Card>

          <Card variant="classic">
            <Flex justify="between" align="center">
              <Heading size="5">小テスト</Heading>
              <Text color="gray">{quizzes.length} 件</Text>
            </Flex>
            <Box mt="3">
              {quizzes.length ? (
                <CardList
                  items={quizzes.map((quiz) => ({
                    title: <Text weight="medium">{quiz.title}</Text>,
                    description: (
                      <Text size="2" color="gray">
                        {getContentLabel({
                          id: quiz.id,
                          lessonId: lessonId,
                          type: "quiz",
                          title: quiz.title,
                          description: quiz.description,
                          publishStatus: "public",
                          order: quiz.order,
                          metadata: quiz.metadata as any,
                        })}
                      </Text>
                    ),
                    actions: (
                      <Button asChild radius="full">
                        <Link href={`/lessons/${subjectId}/${lessonId}/${quiz.id}`}>
                          小テストへ
                        </Link>
                      </Button>
                    ),
                  }))}
                />
              ) : (
                <Text color="gray" size="2">
                  公開中の小テストはありません。
                </Text>
              )}
            </Box>
          </Card>

          <Card variant="classic">
            <Heading size="5">その他教材</Heading>
            <Box mt="3">
              {links.length ? (
                <CardList
                  columns={{ initial: "1", sm: "2" }}
                  items={links.map((extra) => ({
                    title: <Text weight="medium">{extra.title}</Text>,
                    description: (
                      <Text size="2" color="gray">
                        {extra.description}
                      </Text>
                    ),
                    actions: (
                      <Button asChild radius="full">
                        <Link href={(extra.metadata as { url?: string })?.url ?? "#"} target="_blank">
                          開く
                        </Link>
                      </Button>
                    ),
                  }))}
                />
              ) : (
                <Text color="gray" size="2">
                  公開中の教材はありません。
                </Text>
              )}
            </Box>
          </Card>
        </Flex>
      </Section>
    </Box>
  );
}

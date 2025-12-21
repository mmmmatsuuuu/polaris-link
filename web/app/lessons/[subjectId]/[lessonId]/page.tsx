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
import { TipTapViewer } from "@/components/ui/tiptap";
import type {
  Lesson,
  LessonContent,
  LessonContentType,
  LessonContentMetadata,
  PublishStatus,
  RichTextDoc,
} from "@/types/catalog";

type ContentItem = Pick<LessonContent, "id" | "type" | "title" | "description" | "order" | "metadata">;

type LessonPageData = {
  subjectName: string;
  unitName: string;
  lesson: Pick<Lesson, "id" | "title" | "description" | "tags" | "publishStatus">;
  contents: ContentItem[];
};

function normalizeDoc(value: unknown): RichTextDoc {
  if (value && typeof value === "object" && "type" in value) {
    return value as RichTextDoc;
  }
  const text = typeof value === "string" ? value : "";
  return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] };
}

function docToPlain(value: RichTextDoc): string {
  try {
    const content = (value as any)?.content;
    if (Array.isArray(content)) {
      const texts: string[] = [];
      const walk = (nodes: any[]) => {
        nodes.forEach((node) => {
          if (node?.type === "text" && typeof node.text === "string") {
            texts.push(node.text);
          }
          if (Array.isArray(node?.content)) walk(node.content);
        });
      };
      walk(content);
      if (texts.length) return texts.join(" ");
    }
  } catch {
    /* noop */
  }
  return "";
}

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
      description: normalizeDoc(contentData.description),
      order:
        typeof contentData.order === "number" ? contentData.order : Number.MAX_SAFE_INTEGER,
      metadata: (contentData.metadata as LessonContentMetadata) ?? {},
    });
  }

  contents.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  return {
    subjectName: (subjectSnap.data().name as string) ?? "",
    unitName: (unitData?.name as string) ?? "",
    lesson: {
      id: lessonSnap.id,
      title: (lessonData.title as string) ?? "",
      description: normalizeDoc(lessonData.description),
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
          subtitle={<TipTapViewer value={data.lesson.description} className="tiptap-prose" />}
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
                                tags: [],
                                publishStatus: "public",
                                order: video.order,
                                metadata: video.metadata as any,
                              })}
                            </Text>
                          </div>
                        </Flex>
                        <Box className="mt-4">
                          {youtubeVideoId ? (
                            <YoutubePlayer videoId={youtubeVideoId} title={video.title} autoplay={false} />
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
                          tags: [],
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
                    description: <TipTapViewer value={extra.description} className="tiptap-prose text-sm" />,
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

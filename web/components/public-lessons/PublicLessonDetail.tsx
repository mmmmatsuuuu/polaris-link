"use client";

import Link from "next/link";
import {
  Badge,
  Box,
  Card,
  Flex,
  Grid,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import LoginPrompt from "@/components/LoginPrompt";
import { PublicLesson } from "@/lib/publicContent";

type PublicLessonDetailProps = {
  lesson: PublicLesson;
};

export default function PublicLessonDetail({ lesson }: PublicLessonDetailProps) {
  return (
    <main className="min-h-screen bg-white">
      <Box className="bg-gradient-to-br from-blue-50 to-white">
        <Box className="mx-auto max-w-5xl px-4 py-10">
          <Text size="2" weight="medium">
            <Link href="/lessons">← 公開授業一覧に戻る</Link>
          </Text>
          <Flex gap="3" wrap="wrap" mt="4">
            <Badge size="2" variant="surface" color="blue">
              {lesson.subject}
            </Badge>
            <Badge size="2" variant="surface" color="gray">
              {lesson.unit}
            </Badge>
            <Badge size="2" variant="surface" color="green">
              {lesson.academicYear}年度
            </Badge>
          </Flex>
          <Heading size="9" mt="5">
            {lesson.title}
          </Heading>
          <Text as="p" size="4" color="gray" mt="3" className="max-w-3xl">
            {lesson.description}
          </Text>
          <Flex gap="8" mt="5" wrap="wrap">
            <Box>
              <Text weight="medium" color="gray">
                最終更新
              </Text>
              <Text size="3">{lesson.lastUpdated}</Text>
            </Box>
            <Box>
              <Text weight="medium" color="gray">
                タグ
              </Text>
              <Text size="3">{lesson.tags.join(" / ")}</Text>
            </Box>
          </Flex>
        </Box>
      </Box>

      <Box className="mx-auto max-w-5xl px-4 py-12">
        <section>
          <Heading size="6">コンテンツ概要</Heading>
          <Grid columns={{ initial: "1", md: "3" }} gap="4" mt="4">
            {lesson.highlights.map((content) => (
              <Card key={content.id} variant="classic" size="3">
                <Text size="1" color="blue" weight="medium">
                  {content.meta}
                </Text>
                <Heading size="4" mt="2">
                  {content.title}
                </Heading>
                <Text size="2" color="gray" mt="1">
                  {content.description}
                </Text>
              </Card>
            ))}
          </Grid>
        </section>

        <section className="mt-12">
          <Heading size="6">動画一覧</Heading>
          <Card variant="surface" size="4" mt="4">
            <Flex direction="column" gap="3">
              {lesson.videos.map((video, index) => (
                <Box key={video.id}>
                  {index !== 0 && <Separator my="3" size="4" />}
                  <Flex
                    direction={{ initial: "column", sm: "row" }}
                    align={{ sm: "center" }}
                    justify="between"
                    gap="3"
                  >
                    <Box>
                      <Text weight="medium">{video.title}</Text>
                      <Text size="2" color="gray">
                        {video.description}
                      </Text>
                    </Box>
                    <Text size="2" color="gray">
                      {video.meta}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </Flex>
          </Card>
        </section>

        <section className="mt-12">
          <Heading size="6">小テスト</Heading>
          <Card variant="classic" size="4" mt="4">
            <Flex direction="column" gap="3">
              {lesson.quizzes.map((quiz, index) => (
                <Box key={quiz.id}>
                  {index !== 0 && <Separator my="3" size="4" />}
                  <Flex align="start" justify="between" gap="4">
                    <Box>
                      <Text weight="medium">{quiz.title}</Text>
                      <Text size="2" color="gray">
                        {quiz.description}
                      </Text>
                    </Box>
                    <Badge color="amber">{quiz.meta}</Badge>
                  </Flex>
                </Box>
              ))}
            </Flex>
          </Card>
        </section>

        {lesson.resources.length > 0 && (
          <section className="mt-12">
            <Heading size="6">その他教材</Heading>
            <Card variant="surface" size="3" mt="4">
              <Flex direction="column" gap="3">
                {lesson.resources.map((resource, index) => (
                  <Box key={resource.id}>
                    {index !== 0 && <Separator my="3" size="3" />}
                    <Text size="3" weight="medium">
                      {resource.title}
                    </Text>
                    <Text size="2" color="gray">
                      {resource.description}
                    </Text>
                  </Box>
                ))}
              </Flex>
            </Card>
          </section>
        )}

        <Box mt="8">
          <LoginPrompt />
        </Box>
      </Box>
    </main>
  );
}

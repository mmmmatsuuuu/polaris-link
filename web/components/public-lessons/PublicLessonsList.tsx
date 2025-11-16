"use client";

import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
} from "@radix-ui/themes";
import LoginPrompt from "@/components/LoginPrompt";
import { PublicLesson } from "@/lib/publicContent";

type PublicLessonsListProps = {
  lessons: PublicLesson[];
};

export default function PublicLessonsList({ lessons }: PublicLessonsListProps) {
  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <Flex
        direction="column"
        align="center"
        gap="3"
        className="mx-auto max-w-4xl px-4 text-center"
      >
        <Text size="2" weight="medium" color="blue" className="tracking-[0.35em]">
          PUBLIC LESSONS
        </Text>
        <Heading size="8">公開中の授業コンテンツ</Heading>
        <Text size="4" color="gray">
          ログインしていなくても授業動画や小テストの構成を確認できます。学習ログを残す場合はログインしてください。
        </Text>
      </Flex>

      <Grid
        columns={{ initial: "1", md: "2" }}
        gap="5"
        className="mx-auto mt-8 max-w-5xl px-4"
      >
        {lessons.map((lesson) => (
          <Card key={lesson.id} variant="surface" size="4">
            <Flex gap="2" wrap="wrap">
              <Badge color="blue">{lesson.subject}</Badge>
              <Badge color="gray">{lesson.unit}</Badge>
              <Badge color="green">{lesson.academicYear}年度</Badge>
            </Flex>
            <Heading size="5" mt="3">
              {lesson.title}
            </Heading>
            <Text as="p" size="3" color="gray" mt="2">
              {lesson.summary}
            </Text>
            <Flex gap="6" mt="4">
              <Box>
                <Text weight="medium" size="2" color="gray">
                  更新日
                </Text>
                <Text size="3">{lesson.lastUpdated}</Text>
              </Box>
              <Box>
                <Text weight="medium" size="2" color="gray">
                  タグ
                </Text>
                <Text size="3">{lesson.tags.slice(0, 2).join(" / ")}</Text>
              </Box>
            </Flex>
            <Button asChild size="3" mt="4">
              <Link href={`/lessons/${lesson.id}`}>授業の詳細を見る</Link>
            </Button>
          </Card>
        ))}
      </Grid>

      <Box className="mx-auto mt-10 max-w-4xl px-4">
        <LoginPrompt />
      </Box>
    </main>
  );
}

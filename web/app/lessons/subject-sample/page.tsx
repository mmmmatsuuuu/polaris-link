import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";

const units = [
  {
    name: "デジタル基礎",
    summary: "OSの基本操作とオンライン情報の扱い方を学習。",
    lessons: [
      { title: "授業01: キーボードの使い方", status: "視聴済み", tags: ["動画", "小テスト"] },
      { title: "授業02: クラウド活用", status: "未視聴", tags: ["動画"] },
    ],
  },
  {
    name: "情報モラル",
    summary: "SNSや著作権など情報倫理を扱う単元。",
    lessons: [
      { title: "授業03: SNSと個人情報", status: "進行中", tags: ["動画", "小テスト"] },
      { title: "授業04: 著作権入門", status: "未視聴", tags: ["リンク教材"] },
    ],
  },
];

const breadcrumbs = [
  { label: "授業一覧", href: "/lessons" },
  { label: "情報リテラシー", href: "/lessons/subject-sample" },
];

export default function SubjectSamplePage() {
  return (
    <Box className="bg-white">
      <Section size="3" className="border-b border-slate-100 bg-slate-50">
        <Flex direction="column" gap="3" className="mx-auto max-w-6xl">
          <Flex gap="2" wrap="wrap" className="text-sm text-slate-500">
            {breadcrumbs.map((crumb, index) => (
              <Flex key={crumb.label} align="center" gap="2">
                <Link href={crumb.href} className="text-slate-600 hover:text-slate-900">
                  {crumb.label}
                </Link>
                {index < breadcrumbs.length - 1 && <span>/</span>}
              </Flex>
            ))}
          </Flex>
          <Flex
            direction={{ initial: "column", md: "row" }}
            justify="between"
            align="start"
            gap="4"
          >
            <Flex direction="column" gap="2">
              <Badge color="blue" radius="full">
                科目
              </Badge>
              <Heading size="8">情報リテラシー</Heading>
              <Text color="gray">
                ハードウェア・ソフトウェアの基礎、クラウドサービス、安全な情報の扱い方などを動画と小テストで段階的に学びます。
              </Text>
            </Flex>
            <Flex direction="column" gap="1" align={{ initial: "start", md: "end" }}>
              <Text color="gray">単元数: 2</Text>
              <Text color="gray">公開授業: 4</Text>
              <Text color="gray">最終更新: 2024/04/01</Text>
            </Flex>
          </Flex>
        </Flex>
      </Section>

      <Section size="3">
        <Grid className="mx-auto max-w-6xl" gap="4">
          {units.map((unit) => (
            <Card key={unit.name} variant="classic">
              <Flex justify="between" align="start">
                <div>
                  <Heading size="5">{unit.name}</Heading>
                  <Text color="gray">{unit.summary}</Text>
                </div>
                <Badge variant="soft">授業 {unit.lessons.length}</Badge>
              </Flex>
              <Flex direction="column" gap="3" mt="4">
                {unit.lessons.map((lesson) => (
                  <Card key={lesson.title} variant="surface">
                    <Flex
                      direction={{ initial: "column", md: "row" }}
                      justify="between"
                      align={{ initial: "start", md: "center" }}
                      gap="3"
                    >
                      <div>
                        <Text weight="medium">{lesson.title}</Text>
                        <Flex gap="2" mt="2" wrap="wrap">
                          {lesson.tags.map((tag) => (
                            <Badge key={tag} variant="soft">
                              {tag}
                            </Badge>
                          ))}
                        </Flex>
                      </div>
                      <Flex direction="column" align={{ initial: "start", md: "end" }} gap="2">
                        <Text color="gray">{lesson.status}</Text>
                        <Button asChild radius="full" size="2">
                          <Link href="/lessons/subject-sample/lesson-sample">授業ページへ</Link>
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </Card>
          ))}
        </Grid>
      </Section>
    </Box>
  );
}

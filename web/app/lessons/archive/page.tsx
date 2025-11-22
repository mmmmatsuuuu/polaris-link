import Link from "next/link";
import {
  Badge,
  Box,
  Card,
  Flex,
  Grid,
  Section,
  Text,
} from "@radix-ui/themes";
import { StarIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { HeroSection } from "@/components/ui/HeroSection";

const archivedUnits = [
  {
    name: "未分類授業",
    summary: "科目に紐付いていない授業をまとめて表示します。",
    lessons: [
      { title: "デザイン思考入門", status: "未完了", tags: ["動画", "資料"] },
      { title: "課題解決ワークショップ", status: "完了", tags: ["動画", "小テスト"] },
    ],
  },
];

export default function ArchivePage() {
  const breadcrumbs = [
    { label: "トップ", href: "/" },
    { label: "授業一覧", href: "/lessons" },
    { label: "アーカイブ" },
  ];
  return (
    <Box className="bg-white">
      <Section size="3" className="border-b border-slate-100 bg-slate-50">
        <Flex direction="column" gap="3" className="mx-auto max-w-6xl">
          <Breadcrumb items={breadcrumbs} />
          <HeroSection
            title="アーカイブ授業"
            subtitle="科目・単元に紐付いていない授業をまとめた一覧です。タグや更新日でソートして授業を探せます。"
            actions={
              <Flex gap="2" wrap="wrap">
                <Badge variant="soft">フィルター: 動画</Badge>
                <Badge variant="soft">ソート: 更新日</Badge>
              </Flex>
            }
          />
        </Flex>
      </Section>

      <Section size="3">
        <Grid className="mx-auto max-w-6xl" gap="4">
          {archivedUnits.map((unit) => (
            <Card key={unit.name} variant="ghost">
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
                        <Flex gap="2" align="center">
                          {lesson.status === "完了" ? <StarFilledIcon /> : <StarIcon />}
                          <Text weight="medium">{lesson.title}</Text>
                        </Flex>
                        <Flex gap="2" mt="2" wrap="wrap">
                          {lesson.tags.map((tag) => (
                            <Badge key={tag} variant="soft">
                              {tag}
                            </Badge>
                          ))}
                        </Flex>
                      </div>
                      <Flex direction="column" align={{ initial: "start", md: "end" }} gap="2">
                        <Badge variant="soft" color={lesson.status === "完了" ? "green" : "gray"}>
                          {lesson.status}
                        </Badge>
                        <Link href="/lessons/subject-sample/lesson-sample" className="text-sm text-sky-600">
                          授業ページへ
                        </Link>
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

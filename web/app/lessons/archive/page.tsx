import {
  Badge,
  Box,
  Card,
  Flex,
  Grid,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";

const archivedLessons = [
  {
    title: "デザイン思考入門",
    subject: "未分類",
    tags: ["動画", "資料"],
    updated: "2024/03/01",
  },
  {
    title: "課題解決ワークショップ",
    subject: "未分類",
    tags: ["動画", "小テスト"],
    updated: "2024/02/15",
  },
];

export default function ArchivePage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50">
        <Flex
          direction={{ initial: "column", md: "row" }}
          justify="between"
          align={{ initial: "start", md: "center" }}
          className="mx-auto max-w-5xl"
          gap="4"
        >
          <div>
            <Badge color="blue" radius="full">
              アーカイブ
            </Badge>
            <Heading size="7" mt="2">
              未紐付け授業一覧
            </Heading>
            <Text color="gray">タグや更新日でソートして授業を探せます（UIモックのため動作は固定です）。</Text>
          </div>
          <Flex gap="2" wrap="wrap">
            <Badge variant="soft">フィルター: 動画</Badge>
            <Badge variant="soft">ソート: 更新日</Badge>
          </Flex>
        </Flex>
      </Section>

      <Section>
        <Grid className="mx-auto max-w-5xl" gap="4">
          {archivedLessons.map((lesson) => (
            <Card key={lesson.title} variant="classic">
              <Flex justify="between" align="start" direction={{ initial: "column", md: "row" }} gap="3">
                <div>
                  <Heading size="5">{lesson.title}</Heading>
                  <Text size="2" color="gray">
                    所属: {lesson.subject}
                  </Text>
                  <Flex gap="2" mt="2">
                    {lesson.tags.map((tag) => (
                      <Badge key={tag} variant="soft">
                        {tag}
                      </Badge>
                    ))}
                  </Flex>
                </div>
                <div>
                  <Text size="2" color="gray">
                    更新日 {lesson.updated}
                  </Text>
                  <Text size="2" color="gray">
                    公開状態: 公開
                  </Text>
                </div>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Section>
    </Box>
  );
}

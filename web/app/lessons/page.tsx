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

const subjects = [
  {
    id: "literacy",
    name: "情報リテラシー",
    description: "基本操作から情報モラルまでを網羅した入門コース。",
    units: [
      { name: "デジタル基礎", lessons: 3 },
      { name: "情報モラル", lessons: 2 },
    ],
  },
  {
    id: "science",
    name: "理科探究",
    description: "動画・演習を通じて観察力と考察力を鍛える科目。",
    units: [
      { name: "化学反応", lessons: 4 },
      { name: "生物の仕組み", lessons: 3 },
    ],
  },
  {
    id: "history",
    name: "世界史",
    description: "時代別のストーリーを映像と年表で学ぶ。",
    units: [
      { name: "古代文明", lessons: 2 },
      { name: "近代革命", lessons: 3 },
    ],
  },
];

export default function LessonsPage() {
  return (
    <Box className="bg-slate-50">
      <Section size="3">
        <Card variant="surface" className="mx-auto max-w-6xl">
          <Flex direction="column" gap="3">
            <Badge color="blue" radius="full">
              公開授業カタログ
            </Badge>
            <Heading size="7" className="text-slate-900">
              科目一覧
            </Heading>
            <Text color="gray">
              科目カードをクリックするとサンプルの科目ページに遷移し、さらに授業ページや小テストページへ移動できます。
            </Text>
            <Flex wrap="wrap" gap="2">
              <Badge variant="soft">科目数 3</Badge>
              <Badge variant="soft">単元数 8</Badge>
              <Badge variant="soft">授業数 20</Badge>
            </Flex>
          </Flex>
        </Card>
      </Section>

      <Section size="2">
        <Grid
          columns={{ initial: "1", md: "2" }}
          gap="4"
          className="mx-auto max-w-6xl"
        >
          {subjects.map((subject) => (
            <Card key={subject.id} variant="classic">
              <Flex justify="between" align="center" mb="3">
                <div>
                  <Heading size="5">{subject.name}</Heading>
                  <Text size="2" color="gray">
                    {subject.description}
                  </Text>
                </div>
                <Button asChild variant="soft" radius="full">
                  <Link href="/lessons/subject-sample">詳細</Link>
                </Button>
              </Flex>
              <Flex direction="column" gap="2">
                {subject.units.map((unit) => (
                  <Card key={unit.name} variant="surface">
                    <Flex justify="between">
                      <Text>{unit.name}</Text>
                      <Text color="gray">授業 {unit.lessons}</Text>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section size="2">
        <Card
          variant="surface"
          className="mx-auto max-w-6xl border border-dashed border-slate-300 text-center"
        >
          <Heading size="4">紐付けのない授業も公開中</Heading>
          <Text mt="2" color="gray">
            科目や単元に属していない授業はアーカイブページから検索できます。
          </Text>
          <Button asChild mt="4" radius="full">
            <Link href="/lessons/archive">アーカイブを見る</Link>
          </Button>
        </Card>
      </Section>
    </Box>
  );
}

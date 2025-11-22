import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Section,
  Text,
  Heading,
} from "@radix-ui/themes";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { HeroSection } from "@/components/ui/HeroSection";

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
  const breadcrumbItems = [
    { label: "トップ", href: "/" },
    { label: "授業一覧" },
  ];
  return (
    <Box className="bg-slate-50">
      <Section size="3" className="border-b border-slate-100 bg-white px-4">
        <HeroSection
          kicker={<Breadcrumb items={breadcrumbItems} />}
          title="科目一覧"
          subtitle="科目カードをクリックするとサンプルの科目ページに遷移し、さらに授業ページや小テストページへ移動できます。"
        />
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
                <Button asChild variant="solid" radius="full">
                  <Link href="/lessons/subject-sample">開く</Link>
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
          <Button asChild mt="8" radius="full">
            <Link href="/lessons/archive">アーカイブを見る</Link>
          </Button>
        </Card>
      </Section>
    </Box>
  );
}

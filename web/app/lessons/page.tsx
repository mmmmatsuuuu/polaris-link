import Link from "next/link";
import { Box, Button, Flex, Section, Text, Card, Heading } from "@radix-ui/themes";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { HeroSection } from "@/components/ui/HeroSection";
import { CardList } from "@/components/ui/CardList";

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
        <div className="mx-auto max-w-6xl">
          <CardList
            columns={{ initial: "1", md: "2" }}
            items={subjects.map((subject) => ({
              title: <Text size="5" weight="bold">{subject.name}</Text>,
              description: (
                <Flex direction="column" gap="2">
                  <Text size="2" color="gray">{subject.description}</Text>
                  <Flex direction="column" gap="2">
                    {subject.units.map((unit) => (
                      <Flex key={unit.name} justify="between">
                        <Text>{unit.name}</Text>
                        <Text color="gray">授業 {unit.lessons}</Text>
                      </Flex>
                    ))}
                  </Flex>
                </Flex>
              ),
              actions: (
                <Button asChild variant="solid" radius="full">
                  <Link href="/lessons/subject-sample">開く</Link>
                </Button>
              ),
            }))}
          />
        </div>
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

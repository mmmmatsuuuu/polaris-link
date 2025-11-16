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
import type { SubjectSectionData } from "@/app/lessons/types";
import { formatContentStats, formatYears } from "@/app/lessons/utils";

type SubjectSectionsProps = {
  sections: SubjectSectionData[];
  loading: boolean;
};

export function SubjectSections({ sections, loading }: SubjectSectionsProps) {
  return (
    <section className="bg-white">
      <Box className="mx-auto max-w-6xl px-6 py-12 lg:py-16 space-y-6">
        {sections.map((section) => (
          <SubjectSectionCard key={section.subject.id} section={section} />
        ))}

        {!loading && sections.length === 0 && (
          <Card
            variant="surface"
            className="border border-dashed border-slate-200 bg-slate-50"
          >
            <Box p="5">
              <Heading size="4" className="text-slate-900">
                データが見つかりません
              </Heading>
              <Text as="p" size="2" color="gray" className="mt-2">
                /dummy-data/catalog.json をモックAPI経由で投入してから再読み込みしてください。
              </Text>
            </Box>
          </Card>
        )}
      </Box>
    </section>
  );
}

function SubjectSectionCard({
  section,
}: {
  section: SubjectSectionData;
}) {
  const lessonCount =
    section.units.reduce(
      (total, group) => total + group.lessons.length,
      0,
    ) + section.unassignedLessons.length;

  return (
    <Card className="border border-slate-200 bg-slate-50 shadow-sm">
      <Box p="6">
        <Flex
          direction={{ initial: "column", lg: "row" }}
          justify="between"
          align={{ initial: "start", lg: "center" }}
          gap="4"
        >
          <Box>
            <Text size="2" color="gray" weight="medium" className="uppercase">
              Subject
            </Text>
            <Heading size="6" className="mt-1 text-slate-900">
              {section.subject.name}
            </Heading>
            <Text as="p" size="2" color="gray" className="mt-2 max-w-3xl">
              {section.subject.description}
            </Text>
            <Flex gap="3" wrap="wrap" className="mt-3">
              <Badge variant="outline" color="gray">
                提供年度: {formatYears(section.subject.availableYears)}
              </Badge>
              <Badge variant="outline" color="gray">
                公開状態: {section.subject.publishStatus}
              </Badge>
            </Flex>
          </Box>
          <Flex direction="column" align={{ initial: "start", lg: "end" }} gap="2">
            <Text size="2" color="gray">
              {section.units.length}ユニット / {lessonCount}授業
            </Text>
            <Button variant="outline" color="gray">
              教科トップを見る
            </Button>
          </Flex>
        </Flex>

        <Box className="mt-6 space-y-5">
          {section.units.map((unitGroup) => (
            <Card
              key={unitGroup.unit.id}
              variant="surface"
              className="border border-slate-100 bg-white"
            >
              <Box p="5">
                <Flex
                  direction={{ initial: "column", lg: "row" }}
                  justify="between"
                  gap="3"
                >
                  <Box>
                    <Text size="2" color="gray" weight="medium">
                      Unit
                    </Text>
                    <Heading size="4" className="mt-1 text-slate-900">
                      {unitGroup.unit.name}
                    </Heading>
                    <Text as="p" size="2" color="gray" className="mt-2">
                      {unitGroup.unit.description}
                    </Text>
                  </Box>
                  <Badge color="gray" variant="soft">
                    {unitGroup.lessons.length}件の授業
                  </Badge>
                </Flex>

                <Grid
                  columns={{ initial: "1", lg: "2" }}
                  gap="6"
                  className="mt-4"
                >
                  {unitGroup.lessons.map((lessonCard) => (
                    <LessonSummaryCard
                      key={lessonCard.lesson.id}
                      card={lessonCard}
                    />
                  ))}
                </Grid>
              </Box>
            </Card>
          ))}

          {section.unassignedLessons.length > 0 && (
            <Card variant="surface" className="border border-dashed border-slate-200">
              <Box p="5">
                <Text size="2" weight="medium" className="text-slate-800">
                  ユニット未所属の授業
                </Text>
                <Grid
                  columns={{ initial: "1", lg: "2" }}
                  gap="4"
                  className="mt-4"
                >
                  {section.unassignedLessons.map((lessonCard) => (
                    <LessonSummaryCard
                      key={lessonCard.lesson.id}
                      card={lessonCard}
                    />
                  ))}
                </Grid>
              </Box>
            </Card>
          )}
        </Box>
      </Box>
    </Card>
  );
}

function LessonSummaryCard({
  card,
}: {
  card: SubjectSectionData["units"][number]["lessons"][number];
}) {
  return (
    <Card variant="ghost" className="border border-slate-100 bg-slate-50/80">
      <Box p="4">
        <Flex justify="between" align="center">
          <Text size="1" color="gray">
            {formatYears(card.lesson.availableYears)}
          </Text>
          <Badge color="gray" variant="soft">
            {formatContentStats(card.contents)}
          </Badge>
        </Flex>
        <Heading size="3" className="mt-2 text-slate-900">
          {card.lesson.title}
        </Heading>
        <Text as="p" size="2" color="gray" className="mt-1">
          {card.lesson.description}
        </Text>
        <Flex wrap="wrap" gap="2" className="mt-3">
          {card.lesson.tags.map((tag) => (
            <Badge key={tag} variant="outline" color="gray">
              #{tag}
            </Badge>
          ))}
        </Flex>
        <Flex gap="3" wrap="wrap" className="mt-4">
          <Button size="2" color="gray">
            授業詳細
          </Button>
          <Button size="2" variant="outline" color="gray">
            コンテンツ一覧
          </Button>
        </Flex>
      </Box>
    </Card>
  );
}

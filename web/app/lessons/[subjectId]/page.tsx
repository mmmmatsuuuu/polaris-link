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
  Text,
} from "@radix-ui/themes";
import { StarIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { HeroSection } from "@/components/ui/HeroSection";
import { CardList } from "@/components/ui/CardList";
import { db } from "@/lib/firebase/server";
import { TipTapViewer } from "@/components/ui/tiptap";
import type { Lesson, PublishStatus, Subject, Unit, RichTextDoc } from "@/types/catalog";

type LessonCard = Pick<Lesson, "id" | "title" | "tags" | "publishStatus" | "order">;

type UnitSection = Pick<Unit, "id" | "name" | "description" | "order"> & {
  lessons: LessonCard[];
};

type SubjectPageData = Pick<Subject, "id" | "name" | "description"> & {
  publishStatus?: PublishStatus;
  updatedAt?: string;
  units: UnitSection[];
};

function normalizeDoc(value: unknown): RichTextDoc {
  if (value && typeof value === "object" && "type" in value) {
    return value as RichTextDoc;
  }
  const text = typeof value === "string" ? value : "";
  return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] };
}

function formatDate(value: unknown): string {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    try {
      const date = (value as { toDate: () => Date }).toDate();
      return date.toISOString().slice(0, 10).replace(/-/g, "/");
    } catch (error) {
      console.warn("Date conversion failed", error);
    }
  }
  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10).replace(/-/g, "/");
    }
  }
  return "-";
}

async function fetchSubjectPageData(subjectId: string): Promise<SubjectPageData> {
  const subjectSnap = await getDoc(doc(db, "subjects", subjectId));
  if (!subjectSnap.exists()) {
    notFound();
  }

  const subjectData = subjectSnap.data();
  if (subjectData.publishStatus !== "public") {
    notFound();
  }

  const unitsSnap = await getDocs(
    query(
      collection(db, "units"),
      where("subjectId", "==", subjectId),
      where("publishStatus", "==", "public"),
      orderBy("order"),
      orderBy("name"),
    ),
  );

  const units: UnitSection[] = [];
  for (const unitDoc of unitsSnap.docs) {
    const unitData = unitDoc.data();
    const lessonsSnap = await getDocs(
      query(
        collection(db, "lessons"),
        where("unitId", "==", unitDoc.id),
        where("publishStatus", "==", "public"),
        orderBy("order"),
        orderBy("title"),
      ),
    );

    const lessons: LessonCard[] = lessonsSnap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: (data.title as string) ?? "",
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
        publishStatus: (data.publishStatus as "public" | "private") ?? "private",
        order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
      };
    });

    lessons.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

    units.push({
      id: unitDoc.id,
      name: (unitData.name as string) ?? "",
      description: normalizeDoc(unitData.description),
      lessons,
      order: typeof unitData.order === "number" ? unitData.order : Number.MAX_SAFE_INTEGER,
    });
  }

  units.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  return {
    id: subjectSnap.id,
    name: (subjectData.name as string) ?? "",
    description: normalizeDoc(subjectData.description),
    updatedAt: formatDate(subjectData.updatedAt),
    units,
  };
}

export default async function SubjectPage({
  params,
}: {
  params: { subjectId: string };
}) {
  const { subjectId} = await params;
  const data = await fetchSubjectPageData(subjectId);
  const breadcrumbs = [
    { label: "トップ", href: "/" },
    { label: "授業一覧", href: "/lessons" },
    { label: data.name },
  ];

  const totalLessons = data.units.reduce((sum, unit) => sum + unit.lessons.length, 0);

  return (
    <Box className="bg-white">
      <Section size="3" className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          title={data.name}
          subtitle={<TipTapViewer value={data.description} className="tiptap-prose" />}
          kicker={<Breadcrumb items={breadcrumbs} />}
          actions={
            <Flex direction="column" gap="1" align={{ initial: "start", md: "start" }}>
              <Text color="gray">単元数　: {data.units.length}</Text>
              <Text color="gray">公開授業: {totalLessons}</Text>
              <Text color="gray">最終更新: {data.updatedAt ?? "-"}</Text>
            </Flex>
          }
        />
      </Section>

      <Section size="3">
        <div className="mx-auto max-w-6xl">
          {
            data.units.length === 0
            ?
            (<Text color="gray" className="text-center p-6">公開中の単元はありません。</Text>)
            :
            (
              <CardList
                columns={{ initial: "1", md: "1" }}
                items={data.units.map((unit) => ({
                  title: <Heading size="5">{unit.name}</Heading>,
                  description: <TipTapViewer value={unit.description} className="tiptap-prose text-sm" />,
                  badge: <Badge variant="soft">授業 {unit.lessons.length}</Badge>,
                  meta: (
                    <Flex direction="column" gap="3" mt="2">
                      {unit.lessons.length == 0 
                        ?
                        (<Text color="gray" className="text-center p-6">公開中の授業はありません。</Text>)
                        : 
                        unit.lessons.map((lesson) => (
                        <Card key={lesson.id} variant="surface">
                          <Flex
                            direction={{ initial: "column", md: "row" }}
                            justify="between"
                            align={{ initial: "start", md: "center" }}
                            gap="3"
                          >
                            <div>
                              <Flex gap="2" align="center">
                                {lesson.publishStatus === "public" ? <StarFilledIcon /> : <StarIcon />}
                                <Text weight="medium">{lesson.title}</Text>
                              </Flex>
                              <Flex gap="2" mt="2" wrap="wrap">
                                {(lesson.tags ?? []).map((tag) => (
                                  <Badge key={tag} variant="soft">
                                    {tag}
                                  </Badge>
                                ))}
                              </Flex>
                            </div>
                            <Flex direction="column" align={{ initial: "start", md: "end" }} gap="2">
                              <Button asChild radius="full" size="2">
                                <Link href={`/lessons/${subjectId}/${lesson.id}`}>
                                  授業ページへ
                                </Link>
                              </Button>
                            </Flex>
                          </Flex>
                        </Card>
                      ))}
                    </Flex>
                  ),
                }))}
              />
            )
          }
        </div>
      </Section>
    </Box>
  );
}

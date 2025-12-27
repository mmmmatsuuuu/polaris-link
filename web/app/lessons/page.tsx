import Link from "next/link";
import { Box, Button, Section, Text, Card, Heading } from "@radix-ui/themes";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { HeroSection } from "@/components/ui/HeroSection";
import { CardList } from "@/components/ui/CardList";
import { TipTapViewer } from "@/components/ui/tiptap";
import type { RichTextDoc, Subject } from "@/types/catalog";

type SubjectCard = Pick<Subject, "id" | "name" | "description">;

async function fetchSubjectCards(): Promise<SubjectCard[]> {
  const subjectsSnap = await getDocs(collection(db, "subjects"));

  return subjectsSnap.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: (data.name as string) ?? "",
        description: (data.description as RichTextDoc) ?? { type: "doc", content: [{ type: "paragraph" }] },
        publishStatus: data.publishStatus as string | undefined,
        order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
      };
    })
    .filter((subject) => subject.publishStatus === "public")
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .map(({ id, name, description }) => ({ id, name, description }));
}

export default async function LessonsPage() {
  const subjects = await fetchSubjectCards();

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
          subtitle="科目カードをクリックすると科目ページに遷移し、授業ページや小テストページへ移動できます。"
        />
      </Section>

      <Section size="2">
        <div className="mx-auto max-w-6xl">
          <CardList
            columns={{ initial: "1", md: "2" }}
            items={subjects.map((subject) => ({
              title: <Text size="5" weight="bold">{subject.name}</Text>,
              description: (
                <TipTapViewer value={subject.description} className="tiptap-prose text-sm" />
              ),
              actions: (
                <Button asChild variant="solid" radius="full">
                  <Link href={`/lessons/${ subject.id }`}>開く</Link>
                </Button>
              ),
            }))}
          />
        </div>
      </Section>

      {/* 実装中 */}
      {/* <Section size="2">
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
      </Section> */}
    </Box>
  );
}

import Link from "next/link";
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

const units = [
  { name: "デジタル基礎", subject: "情報リテラシー", lessons: 4, status: "公開" },
  { name: "情報モラル", subject: "情報リテラシー", lessons: 3, status: "公開" },
];

export default function UnitAdminPage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Text color="gray">管理</Text>
            <Heading size="7">単元管理</Heading>
            <Text color="gray">単元と科目・授業の紐付けを編集するUI例です。</Text>
          </div>
          <div className="flex gap-2">
            <Button radius="full">単元を追加</Button>
            <Button asChild radius="full" variant="soft">
              <Link href="/admin/units/bulk">CSV一括登録</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <Card variant="classic" className="mx-auto max-w-6xl">
          <Text color="gray">登録済み単元</Text>
          <div className="mt-4 space-y-3">
            {units.map((unit) => (
              <Card key={unit.name} variant="surface">
                <Heading size="4">{unit.name}</Heading>
                <Text color="gray">科目: {unit.subject}</Text>
                <Flex justify="between" mt="2">
                  <Text color="gray">授業 {unit.lessons}</Text>
                  <Badge variant="soft" color="green">
                    {unit.status}
                  </Badge>
                </Flex>
              </Card>
            ))}
          </div>
        </Card>
      </Section>
    </Box>
  );
}

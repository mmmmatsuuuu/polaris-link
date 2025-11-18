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

const tabs = ["動画", "小テスト", "その他教材"];
const contents = [
  { title: "SNS動画01", type: "動画", lesson: "SNSと個人情報", status: "公開" },
  { title: "小テストA", type: "小テスト", lesson: "SNSと個人情報", status: "公開" },
];

export default function ContentAdminPage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Text color="gray">管理</Text>
            <Heading size="7">コンテンツ管理</Heading>
            <Text color="gray">動画・小テスト・教材をタブで切り替えて確認するUI例です。</Text>
          </div>
          <Button asChild radius="full" variant="soft">
            <Link href="/admin/contents/bulk">CSV一括登録</Link>
          </Button>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-6xl">
          <Flex gap="2" wrap="wrap">
            {tabs.map((tab, index) => (
              <Button key={tab} variant={index === 0 ? "solid" : "soft"}>
                {tab}
              </Button>
            ))}
          </Flex>
          <Flex direction="column" gap="3" mt="4">
            {contents.map((content) => (
              <Card key={content.title} variant="classic">
                <Flex justify="between" align={{ initial: "start", md: "center" }} direction={{ initial: "column", md: "row" }}>
                  <div>
                    <Text size="2" color="gray">
                      {content.type} / 授業: {content.lesson}
                    </Text>
                    <Heading size="4">{content.title}</Heading>
                  </div>
                  <Badge variant="soft" color="green">
                    {content.status}
                  </Badge>
                </Flex>
              </Card>
            ))}
          </Flex>
        </div>
      </Section>
    </Box>
  );
}

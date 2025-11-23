import Link from "next/link";
import {
  Box,
  Section,
  Text,
} from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";
import { CardList } from "@/components/ui/CardList";

const links = [
  { label: "科目管理", href: "/admin/subjects", description: "科目の登録・公開切替" },
  { label: "単元管理", href: "/admin/units", description: "単元の紐付けを編集" },
  { label: "授業管理", href: "/admin/lessons", description: "授業・コンテンツを編集" },
  { label: "コンテンツ管理", href: "/admin/contents", description: "動画・小テスト・教材" },
  { label: "問題管理", href: "/admin/questions", description: "小テスト問題の編集" },
  { label: "生徒管理", href: "/admin/students", description: "生徒の登録/無効化" },
  { label: "利用履歴管理", href: "/admin/history", description: "ログのエクスポート/削除" },
];

export default function AdminHubPage() {
  return (
    <Box className="bg-slate-50">
      <Section className="border-b border-slate-100 bg-white px-4">
        <HeroSection
          kicker={<Text color="gray">管理メニュー</Text>}
          title="教師向け管理ページ"
          subtitle="各カードから個別の管理画面へ遷移します。UIモックのため実際の操作は行えません。"
        />
      </Section>

      <Section>
        <div className="mx-auto max-w-6xl">
          <CardList
            columns={{ initial: "1", md: "2" }}
            items={links.map((link) => ({
              title: (
                <Text size="1" color="gray" className="uppercase tracking-wide">
                  {link.label}
                </Text>
              ),
              description: (
                <Text as="div" size="4" weight="bold">
                  {link.description}
                </Text>
              ),
              meta: (
                <Text size="2" color="gray">
                  一括登録ページも各画面から参照できます。
                </Text>
              ),
              actions: (
                <Link href={link.href} className="text-blue-600 underline">
                  開く
                </Link>
              ),
            }))}
          />
        </div>
      </Section>
    </Box>
  );
}

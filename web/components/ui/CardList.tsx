import { Card, Flex, Grid, Text } from "@radix-ui/themes";
import type { ReactNode } from "react";

type CardListItem = {
  /** カードの見出し */
  title: ReactNode;
  /** 補足説明文 */
  description?: ReactNode;
  /** 右上に置くバッジなど */
  badge?: ReactNode;
  /** 下部に置くメタ情報（例: 更新日や件数など） */
  meta?: ReactNode;
  /** 右下に置くボタン群など */
  actions?: ReactNode;
};

type CardListProps = {
  /** カードに並べるデータ */
  items: CardListItem[];
  /** カラム数（初期: 1、sm:2、md:3） */
  columns?: {
    initial?: string;
    sm?: string;
    md?: string;
    lg?: string;
  };
};

/**
 * コンテンツ概要をカードで一覧表示する共通コンポーネント。
 */
export function CardList({ items, columns }: CardListProps) {
  return (
    <Grid
      columns={{
        initial: columns?.initial ?? "1",
        sm: columns?.sm ?? "2",
        md: columns?.md ?? "3",
        lg: columns?.lg,
      }}
      gap="4"
    >
      {items.map((item, idx) => (
        <Card key={idx} variant="classic">
          <Flex justify="between" align="start" gap="3">
            <Text as="div" size="4" weight="bold">
              {item.title}
            </Text>
            {item.badge}
          </Flex>

          {item.description && (
            <Text as="div" mt="2" color="gray">
              {item.description}
            </Text>
          )}

          {item.meta && (
            <Text as="div" mt="3" size="2" color="gray">
              {item.meta}
            </Text>
          )}

          {item.actions && (
            <Flex mt="3" gap="2" wrap="wrap" justify="end">
              {item.actions}
            </Flex>
          )}
        </Card>
      ))}
    </Grid>
  );
}

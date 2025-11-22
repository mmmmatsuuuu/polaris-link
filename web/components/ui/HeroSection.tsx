import { Flex, Heading, Text, Box } from "@radix-ui/themes";
import type { ReactNode } from "react";

type HeroSectionProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  kicker?: ReactNode; // セクション上部に置く小さなラベルやバッジ（例: カテゴリ名）
  actions?: ReactNode; // CTAやフィルタなど、見出し周りに配置したいボタン群
  align?: "left" | "center";
  /** 追加コンテンツを挿入したい場合に利用 */
  children?: ReactNode;
  /** レイアウト幅の微調整用。例: `max-w-6xl` など */
  maxWidthClassName?: string;
};

type AlignProps = {
  align: "start" | "center" | "end";
  textAlign: "left" | "center" | "right";
};
/**
 * ヒーロー/セクションの見出しを統一するための薄いラッパー。
 * ボタンやバッジを actions/kicker で受け取り、自由配置したい要素は children で拡張する。
 */
export function HeroSection({
  title,
  subtitle,
  kicker,
  actions,
  align = "left",
  children,
  maxWidthClassName = "max-w-6xl",
}: HeroSectionProps) {
  const alignProps:AlignProps = align === "center" ? { align: "center", textAlign: "center" as const } : { align: "start", textAlign: "left" as const };

  return (
    <Box className={`mx-auto ${maxWidthClassName}`}>
      <Flex direction="column" gap="3" align={alignProps.align} className="w-full">
        {kicker && (
          <Text size="2" color="gray" className="uppercase tracking-wide">
            {kicker}
          </Text>
        )}
        <Heading size="8" align={alignProps.textAlign} className="text-slate-900">
          {title}
        </Heading>
        {subtitle && (
          <Text size="3" color="gray" align={alignProps.textAlign}>
            {subtitle}
          </Text>
        )}
        {actions && (
          <Flex gap="3" justify={align === "center" ? "center" : "start"} wrap="wrap">
            {actions}
          </Flex>
        )}
        {children}
      </Flex>
    </Box>
  );
}

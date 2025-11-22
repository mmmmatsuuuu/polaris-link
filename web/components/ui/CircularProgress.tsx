import { Flex, Text } from "@radix-ui/themes";

type CircularProgressProps = {
  value: number;
  label?: string;
  color?: string;
  size?: number; // px
};

/**
 * 円形の進捗表示。conic-gradientでシンプルに表現する軽量版。
 */
export function CircularProgress({
  value,
  label,
  color = "#0ea5e9",
  size = 64,
}: CircularProgressProps) {
  const normalized = Math.max(0, Math.min(100, value));
  const innerSize = size * 0.75;

  return (
    <Flex direction="column" align="center" gap="1">
      <div
        className="relative"
        style={{ width: size, height: size }}
        aria-label={label}
        role="img"
      >
        <div className="absolute inset-0 rounded-full bg-slate-100" />
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `conic-gradient(${color} ${normalized}%, #e2e8f0 ${normalized}% 100%)` }}
        />
        <div
          className="absolute flex items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700"
          style={{ inset: (size - innerSize) / 2, width: innerSize, height: innerSize }}
        >
          {normalized}%
        </div>
      </div>
      {label && (
        <Text size="1" color="gray">
          {label}
        </Text>
      )}
    </Flex>
  );
}

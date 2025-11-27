"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Flex, Text } from "@radix-ui/themes";

type TimerProps = {
  className?: string;
  /** 計測開始時刻（ミリ秒）。未指定ならマウント時に開始。 */
  startAt?: number;
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

/**
  * 経過時間を表示するタイマー。
  */
export function Timer({ className, startAt }: TimerProps) {
  const [now, setNow] = useState<number>(() => Date.now());
  const baseRef = useRef<number>(startAt ?? Date.now());

  useEffect(() => {
    if (typeof startAt === "number") {
      baseRef.current = startAt;
    }
  }, [startAt]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = formatDuration(now - baseRef.current);

  const wrapperClass = ["fixed right-4 top-4 z-50 pointer-events-none", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClass}>
      <Card variant="surface" className="pointer-events-auto shadow-md">
        <Flex direction="column" gap="1" align="start" className="py-2 px-6">
          <Text size="1" color="gray">
            経過時間
          </Text>
          <Text size="4" weight="bold" className="tabular-nums">
            {elapsed}
          </Text>
        </Flex>
      </Card>
    </div>
  );
}

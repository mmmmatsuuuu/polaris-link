"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { Button, Flex, Text } from "@radix-ui/themes";

type CopyButtonProps = {
  value: string;
  label?: string;
};

export function CopyButton({
  value,
  label = "IDをコピー",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Button size="1" variant="soft" onClick={() => void handleCopy()}>
      <Flex align="center" gap="2">
        {copied ? <CheckIcon /> : <CopyIcon />}
        <Text size="1">{label}</Text>
      </Flex>
    </Button>
  );
}

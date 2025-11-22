"use client";
import Link from "next/link";
import {
  Box,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
} from "@radix-ui/themes";
import { HamburgerMenuIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Menu } from "../ui/DropdownMenu";
import { useThemeAppearance } from "@/components/providers/RadixThemeProvider";

export function AppHeader() {
  const { appearance, toggleAppearance } = useThemeAppearance();
  return (
    <Box className="sticky top-0 z-50 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
      <Flex align="center" justify="between" className="mx-auto max-w-6xl">
        <Flex align="center" gap="3">
          <Link href="/">
            <Heading size="6" className="text-slate-900">
              Polaris Link
            </Heading>
          </Link>
        </Flex>
        <Flex gap="3" align="center">
          <IconButton
            radius="full"
            variant="soft"
            aria-label="テーマを切り替える"
            onClick={toggleAppearance}
          >
            {appearance === "light" ? <MoonIcon /> : <SunIcon />}
          </IconButton>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <IconButton
                className="md:hidden"
                radius="full"
                aria-label="メニューを開く"
              >
                <HamburgerMenuIcon />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content sideOffset={8} align="start">
              <Menu />
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Flex>
    </Box>
  );
}

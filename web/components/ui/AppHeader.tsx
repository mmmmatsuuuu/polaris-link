"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
} from "@radix-ui/themes";
import { HamburgerMenuIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { NavMenu } from "./NavMenu";
import { useThemeAppearance } from "@/components/providers/RadixThemeProvider";
import LoginPrompt from "@/components/LoginPrompt";
import { useAuth } from "@/context/AuthProvider";

export function AppHeader() {
  const { appearance, toggleAppearance } = useThemeAppearance();
  const { user, loading } = useAuth();

  return (
    <Box className="sticky top-0 z-50 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
      <Flex align="center" justify="between" className="mx-auto max-w-6xl">
          <Link href="/">
            <Flex align="center" gap="3">
              <Image src="/icon.svg" alt="Polaris Linkのアイコン" width={32} height={32} />
              <Heading size="4" className="text-slate-900 uppercase tracking-wide">
                Polaris Link
              </Heading>
            </Flex>
        </Link>
        <Flex gap="3" align="center">
          <IconButton
            radius="full"
            variant="soft"
            aria-label="テーマを切り替える"
            onClick={toggleAppearance}
            >
            {appearance === "light" ? <MoonIcon /> : <SunIcon />}
          </IconButton>
          {!loading && !user && (
            <LoginPrompt variant="button" redirectOnLogin={false} />
          )}
          {user && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <IconButton
                  className="md:hidden"
                  radius="full"
                  aria-label="メニューを開く"
                >
                  <HamburgerMenuIcon />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content sideOffset={8} align="end" className="w-[240px]">
                <NavMenu />
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

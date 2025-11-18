import Link from "next/link";
import {
  Box,
  Button,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
} from "@radix-ui/themes";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { AppSidebar } from "./DropdownMenu";

export function AppHeader() {
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
              <AppSidebar />
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Flex>
    </Box>
  );
}

"use client";

import { Theme } from "@radix-ui/themes";

type RadixThemeProviderProps = {
  children: React.ReactNode;
};

export default function RadixThemeProvider({ children }: RadixThemeProviderProps) {
  return (
    <Theme appearance="light" accentColor="blue" grayColor="slate" radius="large">
      {children}
    </Theme>
  );
}

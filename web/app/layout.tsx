import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import RadixThemeProvider from "@/components/providers/RadixThemeProvider";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = {
  title: "Polaris Link",
  description: "Learning platform mock UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <RadixThemeProvider>
          <AuthProvider>
            <AppHeader />
            {children}
          </AuthProvider>
        </RadixThemeProvider>
      </body>
    </html>
  );
}

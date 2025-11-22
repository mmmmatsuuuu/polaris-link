import Link from "next/link";
import {
  DropdownMenu,
} from "@radix-ui/themes";

const studentLinks = [
  { href: "/lessons", label: "授業一覧" },
  { href: "/student", label: "生徒ページ" },
];

const teacherLinks = [
  { href: "/lessons", label: "授業一覧" },
  { href: "/student", label: "生徒ページ" },
  { href: "/teacher", label: "教師ページ" },
  { href: "/admin", label: "管理ページ" },
];

export function Menu() {
  return (
    <>
      <NavSection title="生徒" links={studentLinks} />
      <DropdownMenu.Separator />
      <NavSection title="教師" links={teacherLinks} />
      <DropdownMenu.Separator />
      <DropdownMenu.Item asChild>
        <Link href="/">ログアウト</Link>
      </DropdownMenu.Item>
    </>
  );
}

function NavSection({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <>
      <DropdownMenu.Label>{title}</DropdownMenu.Label>
      {links.map((link) => (
        <DropdownMenu.Item key={link.href} asChild>
          <Link href={link.href}>{link.label}</Link>
        </DropdownMenu.Item>
      ))}
    </>
  );
}

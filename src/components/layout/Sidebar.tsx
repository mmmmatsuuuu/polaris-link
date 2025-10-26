import Link from "next/link";

export function Sidebar() {
  return (
    <div className="flex flex-col space-y-4">
      <Link href="/" className="flex items-center space-x-2">
        <span className="font-bold">Polaris-Link</span>
      </Link>
      <div className="flex-1">
        {/* TODO: Add navigation links here */}
        <p className="text-sm text-muted-foreground">Navigation</p>
      </div>
    </div>
  );
}

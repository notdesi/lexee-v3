import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace · Lexee",
  description: "Track open tasks and follow-ups across your matters.",
};

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

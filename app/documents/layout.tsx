import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents · Lexee",
  description: "Browse and manage matter documents.",
};

export default function DocumentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

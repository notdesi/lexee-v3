import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search · Lexee",
  description: "Search across projects, skills, and chat history.",
};

export default function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cases · Lexee",
  description: "Browse leads, intakes, and matters.",
};

export default function CasesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

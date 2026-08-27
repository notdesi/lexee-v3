import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artifacts · Lexee",
  description: "Browse, filter, and review this matter's artifacts.",
};

export default function ArtifactsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

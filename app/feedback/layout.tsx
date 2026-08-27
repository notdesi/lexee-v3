import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & Feedback · Lexee",
  description:
    "Ask about Lexee's capabilities, get help with something you're stuck on, or share feedback with the product team.",
};

export default function FeedbackLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

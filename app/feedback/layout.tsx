import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share Feedback · Lexee",
  description:
    "Tell us how you're using Lexee, what's working, and what you wish it could do.",
};

export default function FeedbackLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

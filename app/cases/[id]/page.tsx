import { Suspense } from "react";
import { CaseDetailClient } from "@/components/CaseDetailClient";
import { CaseDetailLoadingSkeleton } from "@/components/RouteSkeletons";
import { CASES } from "@/lib/cases";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<CaseDetailLoadingSkeleton />}>
      <CaseDetailClient caseId={id} />
    </Suspense>
  );
}

export function generateStaticParams() {
  return CASES.map((record) => ({
    id: record.id,
  }));
}

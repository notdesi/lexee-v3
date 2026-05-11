import type { DocumentPreview } from "@/components/DocumentPreviewPanel";
import { SAMPLE_DOCUMENT_PREVIEW } from "@/lib/sample-document-preview";

const SOURCE_LIST_LENGTH = 25;

export const MEDICAL_SUMMARY_SOURCE_COUNT = SOURCE_LIST_LENGTH;

export const MEDICAL_SUMMARY_SOURCE_DOCUMENTS: DocumentPreview[] = Array.from(
  { length: SOURCE_LIST_LENGTH },
  () => ({ ...SAMPLE_DOCUMENT_PREVIEW }),
);

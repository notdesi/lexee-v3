import type { DocumentPreview } from "@/components/DocumentPreviewPanel";
import {
  pickUniqueDocumentNames,
  SAMPLE_DOCUMENT_PREVIEW_BASE,
} from "@/lib/document-preview-names";

const SOURCE_LIST_LENGTH = 25;

export const MEDICAL_SUMMARY_SOURCE_COUNT = SOURCE_LIST_LENGTH;

export const MEDICAL_SUMMARY_SOURCE_DOCUMENTS: DocumentPreview[] = pickUniqueDocumentNames(
  SOURCE_LIST_LENGTH,
).map((title) => ({
  ...SAMPLE_DOCUMENT_PREVIEW_BASE,
  title,
}));

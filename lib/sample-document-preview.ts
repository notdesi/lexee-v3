import type { DocumentPreview } from "@/components/DocumentPreviewPanel";
import { createSampleDocumentPreview } from "@/lib/document-preview-names";

/** Single sample PDF used for every document preview flow in the prototype. */
export const SAMPLE_DOCUMENT_PREVIEW: DocumentPreview = createSampleDocumentPreview();

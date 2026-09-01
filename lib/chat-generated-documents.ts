import type { DocumentPreview } from "@/components/DocumentPreviewPanel";
import { createSampleDocumentPreview } from "@/lib/document-preview-names";

export type ChatGeneratedDocumentSource = {
  generatedDocument?: DocumentPreview;
  presentation?: string;
};

export function createSummonsGeneratedDocument(matterName?: string | null): DocumentPreview {
  return createSampleDocumentPreview({
    title: matterName ? `Summons for ${matterName}` : "Summons",
    format: "PDF",
    editable: true,
    isLexeeGenerated: true,
  });
}

export function createMedicalSummaryGeneratedDocument(): DocumentPreview {
  return createSampleDocumentPreview({
    title: "Medical Summary",
    subtitle: "Lexee generated",
    editable: true,
    isLexeeGenerated: true,
  });
}

export function createDemandLetterGeneratedDocument(): DocumentPreview {
  return createSampleDocumentPreview({
    title: "Demand letter draft",
    subtitle: "Lexee generated",
    editable: true,
    isLexeeGenerated: true,
  });
}

export function documentFromChatMessage(
  message: ChatGeneratedDocumentSource,
  options?: { matterName?: string | null },
): DocumentPreview | null {
  if (message.generatedDocument) return message.generatedDocument;

  switch (message.presentation) {
    case "summons_document_demo":
      return createSummonsGeneratedDocument(options?.matterName);
    case "medical_summary_demo":
      return createMedicalSummaryGeneratedDocument();
    case "demand_letter_demo":
      return createDemandLetterGeneratedDocument();
    default:
      return null;
  }
}

export function collectGeneratedDocuments(
  messages: ChatGeneratedDocumentSource[],
  options?: { matterName?: string | null },
): DocumentPreview[] {
  const documents: DocumentPreview[] = [];
  for (const message of messages) {
    const document = documentFromChatMessage(message, options);
    if (document) documents.push(document);
  }
  return documents;
}

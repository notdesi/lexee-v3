import type { DocumentPreview } from "@/components/DocumentPreviewPanel";
import { createSampleDocumentPreview } from "@/lib/document-preview-names";

export type ChatGeneratedDocumentSource = {
  generatedDocument?: DocumentPreview;
  presentation?: string;
};

export function createSummonsGeneratedDocument(matterName?: string | null): DocumentPreview {
  return createSampleDocumentPreview({
    title: matterName ? `Summons for ${matterName}` : "Summons",
    subtitle: "PDF Document",
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

export function documentFromChatMessage(message: ChatGeneratedDocumentSource): DocumentPreview | null {
  if (message.generatedDocument) return message.generatedDocument;

  switch (message.presentation) {
    case "summons_document_demo":
      return createSummonsGeneratedDocument();
    case "medical_summary_demo":
      return createMedicalSummaryGeneratedDocument();
    case "demand_letter_demo":
      return createDemandLetterGeneratedDocument();
    default:
      return null;
  }
}

export function collectGeneratedDocuments(messages: ChatGeneratedDocumentSource[]): DocumentPreview[] {
  const documents: DocumentPreview[] = [];
  for (const message of messages) {
    const document = documentFromChatMessage(message);
    if (document) documents.push(document);
  }
  return documents;
}

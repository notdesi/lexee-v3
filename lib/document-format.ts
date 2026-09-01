export type DocumentFormatKind = "pdf" | "doc" | "xls" | "txt" | "csv" | "ppt" | "other";

export type DocumentFormatStyle = {
  kind: DocumentFormatKind;
  label: string;
};

const FORMAT_LABELS: Record<DocumentFormatKind, string> = {
  pdf: "PDF",
  doc: "DOC",
  xls: "XLS",
  txt: "TXT",
  csv: "CSV",
  ppt: "PPT",
  other: "FILE",
};

const SIZE_CLASS = {
  sm: "text-[11px] leading-4",
  md: "text-[12px] leading-4",
  lg: "text-[13px] leading-5",
} as const;

export function normalizeDocumentFormat(input: string): DocumentFormatKind {
  const normalized = input.trim().toLowerCase().replace(/\s+document$/i, "");

  if (normalized.includes("pdf")) return "pdf";
  if (normalized.includes("doc")) return "doc";
  if (normalized.includes("xls") || normalized.includes("sheet")) return "xls";
  if (normalized.includes("csv")) return "csv";
  if (normalized.includes("ppt") || normalized.includes("powerpoint")) return "ppt";
  if (normalized.includes("txt") || normalized.includes("text")) return "txt";

  return "other";
}

export function getDocumentFormatStyle(input: string): DocumentFormatStyle {
  const kind = normalizeDocumentFormat(input);
  return { kind, label: FORMAT_LABELS[kind] };
}

export function getDocumentFormatSizeClass(size: keyof typeof SIZE_CLASS): string {
  return SIZE_CLASS[size];
}

export function isDocumentFormatSubtitle(subtitle: string): boolean {
  const trimmed = subtitle.trim();
  if (!trimmed) return false;
  return /^(pdf|docx?|xlsx?|txt|csv|pptx?)(\s+document)?$/i.test(trimmed);
}

export function inferDocumentFormat(input?: string | null): string | null {
  if (!input?.trim()) return null;
  if (isDocumentFormatSubtitle(input)) return input;
  const kind = normalizeDocumentFormat(input);
  return kind === "other" ? null : getDocumentFormatStyle(input).label;
}

import type { DocumentPreview } from "@/components/DocumentPreviewPanel";

/** Prototype document titles shown in the right-hand preview panel. */
export const LEGAL_MEDICAL_DOCUMENT_NAMES = [
  "Emergency Room Intake Report",
  "EMS Run Sheet — Motor Vehicle Collision",
  "Cervical Spine MRI Report",
  "Lumbar MRI Radiologist Impression",
  "Orthopedic Consultation Note",
  "Pain Management Treatment Plan",
  "Physical Therapy Progress Notes",
  "Hospital Discharge Summary",
  "Operative Complaint — Personal Injury",
  "Summons and Complaint",
  "Affidavit of Service",
  "Notice of Deposition Duces Tecum",
  "Interrogatories — Set One",
  "Request for Production of Documents",
  "Motion to Compel Discovery",
  "Subpoena for Medical Records",
  "HIPAA Authorization — Medical Release",
  "Independent Medical Examination Report",
  "Billing Ledger — Metro Health",
  "Radiology Facility Itemized Statement",
  "Pharmacy Dispensing Record",
  "Chiropractic Treatment Record",
  "Neurology Follow-Up Visit Note",
  "Case Management Intake Summary",
  "Demand Letter — Liability Carrier",
  "Settlement Conference Memorandum",
  "Nursing Triage Assessment",
  "Ambulance Patient Care Report",
  "Functional Capacity Evaluation",
  "Life Care Plan — Draft Exhibit",
  "Deposition Transcript Excerpt",
  "Expert Witness Disclosure",
  "Certificate of Merit — Surgery",
  "Prior Medical History Questionnaire",
  "Workers Compensation IME Addendum",
] as const;

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandomDocumentName(): string {
  const index = Math.floor(Math.random() * LEGAL_MEDICAL_DOCUMENT_NAMES.length);
  return LEGAL_MEDICAL_DOCUMENT_NAMES[index] ?? "Medical Records Production";
}

export function pickUniqueDocumentNames(count: number): string[] {
  const shuffled = shuffle(LEGAL_MEDICAL_DOCUMENT_NAMES) as string[];
  if (count <= shuffled.length) {
    return shuffled.slice(0, count);
  }
  const names: string[] = [...shuffled];
  while (names.length < count) {
    names.push(`${pickRandomDocumentName()} (${names.length + 1})`);
  }
  return names;
}

export const SAMPLE_DOCUMENT_PREVIEW_BASE: Omit<DocumentPreview, "title"> = {
  subtitle: "PDF Document",
  body: "",
  src: "/sampledocument.pdf",
};

export function createSampleDocumentPreview(
  overrides?: Partial<DocumentPreview>,
): DocumentPreview {
  return {
    title: overrides?.title ?? pickRandomDocumentName(),
    ...SAMPLE_DOCUMENT_PREVIEW_BASE,
    ...overrides,
  };
}

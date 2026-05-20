/**
 * Demo assistant content for the Medical Summary skill prototype.
 * Plain semantic HTML only — no icons or emoji.
 */
import { CitationPill } from "@/components/CitationPill";
import { SourcesPill } from "@/components/SourcesPill";
import type { DocumentPreview } from "@/components/DocumentPreviewPanel";
import {
  MEDICAL_SUMMARY_SOURCE_COUNT,
  MEDICAL_SUMMARY_SOURCE_DOCUMENTS,
} from "@/lib/medical-summary-source-documents";
import { createSampleDocumentPreview } from "@/lib/document-preview-names";

type MedicalSummaryDemoResponseProps = {
  onCitationClick?: (docs: DocumentPreview[], collectionTitle: string, collectionSubtitle?: string) => void;
  onSourcesClick?: (docs: DocumentPreview[], collectionTitle: string, collectionSubtitle?: string) => void;
};

export function MedicalSummaryDemoResponse({ onCitationClick, onSourcesClick }: MedicalSummaryDemoResponseProps) {
  return (
    <article className="w-full text-response-md text-neutral-950">
      <h2 className="font-spectral text-[18px] font-semibold leading-snug tracking-tight text-neutral-950">
        MEDICAL SUMMARY
      </h2>

      <div className="mt-3 space-y-1">
        <p>
          <span className="font-medium">Plaintiff:</span> Tyler Durden
        </p>
        <p>
          <span className="font-medium">Date of Loss:</span> January 14, 2026
        </p>
        <p>
          <span className="font-medium">Type of Incident:</span> Motor Vehicle Accident
        </p>
      </div>

      <hr className="my-5 border-neutral-300" />

      <section className="space-y-3">
        <h3 className="font-spectral text-[17px] font-semibold leading-snug text-neutral-950">
          Accident Description
        </h3>
        <p className="text-neutral-950">
          On January 14, 2026, Plaintiff Tyler Durden was involved in a motor vehicle accident in which
          his vehicle was rear-ended while stopped in traffic. Following the collision, Plaintiff
          immediately developed complaints of neck pain, lower back pain, headaches, dizziness, and left
          shoulder pain. Emergency medical services responded to the scene, and Plaintiff was transported
          to the emergency department for further evaluation and treatment.
        </p>
        <CitationPill
          label="Citation: EMS report • ER intake note"
          onClick={() =>
            onCitationClick?.(
              [createSampleDocumentPreview()],
              "Accident Description",
              "Source documents for accident description",
            )
          }
        />
      </section>

      <hr className="my-5 border-neutral-300" />

      <section className="space-y-3">
        <h3 className="font-spectral text-[17px] font-semibold leading-snug text-neutral-950">
          Initial Emergency Treatment
        </h3>
        <p className="text-neutral-950">
          Plaintiff presented to the emergency department with complaints of:
        </p>
        <ul className="list-disc space-y-1 pl-6 text-neutral-950">
          <li>Cervical neck pain and stiffness</li>
          <li>Lumbar back pain</li>
          <li>Headaches</li>
          <li>Dizziness</li>
          <li>Left shoulder discomfort</li>
        </ul>
        <p className="text-neutral-950">
          Physical examination revealed cervical and lumbar tenderness, muscle spasms, and decreased range
          of motion. Diagnostic imaging, including CT scans and X-rays, was performed and showed no acute
          fractures or intracranial injuries. Plaintiff was diagnosed with:
        </p>
        <ul className="list-disc space-y-1 pl-6 text-neutral-950">
          <li>Cervical strain/sprain (whiplash injury)</li>
          <li>Lumbar strain/sprain</li>
          <li>Post-traumatic headaches</li>
          <li>Left shoulder strain</li>
        </ul>
        <p className="text-neutral-950">
          Plaintiff was prescribed pain medication and muscle relaxants and discharged with instructions to
          seek follow-up medical care.
        </p>
        <CitationPill
          label="Citation: ER visit summary • CT/X‑ray results"
          onClick={() =>
            onCitationClick?.(
              [createSampleDocumentPreview()],
              "Initial Emergency Treatment",
              "Source documents for initial ER care",
            )
          }
        />
      </section>

      <hr className="my-5 border-neutral-300" />

      <section className="space-y-3">
        <h3 className="font-spectral text-[17px] font-semibold leading-snug text-neutral-950">
          Follow-Up Medical Care
        </h3>
        <p className="text-neutral-950">
          Following the accident, Plaintiff continued to experience persistent pain and functional
          limitations. Plaintiff reported ongoing:
        </p>
        <ul className="list-disc space-y-1 pl-6 text-neutral-950">
          <li>Neck stiffness and pain</li>
          <li>Lower back pain radiating into the left leg</li>
          <li>Intermittent numbness and tingling</li>
          <li>Headaches</li>
          <li>Difficulty sleeping</li>
          <li>Pain with prolonged sitting, standing, and driving</li>
        </ul>
        <p className="text-neutral-950">
          Due to continued symptoms, Plaintiff underwent MRI imaging of the cervical and lumbar spine.
        </p>
        <CitationPill
          label="Citation: PT notes • Follow‑up visit notes"
          onClick={() =>
            onCitationClick?.(
              [createSampleDocumentPreview()],
              "Follow‑Up Medical Care",
              "Progress notes supporting follow‑up care",
            )
          }
        />
      </section>

      <hr className="my-5 border-neutral-300" />

      <section className="space-y-3">
        <h3 className="font-spectral text-[17px] font-semibold leading-snug text-neutral-950">MRI Findings</h3>
        <ul className="list-disc space-y-1 pl-6 text-neutral-950">
          <li>Disc bulge at C5-C6 with mild foraminal narrowing</li>
          <li>Disc protrusion at L4-L5</li>
          <li>Annular tear at L5-S1</li>
          <li>Straightening of cervical lordosis consistent with muscle spasm</li>
        </ul>
        <CitationPill
          label="Citation: Cervical MRI • Lumbar MRI"
          onClick={() =>
            onCitationClick?.([createSampleDocumentPreview()], "MRI Findings", "Imaging reports supporting MRI findings")
          }
        />
      </section>

      <hr className="my-5 border-neutral-300" />

      <section className="space-y-3">
        <h3 className="font-spectral text-[17px] font-semibold leading-snug text-neutral-950">
          Conservative Treatment
        </h3>
        <p className="text-neutral-950">Plaintiff participated in a course of conservative treatment, including:</p>
        <ul className="list-disc space-y-1 pl-6 text-neutral-950">
          <li>Physical therapy</li>
          <li>Medication management</li>
          <li>Therapeutic exercises</li>
          <li>Manual therapy</li>
          <li>Stretching and mobility treatment</li>
          <li>Electrical stimulation and heat/ice therapy</li>
        </ul>
        <p className="text-neutral-950">
          Despite treatment, Plaintiff continued to report ongoing pain and reduced physical functioning.
        </p>
        <CitationPill
          label="Citation: Treatment plan • Attendance records"
          onClick={() =>
            onCitationClick?.(
              [createSampleDocumentPreview()],
              "Conservative Treatment",
              "Documentation of conservative treatment course",
            )
          }
        />
      </section>

      <hr className="my-5 border-neutral-300" />

      <section className="space-y-3">
        <h3 className="font-spectral text-[17px] font-semibold leading-snug text-neutral-950">
          Specialist Evaluations
        </h3>
        <p className="text-neutral-950">
          Plaintiff later underwent orthopedic and pain management evaluations due to persistent symptoms.
          Examinations revealed continued cervical and lumbar tenderness, decreased range of motion, muscle
          spasms, and radicular symptoms involving the left lower extremity. Plaintiff was assessed with:
        </p>
        <ul className="list-disc space-y-1 pl-6 text-neutral-950">
          <li>Cervical disc bulge with radiculopathy</li>
          <li>Lumbar disc protrusion with radiculopathy</li>
          <li>Chronic cervicalgia and low back pain</li>
          <li>Myofascial pain syndrome</li>
          <li>Post-traumatic headaches</li>
        </ul>
        <p className="text-neutral-950">
          Pain management treatment options, including epidural steroid injections and trigger point
          injections, were discussed and recommended if symptoms continued.
        </p>
        <CitationPill
          label="Citation: Ortho consult • Pain management consult"
          onClick={() =>
            onCitationClick?.(
              [createSampleDocumentPreview()],
              "Specialist Evaluations",
              "Specialist opinions supporting diagnosis and plan",
            )
          }
        />
      </section>

      <hr className="my-5 border-neutral-300" />

      <section className="space-y-3">
        <h3 className="font-spectral text-[17px] font-semibold leading-snug text-neutral-950">Current Condition</h3>
        <p className="text-neutral-950">
          As a result of the motor vehicle accident, Plaintiff continues to experience ongoing neck pain,
          lower back pain, headaches, intermittent radiating symptoms, and functional limitations affecting
          daily activities and occupational tasks. Plaintiff remains under medical care.
        </p>
        <CitationPill
          label="Citation: Latest follow‑up note • Symptom journal"
          onClick={() =>
            onCitationClick?.(
              [createSampleDocumentPreview()],
              "Current Condition",
              "Recent documentation supporting current condition",
            )
          }
        />
      </section>

      <div className="mt-5">
        <SourcesPill
          count={MEDICAL_SUMMARY_SOURCE_COUNT}
          onClick={() =>
            onSourcesClick?.(
              MEDICAL_SUMMARY_SOURCE_DOCUMENTS,
              "Sources",
              `${MEDICAL_SUMMARY_SOURCE_COUNT} documents`,
            )
          }
        />
      </div>
    </article>
  );
}

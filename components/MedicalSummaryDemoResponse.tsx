/**
 * Demo assistant content for the Medical Summary skill prototype.
 * Plain semantic HTML only — no icons or emoji.
 */
import { CitationPill } from "@/components/CitationPill";
import type { DocumentPreview } from "@/components/DocumentPreviewPanel";

type MedicalSummaryDemoResponseProps = {
  onCitationClick?: (docs: DocumentPreview[], collectionTitle: string, collectionSubtitle?: string) => void;
};

export function MedicalSummaryDemoResponse({ onCitationClick }: MedicalSummaryDemoResponseProps) {
  return (
    <article className="max-w-[90%] text-response-md text-neutral-950">
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
              [
                {
                  title: "EMS report",
                  subtitle: "01/14/2026 • Incident response summary",
                  body: "Unit dispatched to rear-end collision.\nPatient: Tyler Durden.\nChief complaints: neck pain, low back pain, headache, dizziness.\nTransported to ED for evaluation.",
                },
                {
                  title: "ER intake note",
                  subtitle: "01/14/2026 • Metro Health ED",
                  body: "Arrival via ambulance.\nComplaints: neck and low back pain, dizziness, headache.\nInitial vitals stable; patient placed in cervical collar; moved to exam bay.",
                },
              ],
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
              [
                {
                  title: "ER visit summary",
                  subtitle: "01/14/2026 • Metro Health ED",
                  body: "Triage notes: neck pain, back pain, dizziness.\nExam: cervical/lumbar tenderness, muscle spasm.\nImaging: CT head negative; X‑ray without acute fracture.\nDisposition: discharged with meds and follow-up instructions.",
                },
                {
                  title: "CT / X‑ray results",
                  subtitle: "01/14/2026 • Imaging reports",
                  body: "CT head: no acute intracranial abnormality.\nCervical spine X‑ray: no acute fracture or dislocation.\nLumbar spine X‑ray: no acute osseous injury.",
                },
              ],
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
              [
                {
                  title: "PT daily note",
                  subtitle: "01/25/2026 • Initial evaluation",
                  body: "Subjective: neck and low back pain with limited ROM.\nObjective: guarded movements, muscle spasm.\nPlan: manual therapy, therapeutic exercise, home program.",
                },
                {
                  title: "Primary care follow‑up",
                  subtitle: "01/22/2026 • Follow‑up visit",
                  body: "Persistent pain and functional limitations.\nReferred to PT; MRI ordered due to continued symptoms.",
                },
              ],
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
            onCitationClick?.(
              [
                {
                  title: "Cervical MRI report",
                  subtitle: "02/03/2026 • Cervical spine",
                  body: "Disc bulge at C5-C6 with mild foraminal narrowing.\nStraightening of cervical lordosis consistent with spasm.",
                },
                {
                  title: "Lumbar MRI report",
                  subtitle: "02/03/2026 • Lumbar spine",
                  body: "Disc protrusion at L4-L5; annular tear at L5-S1.\nFindings consistent with reported low back and leg symptoms.",
                },
              ],
              "MRI Findings",
              "Imaging reports supporting MRI findings",
            )
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
              [
                {
                  title: "PT treatment plan",
                  subtitle: "02/2026 • Plan of care",
                  body: "Goals: reduce pain, improve ROM and strength, restore functional tolerance.\nInterventions: therapeutic exercise, manual therapy, modalities.",
                },
                {
                  title: "Attendance records",
                  subtitle: "02–03/2026 • PT sessions",
                  body: "Documented attendance and cancellations across course of care.",
                },
              ],
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
              [
                {
                  title: "Orthopedic consult",
                  subtitle: "03/2026 • Spine specialist",
                  body: "Exam consistent with cervical and lumbar disc pathology.\nRecommendations: continue conservative care; consider interventional options.",
                },
                {
                  title: "Pain management consult",
                  subtitle: "03/2026 • Pain clinic",
                  body: "Assessment: cervical/lumbar radiculopathy; chronic pain.\nDiscussed epidural steroid injections and trigger point injections.",
                },
              ],
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
          daily activities and occupational tasks. Plaintiff remains under medical care and may require
          continued rehabilitation, pain management treatment, and future medical intervention.
        </p>
        <CitationPill
          label="Citation: Latest follow‑up note • Symptom journal"
          onClick={() =>
            onCitationClick?.(
              [
                {
                  title: "Follow‑up clinic note",
                  subtitle: "04/2026 • Ongoing symptoms",
                  body: "Reports ongoing neck and low back pain with activity-related flare.\nPlan: continue rehab; re‑evaluate need for interventional treatment.",
                },
                {
                  title: "Symptom journal excerpt",
                  subtitle: "Patient‑reported outcomes",
                  body: "Daily entries describing pain levels, triggers, and functional limitations in work and ADLs.",
                },
              ],
              "Current Condition",
              "Recent documentation supporting current condition",
            )
          }
        />
      </section>
    </article>
  );
}

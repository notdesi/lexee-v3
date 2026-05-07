/** Prototype “thinking” timeline — total duration is at least {@link MIN_GENERATION_MS}. */
export const MIN_GENERATION_MS = 5000;

export const GENERATION_PHASES: { label: string; durationMs: number }[] = [
  { label: "Lexee is thinking…", durationMs: 1300 },
  { label: "Grepping documents in the matter…", durationMs: 1400 },
  { label: "Lexee is drafting a summary…", durationMs: 1600 },
  { label: "Cross-referencing records…", durationMs: 900 },
];

export type GenerationProgress = {
  headline: string;
  /** Index of the active checklist step, or GENERATION_PHASES.length when checklist is complete but work continues. */
  step: number;
};

export async function runGenerationPhases(
  onProgress: (state: GenerationProgress) => void,
  signal?: AbortSignal,
): Promise<void> {
  const wait = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      const id = window.setTimeout(() => resolve(), ms);
      signal?.addEventListener(
        "abort",
        () => {
          window.clearTimeout(id);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    });

  const start = Date.now();
  for (let i = 0; i < GENERATION_PHASES.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const phase = GENERATION_PHASES[i];
    onProgress({ headline: phase.label, step: i });
    await wait(phase.durationMs);
  }

  const elapsed = Date.now() - start;
  if (elapsed < MIN_GENERATION_MS) {
    onProgress({
      headline: "Lexee is drafting a summary…",
      step: GENERATION_PHASES.length,
    });
    await wait(MIN_GENERATION_MS - elapsed);
  }
}

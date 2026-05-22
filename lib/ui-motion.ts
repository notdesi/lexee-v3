/** Shared easing and durations for UI motion (CSS + Framer). */
export const UI_EASE = [0.32, 0.72, 0, 1] as const;

export function uiMotionTransition(reduceMotion: boolean | null, duration = 0.2) {
  return reduceMotion ? { duration: 0.01 } : { duration, ease: UI_EASE };
}

/** Fade + slight vertical drift for panels and layout swaps. */
export function uiFadeSlide(
  reduceMotion: boolean | null,
  options?: { enterY?: number; exitY?: number },
) {
  const enterY = options?.enterY ?? 10;
  const exitY = options?.exitY ?? -6;
  if (reduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: enterY },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: exitY },
  };
}

export const UI_T_COLORS =
  "ui-t-colors motion-reduce:transition-none";

export const UI_T_OPACITY =
  "ui-t-opacity motion-reduce:transition-none";

export const UI_T_TRANSFORM =
  "ui-t-transform motion-reduce:transition-none";

export const UI_T_LAYOUT =
  "ui-t-layout motion-reduce:transition-none";

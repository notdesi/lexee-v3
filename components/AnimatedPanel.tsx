"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { uiMotionTransition } from "@/lib/ui-motion";

type AnimatedPanelProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
};

/** Slides a right-side panel in without reflowing the whole layout abruptly. */
export function AnimatedPanel({ open, children, className }: AnimatedPanelProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
          transition={uiMotionTransition(reduceMotion, 0.25)}
          className={className}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

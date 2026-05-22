"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { uiMotionTransition } from "@/lib/ui-motion";

type AnimatedPopoverProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
};

export function AnimatedPopover({ open, children, className }: AnimatedPopoverProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.99 }}
          transition={uiMotionTransition(reduceMotion, 0.18)}
          className={className}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

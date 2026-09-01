"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { uiMotionTransition } from "@/lib/ui-motion";

type AnimatedPopoverProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
  variant?: "default" | "fade";
  style?: CSSProperties;
};

export function AnimatedPopover({
  open,
  children,
  className,
  variant = "default",
  style,
}: AnimatedPopoverProps) {
  const reduceMotion = useReducedMotion();
  const fadeOnly = variant === "fade" || reduceMotion;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={fadeOnly ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={fadeOnly ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.99 }}
          transition={uiMotionTransition(reduceMotion, fadeOnly ? 0.14 : 0.18)}
          className={className}
          style={style}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

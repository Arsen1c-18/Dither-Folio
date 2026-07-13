/**
 * Reusable Framer Motion presets.
 * Durations 0.4–0.8s, spring where appropriate, no bounce (well-damped).
 * Consume these in animation wrappers so motion stays consistent site-wide.
 */
import type { Transition, Variants } from "framer-motion";

export const softSpring: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  mass: 0.8,
};

export const easeOut: Transition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
};

/** Fade + slight upward translate. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

/** Blur reveal — fades in while sharpening. */
export const blurReveal: Variants = {
  hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Parent that staggers its children in. */
export const staggerParent = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

// A small, shared motion system - the point is that every reveal, stagger,
// and hover in the app pulls from these same six primitives instead of each
// section hand-rolling its own transition. That repetition (same curve, same
// durations) is a lot of what makes motion read as "engineered" rather than
// "a template with animations bolted on."
//
// Every primitive checks prefers-reduced-motion via Framer's useReducedMotion
// and renders a plain, unanimated element when it's set - motion is a
// progressive enhancement here, never a requirement for the content to
// appear.
//
// It also checks document.visibilityState at mount. Chrome throttles
// requestAnimationFrame in backgrounded tabs, and Framer's tweens are
// rAF-driven - a "load" reveal that starts in a hidden tab (opened in the
// background, or restored by the OS) can get stuck at its initial,
// invisible frame indefinitely, since it never gets a tick to animate on.
// Rather than let critical content (the hero headline, in particular) stay
// invisible waiting on frames that may not come, a reveal that starts
// hidden skips straight to its settled state - the same fallback used for
// prefers-reduced-motion.
import { useRef, useState } from 'react';
import { motion, useReducedMotion, useMotionValue, useSpring } from 'framer-motion';

// A fast-out, gentle-settle curve with no overshoot - reads as precise
// rather than bouncy. Used everywhere so the whole site shares one "feel."
export const EASE = [0.22, 1, 0.36, 1];
export const DURATION = 0.6;

function usePageWasHiddenAtMount() {
  const [hidden] = useState(
    () => typeof document !== 'undefined' && document.visibilityState === 'hidden'
  );
  return hidden;
}

export function useMotionSafe() {
  const reduced = useReducedMotion();
  const hiddenAtMount = usePageWasHiddenAtMount();
  return !reduced && !hiddenAtMount;
}

// Fades + lifts children into place. mode="load" runs immediately (hero
// content); mode="view" (default) runs once when scrolled into place.
export function FadeUp({
  children,
  delay = 0,
  y = 18,
  duration = DURATION,
  mode = 'view',
  className,
  style,
}) {
  const safe = useMotionSafe();
  if (!safe) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  const triggerProps =
    mode === 'load'
      ? { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-80px' },
        };
  return (
    <motion.div
      className={className}
      style={style}
      transition={{ duration, delay, ease: EASE }}
      {...triggerProps}
    >
      {children}
    </motion.div>
  );
}

// Alias for whole-section reveals - a slightly larger travel distance so
// full bands feel like they settle into the page rather than just fading.
export function SectionReveal({ children, className, delay = 0 }) {
  return (
    <FadeUp className={className} delay={delay} y={28}>
      {children}
    </FadeUp>
  );
}

// Splits a headline into per-line masked reveals: each line sits inside an
// overflow-hidden band and slides up from underneath it, rather than simply
// fading in - the "typography as a designed moment" effect the brief asks
// for. `lines` is an array of strings or nodes, one per visual line.
export function TextReveal({
  lines,
  delay = 0,
  stagger = 0.1,
  duration = 0.7,
  mode = 'load',
  as: Tag = 'h1',
  className,
  lineClassName,
}) {
  const safe = useMotionSafe();
  if (!safe) {
    return (
      <Tag className={className}>
        {lines.map((line, i) => (
          <span className={lineClassName} style={{ display: 'block' }} key={i}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }
  const triggerProps =
    mode === 'load'
      ? { initial: { y: '110%' }, animate: { y: '0%' } }
      : { initial: { y: '110%' }, whileInView: { y: '0%' }, viewport: { once: true, margin: '-80px' } };
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} style={{ display: 'block', overflow: 'hidden' }}>
          <motion.span
            className={lineClassName}
            style={{ display: 'block' }}
            transition={{ duration, delay: delay + i * stagger, ease: EASE }}
            {...triggerProps}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

// A parent that staggers its StaggerItem children in one at a time, instead
// of everything appearing at once - used for the waypoint list and card
// rows so items arrive in reading order.
export function StaggerContainer({ children, className, stagger = 0.09, delay = 0, mode = 'view' }) {
  const safe = useMotionSafe();
  if (!safe) return <div className={className}>{children}</div>;
  const triggerProps =
    mode === 'view'
      ? { whileInView: 'show', viewport: { once: true, margin: '-60px' } }
      : { animate: 'show' };
  return (
    <motion.div
      className={className}
      initial="hidden"
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      {...triggerProps}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, y = 16, id }) {
  const safe = useMotionSafe();
  if (!safe) return <div className={className} id={id}>{children}</div>;
  return (
    <motion.div
      className={className}
      id={id}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

// Draws an SVG path on load/in-view via stroke-dashoffset (pathLength),
// rather than just having it appear - used for the compass ring and the
// hero's directional route line.
export function DrawPath({ d, delay = 0, duration = 1.2, mode = 'load', ...svgProps }) {
  const safe = useMotionSafe();
  if (!safe) return <path d={d} {...svgProps} />;
  const triggerProps =
    mode === 'load'
      ? { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 } }
      : {
          initial: { pathLength: 0, opacity: 0 },
          whileInView: { pathLength: 1, opacity: 1 },
          viewport: { once: true },
        };
  return (
    <motion.path d={d} transition={{ duration, delay, ease: EASE }} {...svgProps} {...triggerProps} />
  );
}

// A button/link that subtly "tracks" the cursor within its own bounds - a
// few px of pull toward the pointer, springing back on leave. Skipped
// entirely under reduced motion (it's pure decoration, never load-bearing).
export function MagneticButton({ children, className, strength = 8, as: Tag = 'a', ...rest }) {
  const safe = useMotionSafe();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.4 });

  if (!safe) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  function handleMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set(((e.clientX - rect.left - rect.width / 2) / rect.width) * strength);
    y.set(((e.clientY - rect.top - rect.height / 2) / rect.height) * strength);
  }
  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  const MotionTag = motion(Tag);
  return (
    <MotionTag
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

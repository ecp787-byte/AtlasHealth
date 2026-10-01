import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { DrawPath, useMotionSafe, EASE } from '../motion/primitives.jsx';

// The hero's visual anchor: a layered mountain range at sunrise, echoing
// the AtlasMark logo (front obsidian peak, back sage/taupe range, a
// parchment trail line crossing the main peak). On load, the sun rises
// behind the range and each layer settles into place; on mousemove the
// layers drift a few px against each other for a quiet parallax depth
// effect suited to a mountain mark.
const OBSIDIAN = '#0B0B0B';
const SAGE = '#6B7F72';
const TAUPE = '#A99B80';
const PARCHMENT = '#F6F5F2';

export default function HeroPeak({ className = '' }) {
  const safe = useMotionSafe();
  const wrapRef = useRef(null);
  const [driftFront, setDriftFront] = useState(0);
  const [driftBack, setDriftBack] = useState(0);

  function handleMove(e) {
    if (!safe) return;
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const clamped = Math.max(-1, Math.min(1, relX));
    setDriftFront(clamped * 5);
    setDriftBack(clamped * -3);
  }
  function handleLeave() {
    setDriftFront(0);
    setDriftBack(0);
  }

  return (
    <div
      ref={wrapRef}
      className={`hero-peak ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 200" className="hero-peak-svg">
        <defs>
          <radialGradient id="heroSunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={TAUPE} stopOpacity="0.9" />
            <stop offset="65%" stopColor={TAUPE} stopOpacity="0.28" />
            <stop offset="100%" stopColor={TAUPE} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="heroFrontPeak" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2B2B2B" />
            <stop offset="100%" stopColor={OBSIDIAN} />
          </linearGradient>
        </defs>

        {/* sunrise glow, rising and fading in behind the range */}
        <motion.circle
          cx="122"
          cy="72"
          r="46"
          fill="url(#heroSunGlow)"
          initial={safe ? { opacity: 0, scale: 0.7 } : false}
          animate={safe ? { opacity: 1, scale: 1 } : undefined}
          transition={safe ? { duration: 1.1, delay: 0.1, ease: EASE } : undefined}
          style={{ transformOrigin: '122px 72px' }}
        />
        <motion.circle
          cx="122"
          cy="72"
          r="15"
          fill={PARCHMENT}
          initial={safe ? { opacity: 0, scale: 0.6 } : false}
          animate={safe ? { opacity: 0.95, scale: 1 } : undefined}
          transition={safe ? { duration: 0.7, delay: 0.35, ease: EASE } : undefined}
          style={{ transformOrigin: '122px 72px' }}
        />

        {/* back range - sage, farther away, settles in first */}
        <motion.g
          initial={safe ? { opacity: 0, y: 14 } : false}
          animate={safe ? { opacity: 0.55, y: 0 } : undefined}
          transition={safe ? { duration: 0.9, delay: 0.15, ease: EASE } : undefined}
          style={{ x: driftBack }}
        >
          <polygon points="0,200 18,146 42,174 66,112 96,160 124,96 150,150 176,128 200,168 200,200" fill={SAGE} />
        </motion.g>

        {/* front range - obsidian, the mark's main stroke, settles in after */}
        <motion.g
          initial={safe ? { opacity: 0, y: 20 } : false}
          animate={safe ? { opacity: 1, y: 0 } : undefined}
          transition={safe ? { duration: 0.9, delay: 0.4, ease: EASE } : undefined}
          style={{ x: driftFront }}
        >
          <polygon
            points="0,200 10,200 46,108 78,168 112,72 150,150 176,120 200,158 200,200"
            fill="url(#heroFrontPeak)"
          />
          {/* trail line across the main peak, echoing the logo's crossbar */}
          <DrawPath
            d="M 92,124 L 132,124"
            fill="none"
            stroke={PARCHMENT}
            strokeWidth={2.5}
            strokeLinecap="round"
            delay={1.0}
            duration={0.5}
          />
        </motion.g>
      </svg>
    </div>
  );
}

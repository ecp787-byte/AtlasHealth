import markLight from '../assets/atlas-mark-light.png';
import markDark from '../assets/atlas-mark-dark.png';

// The actual Atlas Health mark, cropped straight from the approved brand
// sheet (not redrawn) — two bold wedge strokes meeting at a single apex,
// open at the base, carrying the sheet's own dark-to-taupe gradient.
// `markDark` is the same shape recolored solid pale-taupe (same alpha
// mask as the crop, just re-filled) for use on the dark Obsidian hero and
// footer bands, where the source gradient's dark apex would vanish into
// the background.
export default function AtlasMark({ className = 'brand-mark', title = 'Atlas Health', onDark = false }) {
  return <img src={onDark ? markDark : markLight} alt={title} className={className} />;
}

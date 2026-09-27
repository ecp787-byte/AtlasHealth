// A single hidden SVG sprite sheet mounted once. Every icon elsewhere in the
// app renders as <svg className="icon"><use href="#i-name" /></svg>, which
// keeps stroke/size/color controlled centrally through the .icon CSS class.
export default function IconSprite() {
  return (
    <svg style={{ display: 'none' }} aria-hidden="true">
      <symbol id="i-shield" viewBox="0 0 24 24">
        <path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </symbol>
      <symbol id="i-people" viewBox="0 0 24 24">
        <circle cx="8.5" cy="8" r="3" />
        <circle cx="16.5" cy="9" r="2.4" />
        <path d="M2.5 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
        <path d="M14.5 14.5c2.6.3 4.5 2.4 4.5 5.5" />
      </symbol>
      <symbol id="i-house" viewBox="0 0 24 24">
        <path d="M4 11.5L12 4l8 7.5" />
        <path d="M6 10v9.5h12V10" />
        <path d="M10 19.5v-6h4v6" />
      </symbol>
      <symbol id="i-briefcase" viewBox="0 0 24 24">
        <rect x="3" y="8" width="18" height="12" rx="1.5" />
        <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <path d="M3 13h18" />
      </symbol>
      <symbol id="i-group" viewBox="0 0 24 24">
        <circle cx="12" cy="7.5" r="3" />
        <circle cx="5" cy="9.5" r="2.2" />
        <circle cx="19" cy="9.5" r="2.2" />
        <path d="M12 12c-3.5 0-6 2.3-6 6.5h12c0-4.2-2.5-6.5-6-6.5z" />
        <path d="M5 13c-1.8.4-3 2.1-3 5.5h3.4" />
        <path d="M19 13c1.8.4 3 2.1 3 5.5h-3.4" />
      </symbol>
      <symbol id="i-health" viewBox="0 0 24 24">
        <path d="M12 21s-7.5-4.6-9.6-9.4C1.1 8.2 3 5 6.4 5c2 0 3.4 1.1 5.6 3.4C14.2 6.1 15.6 5 17.6 5 21 5 22.9 8.2 21.6 11.6 19.5 16.4 12 21 12 21z" />
        <path d="M9 11h2l1-2.2 2 4.4 1-2.2h2" />
      </symbol>
      <symbol id="i-car" viewBox="0 0 24 24">
        <path d="M4 16V12l2.2-5.2A2 2 0 0 1 8 5.5h8a2 2 0 0 1 1.8 1.3L20 12v4" />
        <rect x="2.5" y="16" width="19" height="4" rx="1" />
        <circle cx="7" cy="20" r="1.6" />
        <circle cx="17" cy="20" r="1.6" />
      </symbol>
      <symbol id="i-check" viewBox="0 0 24 24">
        <path d="M5 12.5l4.5 4.5L19 7" />
      </symbol>
      <symbol id="i-checkbig" viewBox="0 0 24 24">
        <path d="M4 12.5l5 5L20 7" />
      </symbol>
      <symbol id="i-phone" viewBox="0 0 24 24">
        <path d="M6 3h3l2 5-2.5 1.8a12 12 0 0 0 5.7 5.7L15 13l5 2v3a2 2 0 0 1-2.2 2C10.5 19.4 4.6 13.5 4 6.2A2 2 0 0 1 6 3z" />
      </symbol>
      <symbol id="i-doc" viewBox="0 0 24 24">
        <path d="M6 2.5h9l4 4v15H6z" />
        <path d="M15 2.5V7h4" />
        <path d="M9 12h7M9 15.5h7M9 8.5h3.5" />
      </symbol>
    </svg>
  );
}

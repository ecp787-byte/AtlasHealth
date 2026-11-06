import { zipToState, isValidZip } from '../../lib/zipToState.js';

// US_STATE_NAMES: only used here, for the live "Looks like you're in X"
// line below the field — zipToState() itself returns the abbreviation
// (used elsewhere for CRM/routing), this just spells it out for the
// on-screen confirmation.
const US_STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'the District of Columbia',
  FL: 'Florida', GA: 'Georgia', GU: 'Guam', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
  ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  PR: 'Puerto Rico', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
  WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

export default function StepZip({ value, onChange, autoFocus }) {
  // zipToState() is a coarse 3-digit-prefix lookup (see lib/zipToState.js
  // header) — good enough for this live confirmation line, not for anything
  // that decides eligibility or pricing. Only shown once the ZIP is a
  // complete, plausible 5-digit code, so a half-typed ZIP doesn't flash a
  // wrong-looking state at the user mid-keystroke.
  const state = isValidZip(value) ? zipToState(value) : null;

  return (
    <div className="quiz-single-input">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={5}
        autoFocus={autoFocus}
        autoComplete="postal-code"
        className="quiz-input quiz-input-large"
        placeholder="ZIP code"
        value={value || ''}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 5))}
      />
      {state && (
        <p className="quiz-zip-state">Looks like you're in {US_STATE_NAMES[state] || state}.</p>
      )}
    </div>
  );
}

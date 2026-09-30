// ============================================================================
// CALENDAR INVITE — builds a .ics calendar file and emails it (via Resend)
// to both the buying agent and the lead when a booking happens.
// ----------------------------------------------------------------------------
// Activates the moment RESEND_API_KEY is set (same stub pattern as every
// other integration in this folder). Until then, sends are logged as a
// stub so routes/leads.js never has to change once the key is added.
//
// Sign-up: https://resend.com — free tier is generous for this volume.
// After creating an account you must also verify a sending domain (Resend
// dashboard -> Domains -> add atlashealthcare.us, then add the DNS records
// it gives you, the same way the TXT record was added for ActiveProspect).
// Until a domain is verified, Resend only lets you send to your own
// account's email, which is fine for testing but not for real bookings.
// ============================================================================

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const { RESEND_API_KEY, RESEND_FROM_EMAIL, BUSINESS_TIMEZONE } = process.env;
export const USING_RESEND_STUB = !RESEND_API_KEY;

// A Delaware-registered company defaults to Eastern time; override via the
// BUSINESS_TIMEZONE env var (any IANA zone, e.g. "America/Chicago") if the
// call center booking these appointments is actually elsewhere. This must
// be an IANA zone name, not a fixed UTC offset, so daylight saving is
// handled automatically.
const TIMEZONE = BUSINESS_TIMEZONE || 'America/New_York';

const FROM_EMAIL = RESEND_FROM_EMAIL || 'Atlas Health <appointments@atlashealthcare.us>';

const SLOT_TIMES = {
  '9:00 AM': [9, 0],
  '11:00 AM': [11, 0],
  '1:00 PM': [13, 0],
  '3:00 PM': [15, 0],
  '5:00 PM': [17, 0],
};
const APPOINTMENT_LENGTH_MINUTES = 30;

// Converts a wall-clock date/time in `timeZone` to the correct UTC instant,
// handling DST automatically (no fixed-offset assumption, no extra
// dependency) - first guesses the instant is UTC, sees what wall time that
// instant actually renders as in `timeZone`, then corrects by the delta.
function zonedTimeToUtc(year, month, day, hour, minute, timeZone) {
  const asUtcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(asUtcGuess).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  // Intl can render midnight as "24" for hour12: false in some engines.
  const hh = parts.hour === '24' ? 0 : Number(parts.hour);
  const asZoned = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    hh, Number(parts.minute), Number(parts.second)
  );
  const driftMs = asUtcGuess.getTime() - asZoned;
  return new Date(asUtcGuess.getTime() + driftMs);
}

function toIcsUtc(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function icsEscape(text = '') {
  return String(text).replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
}

/**
 * Builds an RFC 5545 .ics file for a lead's booked coverage review call.
 * `date` is "YYYY-MM-DD", `slot` is one of the labels in SLOT_TIMES.
 */
export function buildIcs({ date, slot, leadName, attendees, uid }) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = SLOT_TIMES[slot] || [9, 0];
  const start = zonedTimeToUtc(year, month, day, hour, minute, TIMEZONE);
  const end = new Date(start.getTime() + APPOINTMENT_LENGTH_MINUTES * 60000);

  const attendeeLines = attendees
    .filter(Boolean)
    .map((email) => `ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${email}`)
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Atlas Health//Coverage Review Booking//EN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${icsEscape(`Coverage Review Call — ${leadName || 'Atlas Health lead'}`)}`,
    `DESCRIPTION:${icsEscape('A licensed agent will call to review coverage options.')}`,
    `ORGANIZER;CN=Atlas Health:mailto:${FROM_EMAIL.match(/<(.+)>/)?.[1] || FROM_EMAIL}`,
    attendeeLines,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}

/**
 * Emails the .ics invite to every address in `to` (buyer + lead) via
 * Resend. Returns { ok, stub? } - never throws, same pattern as every
 * other integration here, so a failed send never breaks the booking
 * response itself (the booking is already recorded by the time this runs).
 */
export async function sendCalendarInvite({ to, subject, html, ics, filename = 'invite.ics' }) {
  const recipients = to.filter(Boolean);
  if (recipients.length === 0) {
    return { ok: false, reason: 'no recipient emails to send to' };
  }

  if (USING_RESEND_STUB) {
    // eslint-disable-next-line no-console
    console.log('[resend stub] would send invite to:', recipients.join(', '), '| subject:', subject);
    return { ok: true, stub: true };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: recipients,
        subject,
        html,
        attachments: [
          {
            filename,
            content: Buffer.from(ics).toString('base64'),
            content_type: 'text/calendar; charset=UTF-8; method=REQUEST',
          },
        ],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.log('[resend] send failed:', res.status, JSON.stringify(data));
      return { ok: false, status: res.status, ...data };
    }
    // eslint-disable-next-line no-console
    console.log('[resend] invite sent, id:', data.id);
    return { ok: true, ...data };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('[resend] request failed:', err.message);
    return { ok: false, error: err.message };
  }
}

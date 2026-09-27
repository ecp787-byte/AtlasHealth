// Simple business-hours check used to decide whether the results page leads
// with "call now" or "schedule a callback". Placeholder hours (Mon-Fri,
// 9am-6pm, in the browser's local time) - replace with the agency's real
// hours/timezone-aware logic (and ideally a server-side check, since
// client clocks can be wrong) before going live.
export const BUSINESS_HOURS = {
  timezoneNote: 'Uses the visitor\'s local device time - replace with a real timezone-aware, server-verified check before launch.',
  days: [1, 2, 3, 4, 5], // Mon-Fri
  startHour: 9,
  endHour: 18,
};

export function isDuringBusinessHours(date = new Date()) {
  const day = date.getDay();
  const hour = date.getHours();
  return BUSINESS_HOURS.days.includes(day) && hour >= BUSINESS_HOURS.startHour && hour < BUSINESS_HOURS.endHour;
}

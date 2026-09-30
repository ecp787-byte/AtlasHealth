// Approximate ZIP (first 3 digits) -> US state mapping.
//
// This is a coarse lookup table, not an authoritative source. It's good
// enough for on-page personalization ("plans available in Texas") and for
// pre-filling a CRM field an agent can correct. It is NOT good enough for
// anything that determines eligibility, pricing, or legal/licensing
// decisions — those must be resolved server-side against a real ZIP/county
// database (e.g. a carrier rating API or a maintained ZCTA dataset).
//
// Ranges adapted from the standard 3-digit ZIP prefix -> state table.
const ZIP3_RANGES = [
  [[6, 9], 'PR'], [[10, 27], 'MA'], [[28, 29], 'RI'], [[30, 38], 'NH'],
  [[39, 49], 'ME'], [[50, 59], 'VT'], [[60, 69], 'CT'], [[70, 89], 'NJ'],
  [[100, 149], 'NY'], [[150, 196], 'PA'], [[197, 199], 'DE'],
  [[200, 205], 'DC'], [[206, 219], 'MD'], [[220, 246], 'VA'],
  [[247, 268], 'WV'], [[270, 289], 'NC'], [[290, 299], 'SC'],
  [[300, 319], 'GA'], [[320, 349], 'FL'], [[350, 369], 'AL'],
  [[370, 385], 'TN'], [[386, 397], 'MS'], [[398, 399], 'GA'],
  [[400, 427], 'KY'], [[430, 459], 'OH'], [[460, 479], 'IN'],
  [[480, 499], 'MI'], [[500, 528], 'IA'], [[530, 549], 'WI'],
  [[550, 567], 'MN'], [[570, 577], 'SD'], [[580, 588], 'ND'],
  [[590, 599], 'MT'], [[600, 629], 'IL'], [[630, 658], 'MO'],
  [[660, 679], 'KS'], [[680, 693], 'NE'], [[700, 714], 'LA'],
  [[716, 729], 'AR'], [[730, 749], 'OK'], [[750, 799], 'TX'],
  [[800, 816], 'CO'], [[820, 831], 'WY'], [[832, 838], 'ID'],
  [[840, 847], 'UT'], [[850, 865], 'AZ'], [[870, 884], 'NM'],
  [[889, 898], 'NV'], [[900, 966], 'CA'], [[967, 968], 'HI'],
  [[969, 969], 'GU'], [[970, 979], 'OR'], [[980, 994], 'WA'],
  [[995, 999], 'AK'],
];

/**
 * Resolve a US state abbreviation from a 5-digit ZIP code.
 * Returns null when the ZIP doesn't look valid or falls outside the table.
 * Approximate — see file header. Always allow the user to confirm/correct
 * the state downstream rather than treating this as ground truth.
 */
export function zipToState(zip) {
  if (!zip) return null;
  const digits = String(zip).trim().slice(0, 5);
  if (!/^\d{5}$/.test(digits)) return null;
  const prefix = parseInt(digits.slice(0, 3), 10);
  for (const [[lo, hi], state] of ZIP3_RANGES) {
    if (prefix >= lo && prefix <= hi) return state;
  }
  return null;
}

export function isValidZip(zip) {
  return /^\d{5}$/.test(String(zip || '').trim());
}

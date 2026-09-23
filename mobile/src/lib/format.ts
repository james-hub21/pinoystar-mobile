const MANILA = 'Asia/Manila';

/** "Magandang umaga / hapon / gabi" based on the time in Manila. */
export function greeting(now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: MANILA }).format(now)) % 24;
  if (hour >= 5 && hour < 12) return 'Magandang umaga';
  if (hour >= 12 && hour < 18) return 'Magandang hapon';
  return 'Magandang gabi';
}

/** "2h ago", "Yesterday", "3 days ago", or a date. */
export function timeAgo(iso: string, now = Date.now()) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', timeZone: MANILA });
}

/** "1991-03-14" → "March 14, 1991" (dates only, no timezone shifting). */
export function longDate(isoDate: string | null) {
  if (!isoDate) return '—';
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function memberSince(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: MANILA });
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

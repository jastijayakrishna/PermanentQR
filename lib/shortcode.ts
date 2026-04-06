const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'; // 30 chars, no ambiguous 0/O/1/l/I

export function generateShortCode(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => ALPHABET[b % ALPHABET.length]).join('');
}

export const RESERVED_CODES = new Set([
  '_health', 'api', 'admin', 'login', 'register', 'signup', 'pricing',
  'about', 'help', 'terms', 'privacy', 'support', 'dashboard', 'export',
  'settings', 'not-found', 'status', 'not-found-code',
]);

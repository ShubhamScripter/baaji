// utils/deviceFingerprint.js
// Resolves a stable per-device identifier for multi-account (fraud) detection.
//
// Preferred source is the `X-Device-Id` header: a UUID the client mints once and
// keeps in localStorage. It survives IP changes and is the only signal that can
// tell "two accounts, one phone" apart from "two accounts, one cafe wifi".
//
// When that header is absent (older app builds, cleared storage, curl) we fall
// back to a hash of user-agent + IP. That fallback is deliberately marked with a
// different `source` so the UI can show it as a weaker signal rather than
// pretending it is a real device ID.

import crypto from 'crypto';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.connection?.remoteAddress ||
  req.socket?.remoteAddress ||
  req.connection?.socket?.remoteAddress ||
  'IP not found';

/**
 * @returns {{ deviceId: string, deviceSource: 'client'|'derived', userAgent: string, ip: string }}
 */
export const resolveDevice = (req) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown-device';
  const claimed = req.headers['x-device-id'];

  // Only trust a well-formed UUID. Anything else is attacker-controlled noise
  // that would otherwise let someone poison the cluster index with junk IDs.
  if (typeof claimed === 'string' && UUID_RE.test(claimed.trim())) {
    return {
      deviceId: claimed.trim().toLowerCase(),
      deviceSource: 'client',
      userAgent,
      ip,
    };
  }

  const derived = crypto
    .createHash('sha256')
    .update(`${userAgent}|${ip}`)
    .digest('hex')
    .slice(0, 32);

  return { deviceId: derived, deviceSource: 'derived', userAgent, ip };
};

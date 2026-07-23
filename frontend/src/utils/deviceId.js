// utils/deviceId.js
// A stable per-browser identifier, minted once and kept in localStorage.
// Sent as `X-Device-Id` on every request so the backend can tell "two accounts
// on one phone" apart from "two accounts behind one shared IP".

const STORAGE_KEY = 'bj_device_id';

const randomUuid = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  // Fallback for older / non-secure contexts where randomUUID is unavailable.
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10

  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20
  )}-${hex.slice(20)}`;
};

export const getDeviceId = () => {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = randomUuid();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // Private mode / storage disabled: the server falls back to a user-agent+IP
    // hash, so a missing header degrades detection rather than breaking login.
    return null;
  }
};

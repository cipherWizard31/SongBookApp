// ---------------------------------------------------------------------------
// shareEnvelope.js
// Single source of truth for the Selah Kignit share/export envelope format.
//
// Envelope shape:
//   { sk: 'selah_kignit', type: 'song'|'setlist'|'backup', version: 1, payload: {...} }
// ---------------------------------------------------------------------------

export const ENVELOPE_ID = 'selah_kignit';
export const ENVELOPE_VERSION = 1;
export const QR_MAX_CHARS = 1800; // safe QR v40 / error-correction M limit

// ── Build envelope ──────────────────────────────────────────────────────────
export function buildEnvelope(type, payload) {
  return { sk: ENVELOPE_ID, type, version: ENVELOPE_VERSION, payload };
}

export function envelopeToString(type, payload) {
  return JSON.stringify(buildEnvelope(type, payload));
}

// ── Parse & validate envelope ───────────────────────────────────────────────
/**
 * Returns { ok: true, type, payload } or { ok: false, error: string }
 */
export function parseEnvelope(raw) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed?.sk !== ENVELOPE_ID) {
      return { ok: false, error: 'Not a Selah Kignit file.' };
    }
    if (!parsed.type || !parsed.payload) {
      return { ok: false, error: 'File is missing required fields.' };
    }
    return { ok: true, type: parsed.type, payload: parsed.payload };
  } catch {
    return { ok: false, error: 'Could not read file – it may be corrupted.' };
  }
}

// ── Song QR helpers ─────────────────────────────────────────────────────────
/**
 * Strips heavy/internal fields before QR encoding.
 * Returns only what the receiver needs.
 */
export function stripSongForQR(song) {
  return {
    title: song.title,
    author: song.author,
    album: song.album,
    style: song.style,
    scale: song.scale,
    content: song.content,
    audioUrl: song.audioUrl,
  };
}

/**
 * Returns the QR string value, or null if the payload exceeds QR_MAX_CHARS.
 */
export function getSongQRValue(song) {
  const str = envelopeToString('song', stripSongForQR(song));
  return str.length <= QR_MAX_CHARS ? str : null;
}

// ── Shape validators ────────────────────────────────────────────────────────
export function validateSongPayload(payload) {
  if (!payload || typeof payload !== 'object') return 'Invalid song data.';
  if (typeof payload.title !== 'string' || !payload.title.trim()) return 'Song is missing a title.';
  if (payload.content !== undefined && typeof payload.content !== 'string') return 'Song content is malformed.';
  return null; // null = valid
}

export function validateSetlistPayload(payload) {
  if (!payload || typeof payload !== 'object') return 'Invalid setlist data.';
  const { setlist, songs } = payload;
  if (!setlist || typeof setlist.title !== 'string' || !setlist.title.trim()) return 'Setlist is missing a title.';
  if (songs !== undefined && !Array.isArray(songs)) return 'Setlist songs field is malformed.';
  return null;
}

export function validateBackupPayload(payload) {
  if (!payload || typeof payload !== 'object') return 'Invalid backup data.';
  if (!Array.isArray(payload.songs)) return 'Backup is missing songs array.';
  if (!Array.isArray(payload.setlists)) return 'Backup is missing setlists array.';
  return null;
}

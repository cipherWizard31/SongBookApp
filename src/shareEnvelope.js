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
 * Strips UTF-8 Byte Order Mark (BOM) and trims whitespace.
 */
function cleanRawJsonString(str) {
  if (typeof str !== 'string') return str;
  // Strip BOM if present (0xFEFF) and whitespace
  return str.replace(/^\uFEFF/, '').trim();
}

/**
 * Robustly parses Selah Kignit JSON payloads.
 * Accepts:
 *  1. Standard envelope: { sk: 'selah_kignit', type: 'backup'|'song'|'setlist', payload: {...} }
 *  2. Un-enveloped legacy backup: { songs: [...], setlists: [...] }
 *  3. Song array backup: [ { title: '...', ... }, ... ]
 *  4. Single setlist: { setlist: {...}, songs: [...] } or { title: '...', songIds: [...] }
 *  5. Single song: { title: '...', content: '...' }
 *
 * Returns { ok: true, type, payload } or { ok: false, error: string }
 */
export function parseEnvelope(raw) {
  try {
    const text = typeof raw === 'string' ? cleanRawJsonString(raw) : raw;
    const parsed = typeof text === 'string' ? JSON.parse(text) : text;

    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, error: 'File content is not valid JSON.' };
    }

    // 1. Standard envelope
    if (parsed.sk === ENVELOPE_ID) {
      if (!parsed.type || !parsed.payload) {
        return { ok: false, error: 'File is missing required fields.' };
      }
      return { ok: true, type: parsed.type, payload: parsed.payload };
    }

    // 2. Raw setlist object { setlist: {...}, songs: [...] }
    if (parsed.setlist && typeof parsed.setlist === 'object' && parsed.setlist.title) {
      return {
        ok: true,
        type: 'setlist',
        payload: {
          setlist: parsed.setlist,
          songs: Array.isArray(parsed.songs) ? parsed.songs : [],
        },
      };
    }
    if (parsed.title && Array.isArray(parsed.songIds)) {
      return {
        ok: true,
        type: 'setlist',
        payload: {
          setlist: parsed,
          songs: Array.isArray(parsed.songs) ? parsed.songs : [],
        },
      };
    }

    // 3. Legacy / un-enveloped backup object { songs: [...] }
    if (Array.isArray(parsed.songs)) {
      return {
        ok: true,
        type: 'backup',
        payload: {
          songs: parsed.songs,
          setlists: Array.isArray(parsed.setlists) ? parsed.setlists : [],
          styles: parsed.styles,
          scales: parsed.scales,
        },
      };
    }

    // 4. Raw array of songs [{ title: ... }]
    if (Array.isArray(parsed)) {
      return {
        ok: true,
        type: 'backup',
        payload: {
          songs: parsed,
          setlists: [],
        },
      };
    }

    // 5. Raw single song
    if (typeof parsed.title === 'string' && (parsed.content !== undefined || parsed.chords !== undefined || parsed.lyrics !== undefined)) {
      return {
        ok: true,
        type: 'song',
        payload: parsed,
      };
    }

    return { ok: false, error: 'Not a recognized Selah Kignit backup, song, or setlist file.' };
  } catch (err) {
    return { ok: false, error: 'Could not read file – ' + (err?.message || 'it may be corrupted.') };
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
  if (payload.setlists !== undefined && !Array.isArray(payload.setlists)) return 'Backup setlists field is malformed.';
  return null;
}

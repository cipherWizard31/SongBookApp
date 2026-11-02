import { CHROMATIC_NOTES, CHROMATIC_FLATS, FLAT_KEYS } from './constants';

export const NOTE_TO_SEMITONE = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
};

// Nashville Numbering System: intervals from the major scale tonic (degrees 1 through 7)
export const NASHVILLE_DEGREE_SEMITONES = {
  '1': 0,
  '2': 2,
  '3': 4,
  '4': 5,
  '5': 7,
  '6': 9,
  '7': 11,
};

export const SEMITONE_TO_NASHVILLE = {
  0: '1',
  1: 'b2',
  2: '2',
  3: 'b3',
  4: '3',
  5: '4',
  6: 'b5',
  7: '5',
  8: 'b6',
  9: '6',
  10: 'b7',
  11: '7',
};

/**
 * Extracts key root note (e.g. "C", "D#", "Bb") from scale string like "1st (C Major/Tizeta)" or "Bb Minor"
 */
export function extractKeyRoot(scaleStr) {
  if (!scaleStr || typeof scaleStr !== 'string') return null;
  const startMatch = scaleStr.match(/^([A-G](?:#|b)?)(?:\s|$)/);
  if (startMatch) return startMatch[1];
  const parenMatch = scaleStr.match(/\(\s*([A-G](?:#|b)?)(?:\s|\/|\))/);
  if (parenMatch) return parenMatch[1];
  return null;
}

/**
 * Transposes an individual note (e.g. root or bass note) by a semitone offset.
 * Defaults to flat notation (Db, Eb, Gb, Ab, Bb) instead of sharps.
 */
export function transposeNote(note, semitones, targetKey = null) {
  if (!note) return note;
  const norm = note.trim();
  const baseSemi = NOTE_TO_SEMITONE[norm];
  if (baseSemi === undefined) return note;

  const targetSemi = ((baseSemi + semitones) % 12 + 12) % 12;

  // Prefer flats for all accidentals by default, unless explicitly in a pure sharp key
  let preferFlats = true;
  if (targetKey && !FLAT_KEYS.has(targetKey) && norm.includes('#') && !norm.includes('b')) {
    preferFlats = false;
  }

  return preferFlats ? CHROMATIC_FLATS[targetSemi] : CHROMATIC_NOTES[targetSemi];
}

/**
 * Converts a chord to Nashville Numbering notation given a reference key root.
 * E.g., in Key of C: C -> 1, Dm -> 2m, Em -> 3m, F -> 4, G -> 5, Am -> 6m, C/E -> 1/3, G/B -> 5/7
 */
export function chordToNashville(chord, keyRoot = 'C') {
  if (!chord) return chord;
  const match = chord.trim().match(/^([A-G](?:#|b)?)(.*?)(\/([A-G](?:#|b)?))?$/);
  if (!match) return chord;

  const root = match[1];
  const quality = match[2];
  const bass = match[4];

  const keySemi = NOTE_TO_SEMITONE[keyRoot];
  const chordSemi = NOTE_TO_SEMITONE[root];
  if (keySemi === undefined || chordSemi === undefined) return chord;

  const diff = ((chordSemi - keySemi) % 12 + 12) % 12;
  const num = SEMITONE_TO_NASHVILLE[diff];

  let bassNum = '';
  if (bass) {
    const bassSemi = NOTE_TO_SEMITONE[bass];
    if (bassSemi !== undefined) {
      const bDiff = ((bassSemi - keySemi) % 12 + 12) % 12;
      bassNum = '/' + SEMITONE_TO_NASHVILLE[bDiff];
    }
  }

  return num + quality + bassNum;
}

/**
 * Converts a Nashville Number chord back to standard chord notation in target key.
 * Defaults to flats (Db, Eb, Gb, Ab, Bb) for accidental degrees.
 */
export function nashvilleToChord(nashvilleChord, targetKey = 'C') {
  if (!nashvilleChord) return nashvilleChord;
  const match = nashvilleChord.trim().match(/^([b#])?([1-7])(.*?)(\/([b#])?([1-7]))?$/);
  if (!match) return nashvilleChord;

  const acc = match[1] || '';
  const deg = match[2];
  const quality = match[3];
  const bassAcc = match[5] || '';
  const bassDeg = match[6];

  const keySemi = NOTE_TO_SEMITONE[targetKey];
  if (keySemi === undefined) return nashvilleChord;

  let semitoneOffset = NASHVILLE_DEGREE_SEMITONES[deg] ?? 0;
  if (acc === 'b') semitoneOffset -= 1;
  if (acc === '#') semitoneOffset += 1;

  const totalSemi = ((keySemi + semitoneOffset) % 12 + 12) % 12;
  const preferFlats = true;
  const rootNote = preferFlats ? CHROMATIC_FLATS[totalSemi] : CHROMATIC_NOTES[totalSemi];

  let bassNote = '';
  if (bassDeg) {
    let bOffset = NASHVILLE_DEGREE_SEMITONES[bassDeg] ?? 0;
    if (bassAcc === 'b') bOffset -= 1;
    if (bassAcc === '#') bOffset += 1;
    const bTotal = ((keySemi + bOffset) % 12 + 12) % 12;
    bassNote = '/' + (preferFlats ? CHROMATIC_FLATS[bTotal] : CHROMATIC_NOTES[bTotal]);
  }

  return rootNote + quality + bassNote;
}

/**
 * Transposes an individual chord token by semitones, correctly resolving root, quality,
 * and slash bass notes (e.g. C/E -> D/F# when transposed by +2), as well as Nashville numbers.
 */
export function transposeSingleChord(chord, semitones, referenceKey = null) {
  if (!chord || (semitones === 0 && !referenceKey)) return chord;
  const trimmed = chord.trim();

  // 1. Handle Nashville Number chords: e.g. 1, 2m, 4, 5/7, 6m7, b7
  const nashvilleMatch = trimmed.match(/^([b#])?([1-7])(.*?)(\/([b#])?([1-7]))?$/);
  if (nashvilleMatch && referenceKey) {
    const keyRoot = extractKeyRoot(referenceKey) || referenceKey;
    const targetKey = transposeNote(keyRoot, semitones);
    return nashvilleToChord(trimmed, targetKey);
  }

  if (semitones === 0) return chord;

  // 2. Standard chord: [Root][Quality][/Bass]
  // Matches letters A-G with optional sharp/flat, any chord quality/extensions, and optional slash bass
  const chordRegex = /^([A-G](?:#|b)?)(.*?)(\/([A-G](?:#|b)?))?$/;
  const match = trimmed.match(chordRegex);
  if (!match) return chord;

  const root = match[1];
  const quality = match[2];
  const bass = match[4];

  let targetKey = null;
  if (referenceKey) {
    const origRoot = extractKeyRoot(referenceKey) || referenceKey;
    if (origRoot) {
      targetKey = transposeNote(origRoot, semitones);
    }
  }

  const newRoot = transposeNote(root, semitones, targetKey);
  const newBass = bass ? '/' + transposeNote(bass, semitones, targetKey) : '';

  return newRoot + quality + newBass;
}

/**
 * Transposes chords within a chord string, segment, or compound chord list.
 */
export function transposeChord(chord, semitones, referenceKey = null) {
  if (!chord || (semitones === 0 && !referenceKey)) return chord;

  // If the chord is a single chord (e.g., in a segment), transpose directly
  const trimmed = chord.trim();
  if (!trimmed.includes(' ') && !trimmed.includes('-')) {
    return transposeSingleChord(trimmed, semitones, referenceKey);
  }

  // If chord contains multiple chords (e.g. "C - G/B - Am - F"), transpose each chord token
  return chord.replace(/([A-G](?:#|b)?(?:m|maj|min|dim|aug|sus\d?|add\d?|[0-9])*(?:\/[A-G](?:#|b)?)?)|([b#]?[1-7](?:m|maj|min|dim|aug|sus\d?|add\d?|[0-9])*(?:\/[b#]?[1-7])?)/g, (match) => {
    return transposeSingleChord(match, semitones, referenceKey);
  });
}

export function parseChordLine(line) {
  const trimmed = line.trim();

  if (!trimmed) {
    return { type: 'blank' };
  }

  const sectionMatch = trimmed.match(/^\[?(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Hook|Tag|Ending|Refrain)[\s\d]*\]?$/i);
  if (sectionMatch) {
    return {
      type: 'section',
      text: trimmed.replace(/[\[\]]/g, '').toUpperCase(),
    };
  }

  const parts = line.split(/(\[[^\]]+\])/);
  const segments = [];
  let currentChord = null;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('[') && part.endsWith(']')) {
      if (currentChord !== null) {
        segments.push({ chord: currentChord, lyric: '' });
      }
      currentChord = part.slice(1, -1);
    } else {
      if (currentChord !== null) {
        segments.push({ chord: currentChord, lyric: part });
        currentChord = null;
      } else if (part.length > 0) {
        segments.push({ chord: null, lyric: part });
      }
    }
  }

  if (currentChord !== null) {
    segments.push({ chord: currentChord, lyric: '' });
  }

  return { type: 'line', segments };
}

export function migrateSongToInline(song) {
  if (song.content !== undefined) {
    return song.content;
  }

  const chords = (song.chords || '').trim();
  const lyrics = (song.lyrics || '').trim();

  if (chords && lyrics) {
    return `Intro / Main Chords:\n[${chords.replace(/\s+/g, '][')}]\n\n${lyrics}`;
  } else if (chords) {
    return chords;
  } else if (lyrics) {
    return lyrics;
  }
  return '';
}
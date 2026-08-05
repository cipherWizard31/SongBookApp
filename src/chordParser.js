import { CHROMATIC_NOTES } from './constants';

export function transposeChord(chord, semitones) {
  if (!chord || semitones === 0) return chord;
  return chord.replace(/\b[A-G](?:#|b)?(?:m|maj|min|7|m7|dim|aug|add9|sus2|sus4|\/[A-G](?:#|b)?)?\b/g, (match) => {
    const rootMatch = match.match(/^[A-G](?:#|b)?/);
    if (!rootMatch) return match;
    const root = rootMatch[0];
    const suffix = match.slice(root.length);

    let idx = CHROMATIC_NOTES.indexOf(root);
    if (idx === -1) {
      if (root === 'Bb') idx = 10;
      if (root === 'Eb') idx = 3;
      if (root === 'Ab') idx = 8;
      if (root === 'Db') idx = 1;
      if (root === 'Gb') idx = 6;
    }
    if (idx === -1) return match;

    let newIdx = (idx + semitones) % 12;
    if (newIdx < 0) newIdx += 12;
    return CHROMATIC_NOTES[newIdx] + suffix;
  });
}

export function parseChordLine(line) {
  const trimmed = line.trim();

  if (!trimmed) {
    return { type: 'blank' };
  }

  const sectionMatch = trimmed.match(/^\[?(Verse\vert{}Chorus\vert{}Bridge\vert{}Intro\vert{}Outro\vert{}Pre-Chorus\vert{}Hook\vert{}Tag\vert{}Ending\vert{}Refrain)[\s\d]*\]?$/i);
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
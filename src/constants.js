export const DEFAULT_STYLES = [
  'All',
  'Waltz (3/4)',
  'Ballad (4/4)',
  'Wollo (6/8)',
  'Reggae (2/4)',
  'Chikchika (6/8)',
  'Disco (4/4)',
  'Swing(4/4)',
  'Uncategorized',
];

export const DEFAULT_SCALES = [
  'All',
  '1st (C Major/Tizeta)',
  '2nd (D Minor/Natural)',
  '5th (C Major/Ambassel)',
  '6th (D Minor/Bati)',
  'C Minor (Anchihoye)',
  'C Minor (Tizeta)',
  'C Minor (Ambassel)',
  'C Minor (Blues)',
  'Uncategorized',
];
  
  export const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  export const SCALE_DICTIONARY = [
    { name: '1st (C Major/Tizeta)', notes: 'C - D - E - G - A', description: 'Traditional nostalgic pentatonic scale.' },
    { name: '2nd (D Minor/Natural)', notes: 'D - E - F - G - A - Bb - C', description: 'Standard minor scale for worship songs.' },
    { name: '5th (C Major/Ambassel)', notes: 'C - Db - F - G - Ab', description: 'Features a flat second, ideal for prayerful worship.' },
    { name: '6th (D Minor/Bati)', notes: 'D - F - G - A - C', description: 'Minor pentatonic used in worship ballads.' },
    { name: 'C Minor (Anchihoye)', notes: 'C - Db - F - Gb - Bb', description: 'Unique scale evoking deep spiritual reverence.' },
    { name: 'C Minor (Tizeta)', notes: 'C - D - Eb - G - Ab', description: 'Minor variant of Tizeta.' },
    { name: 'C Minor (Ambassel)', notes: 'C - Eb - F - Ab - Bb', description: 'Deep minor Ambassel variation.' },
    { name: 'C Minor (Blues)', notes: 'C - Eb - F - F# - G - Bb', description: 'Contemporary worship scale.' },
  ];
  
  export const STORAGE_KEY = '@songbook_songs';
  export const CUSTOM_STYLES_KEY = '@songbook_custom_styles';
  export const CUSTOM_SCALES_KEY = '@songbook_custom_scales';
  export const DARK_MODE_KEY = '@songbook_dark_mode';
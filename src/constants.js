export const DEFAULT_STYLES = [
    'All',
    'Waltz (3/4)',
    'Ballad (4/4)',
    'Wollo (6/8)',
    'Reggae (2/4)',
    'Chikchika (6/8)',
    'Disco (4/4)',
    'Swing(4/4)',
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
  ];
  
  export const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  export const STYLE_DICTIONARY_INITIAL = [
    { name: 'Waltz (3/4)', rhythm: '1 - 2 - 3', description: 'Triple time rhythm ideal for slow devotional worship.', audioUri: null },
    { name: 'Ballad (4/4)', rhythm: '1 - 2 - 3 - 4', description: 'Standard 4/4 slow worship tempo.', audioUri: null },
    { name: 'Wollo (6/8)', rhythm: '1-2-3, 4-5-6', description: 'Traditional Ethiopian 6/8 compound rhythm.', audioUri: null },
    { name: 'Reggae (2/4)', rhythm: 'Offbeat Emphasis', description: 'Upbeat rhythm with syncopated offbeats.', audioUri: null },
    { name: 'Chikchika (6/8)', rhythm: 'Fast 6/8 Syncopation', description: 'Lively fast-paced traditional rhythm.', audioUri: null },
    { name: 'Disco (4/4)', rhythm: 'Four on the Floor', description: 'Upbeat energetic dance rhythm.', audioUri: null },
    { name: 'Swing (4/4)', rhythm: 'Swung Eighths', description: 'Classic jazz/swing beat pattern.', audioUri: null },
  ];
  
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
  export const STYLE_DICT_KEY = '@songbook_style_dictionary';
  export const DARK_MODE_KEY = '@songbook_dark_mode';
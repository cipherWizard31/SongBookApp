// Selah Kignit Design System ("Reverent Liturgical Modernism")
// Configured from Stitch Project ID: 2364343143090962598

export const FONTS = {
  title: 'AnthropicSansDisplay-Bold',
  body: 'AnthropicSerifText-Medium',
};

// Global typography styles mapped to design tokens
export const typography = {
  title: {
    fontFamily: FONTS.title,
  },
  body: {
    fontFamily: FONTS.body,
  },
};

export const getTheme = (isDarkMode) => {
  const fonts = FONTS;

  if (isDarkMode) {
    return {
      // Dark Mode (Midnight Sanctuary)
      fonts,
      bg: '#101319',                  // Base Obsidian Canvas
      secondaryBg: '#161A23',         // Elevated Stage Surface (surface1)
      cardBg: '#1D2230',              // Acoustic Chamber Card Container (surface2)
      surface0: '#101319',
      surface1: '#161A23',
      surface2: '#1D2230',
      inputBg: '#191C22',             // Input Fill
      headerBg: '#101319',            // Navigation Bar
      pressScale: 0.97,
      rippleColor: 'rgba(229, 169, 60, 0.16)',

      // Typography
      text: '#E1E2EB',                // Primary Fidel & English Text (High Emphasis)
      subText: '#94A3B8',             // Muted Stave / Subtitle Text
      tertiaryText: '#64748B',         // Dimmed Metadata Label

      // Separators & Borders
      border: '#32353C',              // Surface Rim Border
      divider: '#272A31',             // Hairline Divider

      // Accents & Specialized Colors
      tint: '#E5A93C',                // Imperial Amber Gold (Primary Accent)
      chord: '#38BDF8',               // Sanctuary Cyan (Stage Chord Callouts)
      tertiary: '#862633',            // Liturgical Burgundy
      goldDim: '#FABC4D',

      // Chips & Interactive Components
      chipBg: '#191C22',
      chipBorder: '#32353C',
      chipText: '#94A3B8',
      chipSelectedBg: '#E5A93C',
      chipSelectedText: '#101319',

      // Actions & FAB
      fabBg: '#E5A93C',
      fabText: '#101319',
      activeItem: '#272A31',
      destructive: '#FFB4AB',         // Crimson Error/Delete
    };
  }

  return {
    // Light Mode (Warm Parchment Reader)
    fonts,
    bg: '#FBF7EE',                    // Warm Liturgical Parchment
    secondaryBg: '#F3EBD8',           // Parchment Surface (surface1)
    cardBg: '#EAE0C8',                // Acoustic Chamber Card (surface2)
    surface0: '#FBF7EE',
    surface1: '#F3EBD8',
    surface2: '#EAE0C8',
    inputBg: '#F3ECE0',               // Input Fill
    headerBg: '#FBF7EE',              // Navigation Bar
    pressScale: 0.97,
    rippleColor: 'rgba(217, 119, 6, 0.16)',

    // Typography
    text: '#1C1917',                  // Deep Liturgical Ink
    subText: '#78716C',               // Muted Stave / Subtitle Text
    tertiaryText: '#A8A29E',           // Dimmed Metadata Label

    // Separators & Borders
    border: '#E7E0D3',                // Surface Rim Border
    divider: '#EFE8DB',               // Hairline Divider

    // Accents & Specialized Colors
    tint: '#D97706',                  // Imperial Gold Amber (Primary Accent)
    chord: '#0284C7',                 // Sanctuary Cyan/Blue (Light Chords)
    tertiary: '#862633',              // Liturgical Burgundy
    goldDim: '#B45309',

    // Chips & Interactive Components
    chipBg: '#F5EFE0',
    chipBorder: '#E7E0D3',
    chipText: '#78716C',
    chipSelectedBg: '#1C1917',
    chipSelectedText: '#FBF7EE',

    // Actions & FAB
    fabBg: '#1C1917',
    fabText: '#FBF7EE',
    activeItem: '#EFE8DB',
    destructive: '#DC2626',           // Crimson Error/Delete
  };
};
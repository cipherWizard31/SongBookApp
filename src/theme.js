// MD3-aligned design tokens for Selah Kignit
// Surface hierarchy: bg (lowest) → secondaryBg → cardBg (highest container)
// No arbitrary accent colors — primary is contextually black or white.
export const getTheme = (isDarkMode) => {
  if (isDarkMode) {
    return {
      // Surfaces
      bg: '#111111',          // surface / screen background
      secondaryBg: '#181818', // surface-container-low (toolbar bg, reader bg)
      cardBg: '#222222',      // surface-container (list items, sheets)
      inputBg: '#1A1A1A',     // surface-container-lowest (inputs)
      headerBg: '#111111',

      // Text (on-surface roles)
      text: '#E4E4E4',        // on-surface — primary text
      subText: '#8E8E8E',     // on-surface-variant — secondary / metadata text

      // Outline
      border: '#2C2C2C',      // outline-variant — dividers, borders
      divider: '#242424',     // hairline separators in lists

      // Interactive chips / filter
      chipBg: '#222222',
      chipBorder: '#383838',
      chipText: '#9E9E9E',
      chipSelectedBg: '#E4E4E4',
      chipSelectedText: '#111111',

      // Primary action (FAB, primary buttons)
      fabBg: '#E4E4E4',
      fabText: '#111111',

      // Active / selected state
      activeItem: '#282828',
    };
  }

  return {
    // Surfaces
    bg: '#FFFFFF',
    secondaryBg: '#F5F5F5',
    cardBg: '#F0F0F0',
    inputBg: '#F8F8F8',
    headerBg: '#FFFFFF',

    // Text
    text: '#1A1A1A',
    subText: '#5E5E5E',

    // Outline
    border: '#E0E0E0',
    divider: '#EBEBEB',

    // Chips
    chipBg: '#EFEFEF',
    chipBorder: '#DEDEDE',
    chipText: '#5E5E5E',
    chipSelectedBg: '#1A1A1A',
    chipSelectedText: '#FFFFFF',

    // Primary action
    fabBg: '#1A1A1A',
    fabText: '#FFFFFF',

    // Active / selected state
    activeItem: '#EBEBEB',
  };
};
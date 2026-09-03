// Apple Human Interface Guidelines (HIG) & Material Design 3 unified semantic tokens
export const getTheme = (isDarkMode) => {
  if (isDarkMode) {
    return {
      // iOS Dark Mode System Colors
      bg: '#000000',                  // System Background (Pure Black)
      secondaryBg: '#1C1C1E',         // Secondary System Background (Sheets, Toolbars, Inset Groups)
      cardBg: '#2C2C2E',              // Tertiary System Background (Inputs, Selected rows, Cards)
      inputBg: '#1C1C1E',             // Input Background
      headerBg: '#000000',            // Navigation Bar Fill

      // Typography
      text: '#FFFFFF',                // Primary Label
      subText: '#8E8E93',             // Secondary Label
      tertiaryText: '#636366',         // Tertiary Label

      // Separators & Borders
      border: '#38383A',              // Opaque Separator
      divider: '#2C2C2E',             // Hairline Separator

      // Interactive Chips
      chipBg: '#1C1C1E',
      chipBorder: '#38383A',
      chipText: '#8E8E93',
      chipSelectedBg: '#FFFFFF',
      chipSelectedText: '#000000',

      // System Accent & Buttons
      tint: '#0A84FF',                // System Blue (Dark)
      fabBg: '#FFFFFF',
      fabText: '#000000',
      activeItem: '#2C2C2E',
      destructive: '#FF453A',         // System Red
    };
  }

  return {
    // iOS Light Mode System Colors
    bg: '#FFFFFF',                    // System Background
    secondaryBg: '#F2F2F7',           // Secondary System Background (Sheets, Toolbars, Inset Groups)
    cardBg: '#EFEFF4',                // Tertiary System Background (Inputs, Cards)
    inputBg: '#E9E9EE',               // Input Fill
    headerBg: '#FFFFFF',              // Navigation Bar Fill

    // Typography
    text: '#000000',                  // Primary Label
    subText: '#6C6C70',               // Secondary Label
    tertiaryText: '#C7C7CC',           // Tertiary Label

    // Separators & Borders
    border: '#C6C6C8',                // Opaque Separator
    divider: '#E5E5EA',               // Hairline Separator

    // Interactive Chips
    chipBg: '#F2F2F7',
    chipBorder: '#E5E5EA',
    chipText: '#6C6C70',
    chipSelectedBg: '#000000',
    chipSelectedText: '#FFFFFF',

    // System Accent & Buttons
    tint: '#007AFF',                  // System Blue (Light)
    fabBg: '#000000',
    fabText: '#FFFFFF',
    activeItem: '#E5E5EA',
    destructive: '#FF3B30',           // System Red
  };
};
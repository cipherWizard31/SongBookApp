export const getTheme = (isDarkMode) => {
    if (isDarkMode) {
      return {
        bg: '#121212',
        cardBg: '#1E1E1E',
        text: '#F0F0F0',
        subText: '#AAAAAA',
        border: '#2C2C2C',
        inputBg: '#252525',
        secondaryBg: '#1A1A1A',
        headerBg: '#181818',
        chipBg: '#2C2C2C',
        chipBorder: '#444444',
        chipText: '#CCCCCC',
        chipSelectedBg: '#FFFFFF',
        chipSelectedText: '#000000',
        fabBg: '#FFFFFF',
        fabText: '#000000',
      };
    }
    return {
      bg: '#FFFFFF',
      cardBg: '#FFFFFF',
      text: '#000000',
      subText: '#666666',
      border: '#E5E5E5',
      inputBg: '#FAFAFA',
      secondaryBg: '#F8F8F8',
      headerBg: '#FFFFFF',
      chipBg: '#F5F5F5',
      chipBorder: '#E5E5E5',
      chipText: '#555555',
      chipSelectedBg: '#000000',
      chipSelectedText: '#FFFFFF',
      fabBg: '#000000',
      fabText: '#FFFFFF',
    };
  };
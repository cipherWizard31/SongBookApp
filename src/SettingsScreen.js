import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';

export const SettingsScreen = ({
  theme,
  stylesContainer = styles, // Fallback to local styles if undefined
  isDarkMode,
  setIsDarkMode,
  toggleDarkMode,
  handleExportSongs,
  handleImportSongs,
}) => {
  const onToggle = toggleDarkMode || (() => setIsDarkMode && setIsDarkMode(!isDarkMode));

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20 }}>
        <Text style={[stylesContainer.screenTitle, { color: theme.text }]}>
          Settings & Backup
        </Text>
      </View>

      {/* Dark Mode Toggle */}
      <View style={[stylesContainer.settingItem, { marginBottom: 12, backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={[stylesContainer.settingTitle, { color: theme.text }]}>Dark Mode</Text>
          <Text style={[stylesContainer.settingDesc, { color: theme.subText }]}>
            Switch between light and dark themes
          </Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: '#555555' }}
          thumbColor={isDarkMode ? '#FFFFFF' : '#f4f3f4'}
        />
      </View>

      {/* Export Backup Button */}
      <TouchableOpacity
        style={[stylesContainer.settingItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
        onPress={handleExportSongs}
      >
        <View>
          <Text style={[stylesContainer.settingTitle, { color: theme.text }]}>Export Full Backup</Text>
          <Text style={[stylesContainer.settingDesc, { color: theme.subText }]}>
            Export songs, setlists, and style dictionary.
          </Text>
        </View>
      </TouchableOpacity>

      {/* Import Backup Button */}
      <TouchableOpacity
        style={[stylesContainer.settingItem, { marginTop: 10, backgroundColor: theme.cardBg, borderColor: theme.border }]}
        onPress={handleImportSongs}
      >
        <View>
          <Text style={[stylesContainer.settingTitle, { color: theme.text }]}>Import Full Backup</Text>
          <Text style={[stylesContainer.settingDesc, { color: theme.subText }]}>
            Restore full application state from backup.
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Fallback Stylesheets in case stylesContainer isn't passed from props
const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default SettingsScreen;
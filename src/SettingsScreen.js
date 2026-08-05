import React from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, Platform, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { STORAGE_KEY, CUSTOM_STYLES_KEY, CUSTOM_SCALES_KEY, STYLE_DICT_KEY, DARK_MODE_KEY } from './constants';
import { migrateSongToInline } from './chordParser';

export const SettingsScreen = ({
  songs,
  setSongs,
  styles,
  setStyles,
  scales,
  setScales,
  styleDict,
  setStyleDict,
  isDarkMode,
  setIsDarkMode,
  theme,
}) => {
  const toggleDarkMode = async (val) => {
    setIsDarkMode(val);
    try {
      await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(val));
    } catch (e) {
      console.error('Save dark mode error', e);
    }
  };

  const handleExportSongs = async () => {
    const backupData = {
      songs,
      styles,
      scales,
      styleDict,
      exportedAt: new Date().toISOString(),
    };

    try {
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const fileName = `SelahKignit_FullBackup_${Date.now()}`;
          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            'application/json'
          );
          await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));
          Alert.alert('Backup Saved', 'Your backup file was saved directly to your device storage!');
          return;
        }
      }

      const uri = `${FileSystem.documentDirectory}SelahKignit_FullBackup.json`;
      await FileSystem.writeAsStringAsync(uri, JSON.stringify(backupData, null, 2));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/json',
          dialogTitle: 'Save Backup File to Device Storage',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Backup Saved', `Saved to device storage: ${uri}`);
      }
    } catch (e) {
      Alert.alert('Export failed', e.message);
    }
  };

  const handleImportSongs = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (!res.canceled && res.assets && res.assets[0]) {
        const contentStr = await FileSystem.readAsStringAsync(res.assets[0].uri);
        const parsed = JSON.parse(contentStr);

        if (parsed.songs) {
          const migratedImported = parsed.songs.map((s) => ({
            ...s,
            content: migrateSongToInline(s),
          }));
          const mergedSongs = [...migratedImported, ...songs];
          setSongs(mergedSongs);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedSongs));

          if (parsed.styles) {
            setStyles(parsed.styles);
            await AsyncStorage.setItem(CUSTOM_STYLES_KEY, JSON.stringify(parsed.styles));
          }
          if (parsed.scales) {
            setScales(parsed.scales);
            await AsyncStorage.setItem(CUSTOM_SCALES_KEY, JSON.stringify(parsed.scales));
          }
          if (parsed.styleDict) {
            setStyleDict(parsed.styleDict);
            await AsyncStorage.setItem(STYLE_DICT_KEY, JSON.stringify(parsed.styleDict));
          }
          Alert.alert('Restore Complete', 'Full application state restored successfully.');
        } else if (Array.isArray(parsed)) {
          const migratedImported = parsed.map((s) => ({
            ...s,
            content: migrateSongToInline(s),
          }));
          const merged = [...migratedImported, ...songs];
          setSongs(merged);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          Alert.alert('Success', `Imported ${parsed.length} songs.`);
        }
      }
    } catch (e) {
      Alert.alert('Import Failed', 'Invalid JSON backup file.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20 }}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Settings & Backup</Text>
      </View>
      <View style={[styles.settingItem, { marginBottom: 12, backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>Dark Mode</Text>
          <Text style={[styles.settingDesc, { color: theme.subText }]}>Switch between light and dark themes</Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#767577', true: '#555555' }}
          thumbColor={isDarkMode ? '#FFFFFF' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={handleExportSongs}>
        <View>
          <Text style={[styles.settingTitle, { color: theme.text }]}>Export Full Backup</Text>
          <Text style={[styles.settingDesc, { color: theme.subText }]}>Export songs, setlists, and style dictionary.</Text>
        </View>
        <Text style={{ color: theme.text }}>➔</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.settingItem, { marginTop: 10, backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={handleImportSongs}>
        <View>
          <Text style={[styles.settingTitle, { color: theme.text }]}>Import Full Backup</Text>
          <Text style={[styles.settingDesc, { color: theme.subText }]}>Restore full application state from backup.</Text>
        </View>
        <Text style={{ color: theme.text }}>➔</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  screenTitle: { fontSize: 20, fontWeight: '800' },
  settingItem: { borderWidth: 1, borderRadius: 8, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingTitle: { fontSize: 15, fontWeight: '700' },
  settingDesc: { fontSize: 12 },
});
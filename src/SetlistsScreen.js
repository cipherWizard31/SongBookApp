import React, { useState, useMemo, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, FlatList,
  Modal, TextInput, ScrollView, Alert, Platform, Dimensions, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { StatusBar } from 'expo-status-bar';
import { SongContentViewer } from './SongContentViewer';
import { migrateSongToInline } from './chordParser';
import { AudioPreviewBanner } from './AudioPreviewBanner';

export const SetlistsScreen = ({
  setlists = [],
  songs = [],
  onSaveSetlist,
  onDeleteSetlist,
  onClearImportedSetlists,
  onSaveSongsBatch,
  theme,
  isDarkMode = false,
}) => {
  // Navigation / Active View states
  const [selectedSetlist, setSelectedSetlist] = useState(null);

  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [addSongsModalVisible, setAddSongsModalVisible] = useState(false);

  // Performance Mode states
  const [performanceModeVisible, setPerformanceModeVisible] = useState(false);
  const [currentPerfIndex, setCurrentPerfIndex] = useState(0);
  const [perfTransposeKey, setPerfTransposeKey] = useState(0);
  const [perfShowChords, setPerfShowChords] = useState(true);
  const perfFlatListRef = useRef(null);

  // Form & Search states
  const [setlistTitle, setSetlistTitle] = useState('');
  const [setlistDesc, setSetlistDesc] = useState('');
  const [songSearchQuery, setSongSearchQuery] = useState('');

  // ----------------------------------------------------
  // SETLIST CREATION & DELETION
  // ----------------------------------------------------
  const handleCreateSetlist = () => {
    if (!setlistTitle.trim()) {
      Alert.alert('Required field', 'Please enter a setlist title.');
      return;
    }

    const newSetlist = {
      id: Date.now().toString(),
      title: setlistTitle.trim(),
      description: setlistDesc.trim() || new Date().toLocaleDateString(),
      songIds: [],
    };

    onSaveSetlist(newSetlist);
    setSetlistTitle('');
    setSetlistDesc('');
    setCreateModalVisible(false);
    setSelectedSetlist(newSetlist);
  };

  // ----------------------------------------------------
  // ADD / REMOVE SONGS IN SETLIST
  // ----------------------------------------------------
  const toggleSongInSetlist = (songId) => {
    if (!selectedSetlist) return;

    const exists = selectedSetlist.songIds.includes(songId);
    let updatedSongIds = [];

    if (exists) {
      updatedSongIds = selectedSetlist.songIds.filter((id) => id !== songId);
    } else {
      updatedSongIds = [...selectedSetlist.songIds, songId];
    }

    const updatedSetlist = { ...selectedSetlist, songIds: updatedSongIds };
    setSelectedSetlist(updatedSetlist);
    onSaveSetlist(updatedSetlist);
  };

  const filteredSongs = useMemo(() => {
    if (!songSearchQuery.trim()) return songs;
    const q = songSearchQuery.toLowerCase();
    return songs.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.author?.toLowerCase().includes(q) ||
        s.style?.toLowerCase().includes(q)
    );
  }, [songs, songSearchQuery]);

  // ----------------------------------------------------
  // EXPORT & IMPORT (JSON FORMAT)
  // ----------------------------------------------------
  const handleExportSetlist = async (setlist) => {
    const setlistSongs = songs.filter((s) => setlist.songIds.includes(s.id));

    const exportData = {
      version: '1.0',
      type: 'songbook_setlist',
      exportDate: new Date().toISOString(),
      setlist: {
        id: setlist.id,
        title: setlist.title,
        description: setlist.description,
      },
      songs: setlistSongs,
    };

    try {
      const fileName = `${setlist.title.replace(/[^a-zA-Z0-9]/g, '_')}_Setlist.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: `Export Setlist: ${setlist.title}`,
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Exported', `Setlist saved to: ${fileUri}`);
      }
    } catch (error) {
      Alert.alert('Export Failed', error.message);
    }
  };

  const handleImportSetlist = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets ? result.assets[0].uri : result.uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const parsedData = JSON.parse(fileContent);

      if (parsedData.type !== 'songbook_setlist' || !parsedData.setlist) {
        Alert.alert('Invalid File', 'This JSON file is not a valid setlist file.');
        return;
      }

      const importedSetlist = {
        id: Date.now().toString(),
        title: parsedData.setlist.title.includes('(Imported)')
          ? parsedData.setlist.title
          : `${parsedData.setlist.title} (Imported)`,
        description: parsedData.setlist.description || 'Imported Setlist',
        songIds: (parsedData.songs || []).map((s) => s.id),
        isImported: true,
      };

      if (parsedData.songs && parsedData.songs.length > 0 && onSaveSongsBatch) {
        onSaveSongsBatch(parsedData.songs.map((s) => ({ ...s, isImported: true })));
      }

      onSaveSetlist(importedSetlist);
      Alert.alert('Success', `Setlist "${importedSetlist.title}" imported successfully.`);
    } catch (error) {
      Alert.alert('Import Failed', 'Unable to parse the imported JSON file.');
    }
  };

  // ----------------------------------------------------
  // FULL SCREEN: SETLIST DETAIL VIEW
  // ----------------------------------------------------
  if (selectedSetlist) {
    const activeSetlistSongs = songs.filter((s) => selectedSetlist.songIds.includes(s.id));

    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        {/* Top navigation row */}
        <View style={[styles.topBar, { borderBottomColor: theme.divider }]}>
          <TouchableOpacity
            style={styles.barBtn}
            onPress={() => setSelectedSetlist(null)}
            accessibilityRole="button"
            accessibilityLabel="Back to setlists">
            <Text style={[styles.barBtnText, { color: theme.text }]}>‹ Setlists</Text>
          </TouchableOpacity>

          <View style={styles.barCenter}>
            <Text style={[styles.barTitle, { color: theme.text }]} numberOfLines={1}>
              {selectedSetlist.title}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.barBtn}
            onPress={() => {
              Alert.alert(
                'Delete Setlist',
                `Delete "${selectedSetlist.title}"?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      onDeleteSetlist(selectedSetlist.id);
                      setSelectedSetlist(null);
                    },
                  },
                ]
              );
            }}>
            <Text style={styles.destructiveText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Setlist info header */}
        <View style={[styles.detailHeader, { borderBottomColor: theme.divider }]}>
          <Text style={[styles.detailDesc, { color: theme.subText }]}>
            {selectedSetlist.description} · {activeSetlistSongs.length} {activeSetlistSongs.length === 1 ? 'song' : 'songs'}
          </Text>

          {/* Action row */}
          <View style={styles.actionRow}>
            {activeSetlistSongs.length > 0 && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.fabBg }]}
                onPress={() => {
                  setCurrentPerfIndex(0);
                  setPerfTransposeKey(0);
                  setPerformanceModeVisible(true);
                }}>
                <Text style={[styles.actionBtnText, { color: theme.fabText }]}>
                  Performance mode
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.cardBg, borderColor: theme.border, borderWidth: 1 }]}
              onPress={() => {
                setSongSearchQuery('');
                setAddSongsModalVisible(true);
              }}>
              <Text style={[styles.actionBtnText, { color: theme.text }]}>
                + Add songs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.cardBg, borderColor: theme.border, borderWidth: 1 }]}
              onPress={() => handleExportSetlist(selectedSetlist)}>
              <Text style={[styles.actionBtnText, { color: theme.text }]}>
                Export
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Songs List */}
        <FlatList
          data={activeSetlistSongs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 48 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: theme.subText }]}>Setlist is empty</Text>
              <Text style={[styles.emptyHint, { color: theme.subText }]}>
                Tap "+ Add songs" to select songs for this setlist
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => (
            <View style={[styles.sep, { backgroundColor: theme.divider, marginLeft: 52 }]} />
          )}
          renderItem={({ item, index }) => (
            <View style={[styles.songRow, { backgroundColor: theme.bg }]}>
              <Text style={[styles.songNum, { color: theme.subText }]}>{index + 1}</Text>
              <View style={styles.songText}>
                <Text style={[styles.songTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.songSub, { color: theme.subText }]} numberOfLines={1}>
                  {[item.author, item.scale, item.style].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => toggleSongInSetlist(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Remove song from setlist">
                <Text style={[styles.removeGlyph, { color: theme.subText }]}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* ADD SONGS MODAL */}
        <Modal
          visible={addSongsModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setAddSongsModalVisible(false)}>
          <View style={styles.sheetOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setAddSongsModalVisible(false)}
            />
            <View style={[styles.sheet, { backgroundColor: theme.bg }]}>
              <View style={[styles.handle, { backgroundColor: theme.border }]} />

              <View style={[styles.sheetHeader, { borderBottomColor: theme.divider }]}>
                <Text style={[styles.sheetTitle, { color: theme.text }]}>Add Songs</Text>
                <TouchableOpacity onPress={() => setAddSongsModalVisible(false)}>
                  <Text style={[styles.sheetDone, { color: theme.text }]}>Done</Text>
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.modalSearchWrap}>
                <View style={[styles.modalSearchBar, { backgroundColor: theme.cardBg }]}>
                  <Text style={[styles.searchGlyph, { color: theme.subText }]}>⌕</Text>
                  <TextInput
                    style={[styles.modalSearchInput, { color: theme.text }]}
                    placeholder="Search title, artist, or style…"
                    placeholderTextColor={theme.subText}
                    value={songSearchQuery}
                    onChangeText={setSongSearchQuery}
                    returnKeyType="search"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <FlatList
                data={filteredSongs}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 24 }}
                ItemSeparatorComponent={() => (
                  <View style={[styles.sep, { backgroundColor: theme.divider, marginLeft: 16 }]} />
                )}
                renderItem={({ item }) => {
                  const isSelected = selectedSetlist.songIds.includes(item.id);

                  return (
                    <TouchableOpacity
                      activeOpacity={0.6}
                      style={[styles.selectRow, { backgroundColor: theme.bg }]}
                      onPress={() => toggleSongInSetlist(item.id)}>
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text style={[styles.songTitle, { color: theme.text }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={[styles.songSub, { color: theme.subText }]} numberOfLines={1}>
                          {[item.author, item.style].filter(Boolean).join(' · ')}
                        </Text>
                      </View>
                      <Text style={[styles.checkGlyph, { color: isSelected ? theme.text : theme.subText }]}>
                        {isSelected ? '✓' : '+'}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </Modal>

        {/* PERFORMANCE MODE MODAL */}
        <Modal
          visible={performanceModeVisible}
          animationType="slide"
          statusBarTranslucent
          onRequestClose={() => setPerformanceModeVisible(false)}>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            {/* Top Toolbar */}
            <View style={[styles.perfTopBar, { borderBottomColor: theme.divider }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.perfTitle, { color: theme.text }]}>
                  {currentPerfIndex + 1} of {activeSetlistSongs.length}
                </Text>
                <Text style={[styles.perfSub, { color: theme.subText }]} numberOfLines={1}>
                  {selectedSetlist?.title}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity
                  style={[styles.toggleBtn, { borderColor: theme.border }]}
                  onPress={() => setPerfShowChords(!perfShowChords)}>
                  <Text style={[styles.toggleLabel, { color: theme.text }]}>
                    {perfShowChords ? 'Hide chords' : 'Show chords'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPerformanceModeVisible(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[styles.barBtnText, { color: theme.text }]}>Exit</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sub Bar: Transpose Key Controls */}
            <View style={[styles.perfSubBar, { backgroundColor: theme.secondaryBg, borderBottomColor: theme.divider }]}>
              <View style={styles.keyControls}>
                <Text style={[styles.toolbarLabel, { color: theme.subText }]}>Key</Text>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: theme.cardBg }]}
                  onPress={() => setPerfTransposeKey((k) => k - 1)}>
                  <Text style={[styles.stepBtnLabel, { color: theme.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.keyValue, { color: theme.text }]}>
                  {perfTransposeKey > 0 ? `+${perfTransposeKey}` : perfTransposeKey}
                </Text>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: theme.cardBg }]}
                  onPress={() => setPerfTransposeKey((k) => k + 1)}>
                  <Text style={[styles.stepBtnLabel, { color: theme.text }]}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  disabled={currentPerfIndex === 0}
                  style={[styles.navStepBtn, { opacity: currentPerfIndex === 0 ? 0.3 : 1 }]}
                  onPress={() => {
                    if (currentPerfIndex > 0) {
                      const next = currentPerfIndex - 1;
                      setCurrentPerfIndex(next);
                      perfFlatListRef.current?.scrollToIndex({ index: next, animated: true });
                    }
                  }}>
                  <Text style={[styles.navStepLabel, { color: theme.text }]}>‹ Prev</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={currentPerfIndex >= activeSetlistSongs.length - 1}
                  style={[styles.navStepBtn, { opacity: currentPerfIndex >= activeSetlistSongs.length - 1 ? 0.3 : 1 }]}
                  onPress={() => {
                    if (currentPerfIndex < activeSetlistSongs.length - 1) {
                      const next = currentPerfIndex + 1;
                      setCurrentPerfIndex(next);
                      perfFlatListRef.current?.scrollToIndex({ index: next, animated: true });
                    }
                  }}>
                  <Text style={[styles.navStepLabel, { color: theme.text }]}>Next ›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Horizontal Swipeable Songs FlatList */}
            <FlatList
              ref={perfFlatListRef}
              data={activeSetlistSongs}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const width = Dimensions.get('window').width;
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setCurrentPerfIndex(index);
              }}
              renderItem={({ item, index }) => {
                const windowWidth = Dimensions.get('window').width;
                const sub = [item.author, item.scale, item.style].filter(Boolean).join(' · ');

                return (
                  <View style={{ width: windowWidth, flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
                    <Text style={[styles.perfSongTitle, { color: theme.text }]}>
                      {index + 1}. {item.title}
                    </Text>
                    {sub ? (
                      <Text style={[styles.perfSongSub, { color: theme.subText }]}>
                        {sub}
                      </Text>
                    ) : null}

                    <AudioPreviewBanner
                      audioUrl={item.audioUrl || item.audioUri}
                      onPressPlay={(url) => Linking.openURL(url).catch(() => Alert.alert('Unable to open URL', url))}
                      isDarkMode={isDarkMode}
                      theme={theme}
                    />

                    <ScrollView
                      style={{ flex: 1, marginTop: 8 }}
                      contentContainerStyle={{ paddingBottom: 48 }}>
                      <SongContentViewer
                        content={item.content !== undefined ? item.content : migrateSongToInline(item)}
                        semitones={perfTransposeKey}
                        showChords={perfShowChords}
                        themeState={theme}
                        isDarkMode={isDarkMode}
                      />
                    </ScrollView>
                  </View>
                );
              }}
            />
          </SafeAreaView>
        </Modal>
      </View>
    );
  }

  // ----------------------------------------------------
  // MAIN SCREEN: SETLISTS OVERVIEW LIST
  // ----------------------------------------------------
  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* Top action bar */}
      <View style={[styles.headerRow, { borderBottomColor: theme.divider }]}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Setlists</Text>

        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleImportSetlist}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.headerAction, { color: theme.text }]}>Import</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCreateModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.headerAction, styles.headerActionPrimary, { color: theme.text }]}>
              + New Set
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Setlists List */}
      <FlatList
        data={setlists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 48 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: theme.subText }]}>No setlists</Text>
            <Text style={[styles.emptyHint, { color: theme.subText }]}>
              Tap "+ New Set" or "Import" to create your first setlist
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View style={[styles.sep, { backgroundColor: theme.divider, marginLeft: 16 }]} />
        )}
        renderItem={({ item }) => {
          const songCount = item.songIds ? item.songIds.length : 0;
          const isImported = item.isImported || item.title?.includes('(Imported)');

          return (
            <TouchableOpacity
              activeOpacity={0.55}
              style={[styles.setlistRow, { backgroundColor: theme.bg }]}
              onPress={() => setSelectedSetlist(item)}>
              <View style={styles.setlistText}>
                <Text style={[styles.setlistTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.setlistSub, { color: theme.subText }]} numberOfLines={1}>
                  {songCount} {songCount === 1 ? 'song' : 'songs'}
                  {item.description ? ` · ${item.description}` : ''}
                  {isImported ? ' · imported' : ''}
                </Text>
              </View>

              <Text style={[styles.chevron, { color: theme.subText }]}>›</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* CREATE NEW SETLIST MODAL */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setCreateModalVisible(false)}
          />
          <View style={[styles.sheet, { backgroundColor: theme.bg }]}>
            <View style={[styles.handle, { backgroundColor: theme.border }]} />

            <View style={[styles.sheetHeader, { borderBottomColor: theme.divider }]}>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Text style={[styles.sheetCancel, { color: theme.subText }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>New Setlist</Text>
              <TouchableOpacity onPress={handleCreateSetlist}>
                <Text style={[styles.sheetDone, { color: theme.text }]}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formPadding} keyboardShouldPersistTaps="handled">
              <Text style={[styles.label, { color: theme.subText }]}>Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }]}
                placeholder="e.g. Sunday Morning Worship"
                placeholderTextColor={theme.subText}
                value={setlistTitle}
                onChangeText={setSetlistTitle}
                returnKeyType="next"
              />

              <Text style={[styles.label, { color: theme.subText }]}>Notes / Date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }]}
                placeholder="e.g. Main Sanctuary, 10:00 AM"
                placeholderTextColor={theme.subText}
                value={setlistDesc}
                onChangeText={setSetlistDesc}
                returnKeyType="done"
              />

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.fabBg }]}
                onPress={handleCreateSetlist}>
                <Text style={[styles.saveBtnText, { color: theme.fabText }]}>Create Setlist</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Top header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  screenTitle: { fontSize: 18, fontWeight: '600' },
  headerAction: { fontSize: 15, fontWeight: '400' },
  headerActionPrimary: { fontWeight: '600' },

  // List rows
  sep: { height: StyleSheet.hairlineWidth },
  setlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 64,
  },
  setlistText: { flex: 1, paddingRight: 12 },
  setlistTitle: { fontSize: 15, fontWeight: '500' },
  setlistSub: { fontSize: 13, marginTop: 2 },
  chevron: { fontSize: 22, fontWeight: '300' },

  // Empty state
  empty: { paddingTop: 64, paddingHorizontal: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '500', marginBottom: 6 },
  emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Setlist Detail View
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  barBtn: { width: 80, height: 48, justifyContent: 'center', alignItems: 'center' },
  barBtnText: { fontSize: 15, fontWeight: '400' },
  barCenter: { flex: 1, alignItems: 'center' },
  barTitle: { fontSize: 15, fontWeight: '600' },
  destructiveText: { fontSize: 15, fontWeight: '400', color: '#C0392B' },

  detailHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailDesc: { fontSize: 13, marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: { fontSize: 13, fontWeight: '500' },

  // Songs list inside setlist
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 56,
  },
  songNum: { width: 28, fontSize: 14, fontWeight: '400', textAlign: 'center' },
  songText: { flex: 1, paddingHorizontal: 8 },
  songTitle: { fontSize: 15, fontWeight: '500' },
  songSub: { fontSize: 13, marginTop: 2 },
  removeBtn: { padding: 8 },
  removeGlyph: { fontSize: 14 },

  // Sheet modals
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '88%',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginTop: 10, marginBottom: 2,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: { fontSize: 15, fontWeight: '600' },
  sheetCancel: { fontSize: 15, fontWeight: '400' },
  sheetDone: { fontSize: 15, fontWeight: '600' },

  // Form
  formPadding: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 36 : 24 },
  label: { fontSize: 12, fontWeight: '500', marginTop: 12, marginBottom: 6, letterSpacing: 0.4 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  saveBtn: { marginTop: 24, height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600' },

  // Add songs modal search
  modalSearchWrap: { paddingHorizontal: 16, paddingVertical: 8 },
  modalSearchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, height: 44 },
  searchGlyph: { fontSize: 18, marginRight: 8 },
  modalSearchInput: { flex: 1, fontSize: 16, padding: 0 },
  selectRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  checkGlyph: { fontSize: 18, fontWeight: '600' },

  // Performance mode
  perfTopBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  perfTitle: { fontSize: 15, fontWeight: '600' },
  perfSub: { fontSize: 12, marginTop: 1 },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },
  toggleLabel: { fontSize: 12, fontWeight: '500' },

  perfSubBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  keyControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toolbarLabel: { fontSize: 12, fontWeight: '500' },
  stepBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  stepBtnLabel: { fontSize: 18, fontWeight: '300' },
  keyValue: { fontSize: 15, fontWeight: '600', minWidth: 24, textAlign: 'center' },
  navStepBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  navStepLabel: { fontSize: 14, fontWeight: '500' },

  perfSongTitle: { fontSize: 20, fontWeight: '600', marginBottom: 4 },
  perfSongSub: { fontSize: 13, marginBottom: 12 },
});
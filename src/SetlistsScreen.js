import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { StatusBar } from 'expo-status-bar';
import { SongContentViewer } from './SongContentViewer';
import { migrateSongToInline } from './chordParser';
import { AudioPreviewBanner } from './AudioPreviewBanner';

// Design Accent Tokens
const AMBER = '#E5A93C';
const CYAN = '#38BDF8';
const BURG = '#862633';

export const SetlistsScreen = ({
  setlists = [],
  songs = [],
  onSaveSetlist,
  onDeleteSetlist,
  onClearImportedSetlists,
  onSaveSongsBatch,
  autoStartPerformanceSetlistId = null,
  onClearAutoStartPerformance,
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

  // Focus target setlist when navigated from dashboard (without auto-opening performance mode)
  useEffect(() => {
    if (!autoStartPerformanceSetlistId || setlists.length === 0) return;
    const target = setlists.find((s) => s.id === autoStartPerformanceSetlistId);
    if (onClearAutoStartPerformance) {
      onClearAutoStartPerformance();
    }
    if (!target) return;
    setSelectedSetlist(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartPerformanceSetlistId]);

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
      description: setlistDesc.trim(),
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
      <View style={[st.root, { backgroundColor: theme.bg }]}>
        {/* Top navigation row */}
        <View style={[st.topBar, { borderBottomColor: theme.divider }]}>
          <TouchableOpacity
            style={st.iconBarBtn}
            onPress={() => setSelectedSetlist(null)}
            accessibilityRole="button"
            accessibilityLabel="Back to setlists">
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <View style={st.barCenter}>
            <Text style={[st.barTitle, { color: theme.text }]} numberOfLines={1}>
              {selectedSetlist.title}
            </Text>
          </View>

          <TouchableOpacity
            style={[st.iconBarBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
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
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Setlist info hero header card */}
        <View style={[st.detailHeroCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={st.heroHeaderTop}>
            <View style={[st.heroIconBox, { backgroundColor: `${AMBER}18` }]}>
              <Ionicons name="list" size={22} color={AMBER} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[st.heroTitle, { color: theme.text }]} numberOfLines={1}>
                {selectedSetlist.title}
              </Text>
              {selectedSetlist.description ? (
                <Text style={[st.heroDesc, { color: theme.subText }]} numberOfLines={1}>
                  {selectedSetlist.description}
                </Text>
              ) : null}
            </View>
            <View style={[st.songCountBadge, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
              <Ionicons name="musical-notes-outline" size={12} color={AMBER} style={{ marginRight: 4 }} />
              <Text style={[st.songCountText, { color: theme.text }]}>
                {activeSetlistSongs.length} {activeSetlistSongs.length === 1 ? 'song' : 'songs'}
              </Text>
            </View>
          </View>

          {/* Primary Action Buttons */}
          <View style={st.heroActionRow}>
            {activeSetlistSongs.length > 0 && (
              <TouchableOpacity
                style={[st.primaryPerfBtn, { backgroundColor: AMBER }]}
                onPress={() => {
                  setCurrentPerfIndex(0);
                  setPerfTransposeKey(0);
                  setPerformanceModeVisible(true);
                }}
                activeOpacity={0.85}>
                <Ionicons name="play-circle" size={18} color="#1E1909" style={{ marginRight: 6 }} />
                <Text style={st.primaryPerfBtnText}>Start Worship</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[st.heroSecondaryBtn, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}
              onPress={() => {
                setSongSearchQuery('');
                setAddSongsModalVisible(true);
              }}
              activeOpacity={0.7}>
              <Ionicons name="add-circle-outline" size={17} color={theme.text} style={{ marginRight: 5 }} />
              <Text style={[st.heroSecondaryBtnText, { color: theme.text }]}>Add Songs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[st.heroIconBtn, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}
              onPress={() => handleExportSetlist(selectedSetlist)}
              activeOpacity={0.7}>
              <Ionicons name="share-outline" size={18} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Songs List Header */}
        <View style={st.sectionSubHeader}>
          <Text style={[st.sectionSubTitle, { color: theme.subText }]}>SETLIST SONGS ({activeSetlistSongs.length})</Text>
        </View>

        {/* Songs List */}
        <FlatList
          data={activeSetlistSongs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}
          ListEmptyComponent={
            <View style={[st.emptyCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <Ionicons name="folder-open-outline" size={32} color={theme.subText} style={{ marginBottom: 8 }} />
              <Text style={[st.emptyTitle, { color: theme.text }]}>Setlist is empty</Text>
              <Text style={[st.emptyHint, { color: theme.subText }]}>
                Tap "+ Add Songs" above to select songs for this worship service setlist.
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item, index }) => (
            <View style={[st.songCardRow, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <View style={[st.indexBadge, { backgroundColor: theme.secondaryBg }]}>
                <Text style={[st.indexBadgeText, { color: AMBER }]}>{index + 1}</Text>
              </View>
              <View style={st.songText}>
                <Text style={[st.songTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[st.songSub, { color: theme.subText }]} numberOfLines={1}>
                  {[item.author, item.scale, item.style].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <TouchableOpacity
                style={st.removeBtn}
                onPress={() => toggleSongInSetlist(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Remove song from setlist">
                <Ionicons name="close-circle" size={20} color={theme.subText} />
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
          <View style={st.sheetOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setAddSongsModalVisible(false)}
            />
            <View style={[st.sheet, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <View style={[st.handle, { backgroundColor: theme.border }]} />

              <View style={[st.sheetHeader, { borderBottomColor: theme.divider }]}>
                <Text style={[st.sheetTitle, { color: theme.text }]}>Add Songs to Setlist</Text>
                <TouchableOpacity
                  style={[st.doneChipBtn, { backgroundColor: AMBER }]}
                  onPress={() => setAddSongsModalVisible(false)}>
                  <Text style={st.doneChipText}>Done</Text>
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={st.modalSearchWrap}>
                <View style={[st.modalSearchBar, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
                  <Ionicons name="search-outline" size={18} color={theme.subText} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[st.modalSearchInput, { color: theme.text }]}
                    placeholder="Search title, artist, or style…"
                    placeholderTextColor={theme.subText}
                    value={songSearchQuery}
                    onChangeText={setSongSearchQuery}
                    returnKeyType="search"
                    autoCorrect={false}
                  />
                  {songSearchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSongSearchQuery('')}>
                      <Ionicons name="close-circle" size={16} color={theme.subText} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <FlatList
                data={filteredSongs}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
                ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
                renderItem={({ item }) => {
                  const isSelected = selectedSetlist.songIds.includes(item.id);

                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={[
                        st.selectRowCard,
                        {
                          backgroundColor: isSelected ? `${AMBER}12` : theme.secondaryBg,
                          borderColor: isSelected ? `${AMBER}50` : theme.border,
                        },
                      ]}
                      onPress={() => toggleSongInSetlist(item.id)}>
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text style={[st.songTitle, { color: theme.text }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={[st.songSub, { color: theme.subText }]} numberOfLines={1}>
                          {[item.author, item.style].filter(Boolean).join(' · ')}
                        </Text>
                      </View>
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                        size={24}
                        color={isSelected ? AMBER : theme.subText}
                      />
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
            <View style={[st.perfTopBar, { borderBottomColor: theme.divider }]}>
              <View style={{ flex: 1 }}>
                <Text style={[st.perfTitle, { color: theme.text }]}>
                  {currentPerfIndex + 1} of {activeSetlistSongs.length}
                </Text>
                <Text style={[st.perfSub, { color: theme.subText }]} numberOfLines={1}>
                  {selectedSetlist?.title}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TouchableOpacity
                  style={[st.toggleBtn, { backgroundColor: perfShowChords ? CYAN : theme.cardBg, borderColor: perfShowChords ? CYAN : theme.border }]}
                  onPress={() => setPerfShowChords(!perfShowChords)}>
                  <Ionicons name="musical-note" size={13} color={perfShowChords ? '#001E2C' : theme.subText} style={{ marginRight: 4 }} />
                  <Text style={[st.toggleLabel, { color: perfShowChords ? '#001E2C' : theme.text }]}>
                    {perfShowChords ? 'Hide Chords' : 'Chords'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[st.perfExitPill, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}
                  onPress={() => setPerformanceModeVisible(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="contract-outline" size={14} color={theme.text} style={{ marginRight: 4 }} />
                  <Text style={[st.perfExitPillText, { color: theme.text }]}>Exit</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sub Bar: Transpose Key Controls */}
            <View style={[st.perfSubBar, { backgroundColor: theme.secondaryBg, borderBottomColor: theme.divider }]}>
              <View style={st.keyControls}>
                <Text style={[st.toolbarLabel, { color: theme.subText }]}>KEY</Text>
                <TouchableOpacity
                  style={[st.stepBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                  onPress={() => setPerfTransposeKey((k) => k - 1)}>
                  <Text style={[st.stepBtnLabel, { color: theme.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[st.keyValue, { color: AMBER }]}>
                  {perfTransposeKey === 0 ? 'Orig' : perfTransposeKey > 0 ? `+${perfTransposeKey}` : perfTransposeKey}
                </Text>
                <TouchableOpacity
                  style={[st.stepBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                  onPress={() => setPerfTransposeKey((k) => k + 1)}>
                  <Text style={[st.stepBtnLabel, { color: theme.text }]}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  disabled={currentPerfIndex === 0}
                  style={[st.navStepBtn, { backgroundColor: theme.cardBg, borderColor: theme.border, opacity: currentPerfIndex === 0 ? 0.3 : 1 }]}
                  onPress={() => {
                    if (currentPerfIndex > 0) {
                      const next = currentPerfIndex - 1;
                      setCurrentPerfIndex(next);
                      perfFlatListRef.current?.scrollToIndex({ index: next, animated: true });
                    }
                  }}>
                  <Text style={[st.navStepLabel, { color: theme.text }]}>‹ Prev</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={currentPerfIndex >= activeSetlistSongs.length - 1}
                  style={[st.navStepBtn, { backgroundColor: theme.cardBg, borderColor: theme.border, opacity: currentPerfIndex >= activeSetlistSongs.length - 1 ? 0.3 : 1 }]}
                  onPress={() => {
                    if (currentPerfIndex < activeSetlistSongs.length - 1) {
                      const next = currentPerfIndex + 1;
                      setCurrentPerfIndex(next);
                      perfFlatListRef.current?.scrollToIndex({ index: next, animated: true });
                    }
                  }}>
                  <Text style={[st.navStepLabel, { color: theme.text }]}>Next ›</Text>
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
                  <View style={{ width: windowWidth, flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
                    <Text style={[st.perfSongTitle, { color: theme.text }]}>
                      {index + 1}. {item.title}
                    </Text>
                    {sub ? (
                      <Text style={[st.perfSongSub, { color: theme.subText }]}>
                        {sub}
                      </Text>
                    ) : null}

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
                      <SongContentViewer
                        content={item.content !== undefined ? item.content : migrateSongToInline(item)}
                        semitones={perfTransposeKey}
                        showChords={perfShowChords}
                        themeState={theme}
                        isDarkMode={isDarkMode}
                        fontSize={18}
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
    <View style={[st.root, { backgroundColor: theme.bg }]}>
      {/* Top action bar */}
      <View style={[st.headerRow, { borderBottomColor: theme.divider }]}>
        <Text style={[st.screenTitle, { color: theme.text }]}>Setlists</Text>

        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TouchableOpacity
            style={[st.headerActionBtn, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}
            onPress={handleImportSetlist}
            activeOpacity={0.7}>
            <Ionicons name="download-outline" size={15} color={theme.text} style={{ marginRight: 4 }} />
            <Text style={[st.headerActionText, { color: theme.text }]}>Import</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[st.headerActionBtnPrimary, { backgroundColor: AMBER }]}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.85}>
            <Ionicons name="add" size={16} color="#1E1909" style={{ marginRight: 2 }} />
            <Text style={st.headerActionPrimaryText}>New Set</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Setlists List */}
      <FlatList
        data={setlists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 96 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={[st.emptyCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Ionicons name="albums-outline" size={36} color={theme.subText} style={{ marginBottom: 10 }} />
            <Text style={[st.emptyTitle, { color: theme.text }]}>No Setlists Yet</Text>
            <Text style={[st.emptyHint, { color: theme.subText }]}>
              Tap "+ New Set" or "Import" above to create setlists for your worship services.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const songCount = item.songIds ? item.songIds.length : 0;
          const isImported = item.isImported || item.title?.includes('(Imported)');

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              style={[st.setlistCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              onPress={() => setSelectedSetlist(item)}>

              <View style={[st.setlistCardIcon, { backgroundColor: `${AMBER}18` }]}>
                <Ionicons name="list" size={20} color={AMBER} />
              </View>

              <View style={st.setlistText}>
                <Text style={[st.setlistTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={st.setlistBadgeRow}>
                  <Text style={[st.setlistSub, { color: theme.subText }]} numberOfLines={1}>
                    {songCount} {songCount === 1 ? 'song' : 'songs'}
                  </Text>
                  {isImported && (
                    <View style={[st.importedChip, { backgroundColor: `${CYAN}18`, borderColor: `${CYAN}40` }]}>
                      <Text style={[st.importedChipText, { color: CYAN }]}>imported</Text>
                    </View>
                  )}
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color={theme.subText} />
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
        <View style={st.sheetOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setCreateModalVisible(false)}
          />
          <View style={[st.sheet, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={[st.handle, { backgroundColor: theme.border }]} />

            <View style={[st.sheetHeader, { borderBottomColor: theme.divider }]}>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Text style={[st.sheetCancel, { color: theme.subText }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[st.sheetTitle, { color: theme.text }]}>New Setlist</Text>
              <TouchableOpacity
                style={[st.doneChipBtn, { backgroundColor: AMBER }]}
                onPress={handleCreateSetlist}>
                <Text style={st.doneChipText}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={st.formPadding} keyboardShouldPersistTaps="handled">
              <Text style={[st.label, { color: theme.subText }]}>TITLE *</Text>
              <TextInput
                style={[st.input, { backgroundColor: theme.secondaryBg, borderColor: theme.border, color: theme.text }]}
                placeholder="e.g. Sunday Morning Worship"
                placeholderTextColor={theme.subText}
                value={setlistTitle}
                onChangeText={setSetlistTitle}
                returnKeyType="next"
              />

              <Text style={[st.label, { color: theme.subText }]}>NOTES / DATE</Text>
              <TextInput
                style={[st.input, { backgroundColor: theme.secondaryBg, borderColor: theme.border, color: theme.text }]}
                placeholder="e.g. Main Sanctuary, 10:00 AM"
                placeholderTextColor={theme.subText}
                value={setlistDesc}
                onChangeText={setSetlistDesc}
                returnKeyType="done"
              />

              <TouchableOpacity
                style={[st.saveBtn, { backgroundColor: AMBER }]}
                onPress={handleCreateSetlist}
                activeOpacity={0.85}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#1E1909" style={{ marginRight: 6 }} />
                <Text style={st.saveBtnText}>Create Setlist</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const st = StyleSheet.create({
  root: { flex: 1 },

  // Top header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  screenTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  headerActionText: { fontSize: 13, fontWeight: '600' },
  headerActionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  headerActionPrimaryText: { fontSize: 13, fontWeight: '700', color: '#1E1909' },

  // Setlist Overview Cards
  setlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  setlistCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  setlistText: { flex: 1, paddingRight: 12 },
  setlistTitle: { fontSize: 16, fontWeight: '600', marginBottom: 3 },
  setlistBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  setlistSub: { fontSize: 13, fontWeight: '400' },
  importedChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  importedChipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  // Empty State Card
  emptyCard: {
    padding: 32,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptyHint: { fontSize: 13, textAlign: 'center', lineHeight: 19 },

  // Top Bar in Detail View
  topBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 12 },
  barTitle: { fontSize: 16, fontWeight: '700' },

  // Hero Card in Detail View
  detailHeroCard: {
    margin: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  heroHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroTitle: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  heroDesc: { fontSize: 13 },
  songCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    marginLeft: 8,
  },
  songCountText: { fontSize: 11, fontWeight: '700' },

  heroActionRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  primaryPerfBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  primaryPerfBtnText: { color: '#1E1909', fontSize: 13, fontWeight: '700' },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  heroSecondaryBtnText: { fontSize: 13, fontWeight: '600' },
  heroIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  // Section Sub Header
  sectionSubHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionSubTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },

  // Song Row in Setlist Detail
  songCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  indexBadgeText: { fontSize: 13, fontWeight: '700' },
  songText: { flex: 1, paddingRight: 8 },
  songTitle: { fontSize: 15, fontWeight: '600' },
  songSub: { fontSize: 12, marginTop: 2 },
  removeBtn: { padding: 4 },

  // Sheet Modal Overlay
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '88%',
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700' },
  sheetCancel: { fontSize: 14, fontWeight: '500' },
  doneChipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
  },
  doneChipText: { color: '#1E1909', fontSize: 13, fontWeight: '700' },

  // Add Songs Search
  modalSearchWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
  },
  modalSearchInput: { flex: 1, fontSize: 14, padding: 0 },
  selectRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },

  // Create Form
  formPadding: { padding: 18, paddingBottom: Platform.OS === 'ios' ? 36 : 24 },
  label: { fontSize: 10, fontWeight: '700', marginTop: 14, marginBottom: 6, letterSpacing: 0.8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  saveBtn: {
    marginTop: 24,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: { color: '#1E1909', fontSize: 14, fontWeight: '700' },

  // Performance Mode Modal
  perfTopBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  perfTitle: { fontSize: 16, fontWeight: '700' },
  perfSub: { fontSize: 12, marginTop: 1 },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleLabel: { fontSize: 12, fontWeight: '700' },
  perfExitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  perfExitPillText: { fontSize: 12, fontWeight: '600' },

  perfSubBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  keyControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toolbarLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnLabel: { fontSize: 16, fontWeight: '600' },
  keyValue: { fontSize: 13, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  navStepBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  navStepLabel: { fontSize: 13, fontWeight: '600' },

  perfSongTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  perfSongSub: { fontSize: 13, marginBottom: 16 },
});

export default SetlistsScreen;
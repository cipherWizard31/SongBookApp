import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export const SetlistsScreen = ({
  setlists = [],
  songs = [],
  onSaveSetlist,
  onDeleteSetlist,
  theme,
  isDarkMode = false,
}) => {
  // Navigation / Active View states
  const [selectedSetlist, setSelectedSetlist] = useState(null);

  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [addSongsModalVisible, setAddSongsModalVisible] = useState(false);

  // Form & Search states
  const [setlistTitle, setSetlistTitle] = useState('');
  const [setlistDesc, setSetlistDesc] = useState('');
  const [songSearchQuery, setSongSearchQuery] = useState('');

  // ----------------------------------------------------
  // SETLIST CREATION & DELETION
  // ----------------------------------------------------
  const handleCreateSetlist = () => {
    if (!setlistTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a setlist title.');
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
    setSelectedSetlist(newSetlist); // Open immediately upon creation
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

  // Filter songs based on search query inside the modal
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

    // Structured JSON Payload
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
        title: `${parsedData.setlist.title} (Imported)`,
        description: parsedData.setlist.description || 'Imported Setlist',
        songIds: (parsedData.songs || []).map((s) => s.id),
      };

      onSaveSetlist(importedSetlist);
      Alert.alert('Success', `Setlist "${importedSetlist.title}" imported successfully!`);
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
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {/* Detail Header / Action Toolbar */}
        <View style={styles.detailHeader}>
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: theme.border }]}
            onPress={() => setSelectedSetlist(null)}>
            <Text style={[styles.backBtnText, { color: theme.text }]}>← Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteBtn, { backgroundColor: '#FF3B301A' }]}
            onPress={() => {
              Alert.alert(
                'Delete Setlist',
                `Are you sure you want to delete "${selectedSetlist.title}"?`,
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
            <Text style={{ color: '#FF3B30', fontSize: 13, fontWeight: '700' }}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Setlist Info */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedSetlist.title}</Text>
          <Text style={[styles.detailSub, { color: theme.subText }]}>{selectedSetlist.description}</Text>
        </View>

        {/* Action Controls */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: isDarkMode ? '#FFFFFF' : '#000000', flex: 1 },
            ]}
            onPress={() => {
              setSongSearchQuery('');
              setAddSongsModalVisible(true);
            }}>
            <Text style={{ color: isDarkMode ? '#000000' : '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
              + Add Songs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#0066FF', flex: 1 }]}
            onPress={() => handleExportSetlist(selectedSetlist)}>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>📤 Export JSON</Text>
          </TouchableOpacity>
        </View>

        {/* Songs List Section */}
        <Text style={[styles.sectionLabel, { color: theme.subText }]}>
          SONGS IN SET ({activeSetlistSongs.length})
        </Text>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
          {activeSetlistSongs.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              No songs in this setlist yet. Tap "+ Add Songs" to populate.
            </Text>
          ) : (
            activeSetlistSongs.map((song, index) => (
              <View
                key={song.id}
                style={[
                  styles.songRow,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                  },
                ]}>
                <Text style={[styles.songIndex, { color: theme.subText }]}>{index + 1}.</Text>
                <View style={{ flex: 1, paddingHorizontal: 10 }}>
                  <Text style={[styles.songTitle, { color: theme.text }]}>{song.title}</Text>
                  <Text style={[styles.songSub, { color: theme.subText }]}>
                    {song.author} • {song.scale}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeIconBtn}
                  onPress={() => toggleSongInSetlist(song.id)}>
                  <Text style={{ color: '#FF3B30', fontSize: 14, fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        {/* ADD SONGS MODAL */}
        <Modal
          visible={addSongsModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAddSongsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setAddSongsModalVisible(false)}
            />
            <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
              <View style={[styles.dragHandle, { backgroundColor: isDarkMode ? '#444' : '#DDD' }]} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add Songs to Setlist</Text>

              {/* Search Bar */}
              <TextInput
                style={[
                  styles.searchInput,
                  { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text },
                ]}
                placeholder="🔍 Search songs by title or author..."
                placeholderTextColor={theme.subText}
                value={songSearchQuery}
                onChangeText={setSongSearchQuery}
              />

              <FlatList
                data={filteredSongs}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 12 }}
                renderItem={({ item }) => {
                  const isSelected = selectedSetlist.songIds.includes(item.id);

                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={[
                        styles.songSelectRow,
                        {
                          backgroundColor: isSelected
                            ? isDarkMode
                              ? '#003366'
                              : '#E6F0FF'
                            : theme.cardBg,
                          borderColor: isSelected ? '#0066FF' : theme.border,
                        },
                      ]}
                      onPress={() => toggleSongInSetlist(item.id)}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.songTitle, { color: theme.text }]}>{item.title}</Text>
                        <Text style={[styles.songSub, { color: theme.subText }]}>
                          {item.author} • {item.style}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '800',
                          color: isSelected ? '#0066FF' : theme.subText,
                        }}>
                        {isSelected ? '✓' : '+'}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              <TouchableOpacity
                style={[
                  styles.btn,
                  { backgroundColor: isDarkMode ? '#FFFFFF' : '#000000', marginTop: 10 },
                ]}
                onPress={() => setAddSongsModalVisible(false)}>
                <Text style={{ color: isDarkMode ? '#000000' : '#FFFFFF', fontWeight: '700' }}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ----------------------------------------------------
  // MAIN SCREEN: SETLISTS OVERVIEW LIST
  // ----------------------------------------------------
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Setlists</Text>
          <Text style={[styles.screenSub, { color: theme.subText }]}>
            Organize worship sessions and live sets.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[styles.headerIconBtn, { borderColor: theme.border }]}
            onPress={handleImportSetlist}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text }}>📥 Import</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.addBtn,
              { backgroundColor: isDarkMode ? '#FFFFFF' : '#000000' },
            ]}
            onPress={() => setCreateModalVisible(true)}>
            <Text
              style={{
                color: isDarkMode ? '#000000' : '#FFFFFF',
                fontWeight: '700',
                fontSize: 13,
              }}>
              + New Set
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Setlists Cards List */}
      <FlatList
        data={setlists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 4 }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.subText }]}>
            No setlists created yet. Tap "+ New Set" or "Import" to get started.
          </Text>
        }
        renderItem={({ item }) => {
          const songCount = item.songIds ? item.songIds.length : 0;

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.card,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
              onPress={() => setSelectedSetlist(item)}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.cardSub, { color: theme.subText }]} numberOfLines={1}>
                  {item.description}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0',
                    },
                  ]}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text }}>
                    {songCount} {songCount === 1 ? 'song' : 'songs'}
                  </Text>
                </View>

                <Text style={{ fontSize: 12, fontWeight: '700', color: '#0066FF' }}>View →</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* CREATE NEW SETLIST MODAL */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setCreateModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <View style={[styles.dragHandle, { backgroundColor: isDarkMode ? '#444' : '#DDD' }]} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>Create New Setlist</Text>

            <Text style={[styles.inputLabel, { color: theme.subText }]}>TITLE *</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text },
              ]}
              placeholder="e.g., Sunday Service"
              placeholderTextColor={theme.subText}
              value={setlistTitle}
              onChangeText={setSetlistTitle}
            />

            <Text style={[styles.inputLabel, { color: theme.subText }]}>DATE / NOTES</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text },
              ]}
              placeholder="e.g., Main Hall, 10:00 AM"
              placeholderTextColor={theme.subText}
              value={setlistDesc}
              onChangeText={setSetlistDesc}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel, { borderColor: theme.border }]}
                onPress={() => setCreateModalVisible(false)}>
                <Text style={{ color: theme.text, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btn,
                  { backgroundColor: isDarkMode ? '#FFFFFF' : '#000000', flex: 1 },
                ]}
                onPress={handleCreateSetlist}>
                <Text style={{ color: isDarkMode ? '#000000' : '#FFFFFF', fontWeight: '700' }}>
                  Save Setlist
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },

  // Main Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  screenTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  screenSub: { fontSize: 13, marginTop: 2 },
  addBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8 },
  headerIconBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
  },

  // Cards
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 12, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 13 },

  // Setlist Detail View
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backBtnText: { fontSize: 13, fontWeight: '600' },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  detailTitle: { fontSize: 22, fontWeight: '800' },
  detailSub: { fontSize: 13, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },

  // Songs Rows
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  songIndex: { fontSize: 13, fontWeight: '700' },
  songTitle: { fontSize: 14, fontWeight: '700' },
  songSub: { fontSize: 12, marginTop: 2 },
  removeIconBtn: { padding: 6 },

  // Modals & Forms
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '85%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  inputLabel: { fontSize: 11, fontWeight: '800', marginTop: 12, marginBottom: 6, letterSpacing: 0.8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    marginBottom: 12,
  },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btn: {
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: { borderWidth: 1, flex: 1 },
  songSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
});
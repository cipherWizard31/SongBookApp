import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buildEnvelope } from './shareEnvelope';
import { saveJsonToFile, shareJsonToApp } from './exportUtils';

export const SongSharePickerModal = ({
  visible,
  onClose,
  songs = [],
  theme,
}) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    const q = searchQuery.toLowerCase();
    return songs.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.author?.toLowerCase().includes(q) ||
        s.album?.toLowerCase().includes(q)
    );
  }, [songs, searchQuery]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredSongs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSongs.map((s) => s.id)));
    }
  };

  const getPayload = () => {
    const selectedSongs = songs.filter((s) => selectedIds.has(s.id));
    if (selectedSongs.length === 1) {
      return buildEnvelope('song', selectedSongs[0]);
    }
    return buildEnvelope('backup', {
      songs: selectedSongs,
      setlists: [],
    });
  };

  const handleShare = async () => {
    if (selectedIds.size === 0) {
      Alert.alert('No Songs Selected', 'Please select at least one song to share.');
      return;
    }
    const count = selectedIds.size;
    const fileName =
      count === 1
        ? `${(songs.find((s) => selectedIds.has(s.id))?.title || 'Song').replace(/[^a-zA-Z0-9]/g, '_')}.json`
        : `Selah_Songs_Selection_${count}.json`;

    try {
      await shareJsonToApp({
        data: getPayload(),
        fileName,
        dialogTitle: `Share ${count} ${count === 1 ? 'Song' : 'Songs'}`,
      });
      onClose();
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleSaveFile = async () => {
    if (selectedIds.size === 0) {
      Alert.alert('No Songs Selected', 'Please select at least one song to save.');
      return;
    }
    const count = selectedIds.size;
    const fileName =
      count === 1
        ? `${(songs.find((s) => selectedIds.has(s.id))?.title || 'Song').replace(/[^a-zA-Z0-9]/g, '_')}.json`
        : `Selah_Songs_Selection_${count}.json`;

    try {
      await saveJsonToFile({
        data: getPayload(),
        fileName,
        dialogTitle: `Save ${count} Songs`,
        successAlertTitle: 'Songs Saved',
        successMessage: 'Successfully saved to file:',
      });
      onClose();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={[st.container, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={[st.header, { borderBottomColor: theme.border, backgroundColor: theme.headerBg || theme.cardBg }]}>
          <TouchableOpacity onPress={onClose} style={st.headerBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[st.headerTitle, { color: theme.text }]}>Share Songs</Text>
          <TouchableOpacity onPress={selectAll} style={st.headerBtnText} activeOpacity={0.7}>
            <Text style={{ color: theme.tint, fontWeight: '600', fontSize: 14 }}>
              {selectedIds.size === filteredSongs.length && filteredSongs.length > 0 ? 'Deselect' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[st.searchBarWrap, { backgroundColor: theme.bg }]}>
          <View style={[st.searchBar, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
            <Ionicons name="search" size={18} color={theme.subText} style={{ marginRight: 8 }} />
            <TextInput
              style={[st.searchInput, { color: theme.text }]}
              placeholder="Search songs to share..."
              placeholderTextColor={theme.subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Song List */}
        <FlatList
          data={filteredSongs}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <TouchableOpacity
                style={[
                  st.songItem,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: isSelected ? theme.tint : theme.border,
                    borderWidth: isSelected ? 1.5 : 1,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => toggleSelect(item.id)}>
                <View style={st.checkbox}>
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isSelected ? theme.tint : theme.subText}
                  />
                </View>
                <View style={st.songInfo}>
                  <Text style={[st.songTitle, { color: theme.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[st.songMeta, { color: theme.subText }]} numberOfLines={1}>
                    {[item.author, item.album, item.scale].filter(Boolean).join(' • ') || 'No artist'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={st.emptyWrap}>
              <Text style={[st.emptyText, { color: theme.subText }]}>No songs found</Text>
            </View>
          }
        />

        {/* Footer Actions */}
        <View style={[st.footer, { backgroundColor: theme.cardBg, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[st.actionBtn, { borderColor: theme.border, backgroundColor: theme.secondaryBg }]}
            onPress={handleSaveFile}
            activeOpacity={0.8}>
            <Ionicons name="save-outline" size={18} color={theme.text} style={{ marginRight: 6 }} />
            <Text style={[st.actionBtnText, { color: theme.text }]}>Save File</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[st.actionBtn, { backgroundColor: theme.tint, flex: 1.5 }]}
            onPress={handleShare}
            activeOpacity={0.8}>
            <Ionicons name="share-social" size={18} color="#1E1909" style={{ marginRight: 6 }} />
            <Text style={[st.actionBtnText, { color: '#1E1909', fontWeight: '700' }]}>
              Share JSON ({selectedIds.size})
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const st = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'AnthropicSansDisplay-Bold',
  },
  headerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBtnText: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  searchBarWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'AnthropicSansDisplay-Bold',
  },
  songMeta: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'AnthropicSerifText-Medium',
  },
  emptyWrap: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});


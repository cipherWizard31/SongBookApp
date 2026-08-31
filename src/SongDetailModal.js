import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SongContentViewer } from './SongContentViewer';
import { migrateSongToInline } from './chordParser';
import { AudioPreviewBanner } from './AudioPreviewBanner';

export const SongDetailModal = ({
  songDetailModal,
  setSongDetailModal,
  transposeKey,
  setTransposeKey,
  showChords,
  setShowChords,
  playSound,
  handleEditSong,
  handleDeleteSong,
  theme,
  isDarkMode,
}) => {
  const audioUrl = songDetailModal?.audioUrl || songDetailModal?.audioUri;
  return (
    <Modal
      visible={!!songDetailModal}
      animationType="slide"
      onRequestClose={() => {
        setSongDetailModal(null);
      }}>
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.bg }]}>
        <View style={{ padding: 16, flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.modalHeader, { color: theme.text }]}>{songDetailModal?.title}</Text>
              <Text style={[styles.detailAuthor, { color: theme.subText }]}>
                {songDetailModal?.author}{songDetailModal?.album ? ` • ${songDetailModal.album}` : ''}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0' }}
                onPress={() => handleEditSong(songDetailModal)}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.text }}>✏️ Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#FF3B301A' }}
                onPress={() => handleDeleteSong(songDetailModal?.id)}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#FF3B30' }}>🗑️ Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowChords(!showChords)}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>{showChords ? 'Hide Chords' : 'Show Chords'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.readerBar, { backgroundColor: theme.secondaryBg }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.text }}>KEY:</Text>
              <TouchableOpacity style={[styles.smallBtn, { backgroundColor: isDarkMode ? '#FFF' : '#000' }]} onPress={() => setTransposeKey(transposeKey - 1)}>
                <Text style={{ color: isDarkMode ? '#000' : '#FFF' }}>-1</Text>
              </TouchableOpacity>
              <Text style={{ fontWeight: 'bold', color: theme.text }}>{transposeKey > 0 ? `+${transposeKey}` : transposeKey}</Text>
              <TouchableOpacity style={[styles.smallBtn, { backgroundColor: isDarkMode ? '#FFF' : '#000' }]} onPress={() => setTransposeKey(transposeKey + 1)}>
                <Text style={{ color: isDarkMode ? '#000' : '#FFF' }}>+1</Text>
              </TouchableOpacity>
            </View>
          </View>

          <AudioPreviewBanner
            audioUrl={audioUrl}
            onPressPlay={(url) => playSound(url)}
            isDarkMode={isDarkMode}
            theme={theme}
          />

          <ScrollView style={[styles.lyricsBox, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
            <SongContentViewer
              content={songDetailModal?.content !== undefined ? songDetailModal.content : migrateSongToInline(songDetailModal || {})}
              semitones={transposeKey}
              showChords={showChords}
              themeState={theme}
              isDarkMode={isDarkMode}
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.btnCancel, { backgroundColor: theme.cardBg, borderColor: theme.border, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 }]}
            onPress={() => {
              setSongDetailModal(null);
            }}>
            <Text style={{ color: theme.text, fontWeight: '600', fontSize: 15 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1 },
  modalHeader: { fontSize: 22, fontWeight: '800' },
  detailAuthor: { fontSize: 15 },
  readerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, marginVertical: 8 },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 5 },
  lyricsBox: { flex: 1, borderRadius: 8, padding: 16, borderWidth: 1, marginTop: 4 },
  btnCancel: { borderWidth: 1 },
});
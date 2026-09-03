import React from 'react';
import {
  View, Text, Modal, ScrollView,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SongContentViewer } from './SongContentViewer';
import { migrateSongToInline } from './chordParser';
import { AudioPreviewBanner } from './AudioPreviewBanner';

export const SongDetailModal = ({
  songDetailModal, setSongDetailModal,
  transposeKey, setTransposeKey,
  showChords, setShowChords,
  playSound,
  handleEditSong,
  handleDeleteSong,
  theme,
  isDarkMode,
}) => {
  const song = songDetailModal;
  const audioUrl = song?.audioUrl || song?.audioUri;
  const subtitle = [song?.author, song?.album].filter(Boolean).join(' · ');

  return (
    <Modal
      visible={!!song}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => setSongDetailModal(null)}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <SafeAreaView style={[st.screen, { backgroundColor: theme.bg }]}>

        {/* ── HIG Navigation Bar ── */}
        <View style={[st.topBar, { borderBottomColor: theme.divider }]}>
          {/* Close / Done */}
          <TouchableOpacity
            style={st.barBtn}
            onPress={() => setSongDetailModal(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Done viewing song"
            accessibilityRole="button">
            <Text style={[st.barBtnLabelDone, { color: theme.tint || theme.text }]}>Done</Text>
          </TouchableOpacity>

          {/* Title & metadata block */}
          <View style={st.barTitle}>
            <Text style={[st.songName, { color: theme.text }]} numberOfLines={1}>
              {song?.title}
            </Text>
            {subtitle ? (
              <Text style={[st.songMeta, { color: theme.subText }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {/* Edit action */}
          <TouchableOpacity
            style={st.barBtn}
            onPress={() => handleEditSong(song)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Edit song"
            accessibilityRole="button">
            <Text style={[st.barBtnLabel, { color: theme.tint || theme.text }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── Toolbar: Key transposition + Chord toggle + Delete ── */}
        <View style={[st.toolbar, { backgroundColor: theme.secondaryBg, borderBottomColor: theme.divider }]}>
          {/* Key controls */}
          <View style={st.keyControls}>
            <Text style={[st.toolbarLabel, { color: theme.subText }]}>Key</Text>
            <TouchableOpacity
              style={[st.stepBtn, { backgroundColor: theme.cardBg }]}
              onPress={() => setTransposeKey(transposeKey - 1)}
              accessibilityLabel="Transpose down"
              accessibilityRole="button">
              <Text style={[st.stepBtnLabel, { color: theme.text }]}>−</Text>
            </TouchableOpacity>
            <Text style={[st.keyValue, { color: theme.text }]}>
              {transposeKey > 0 ? `+${transposeKey}` : transposeKey}
            </Text>
            <TouchableOpacity
              style={[st.stepBtn, { backgroundColor: theme.cardBg }]}
              onPress={() => setTransposeKey(transposeKey + 1)}
              accessibilityLabel="Transpose up"
              accessibilityRole="button">
              <Text style={[st.stepBtnLabel, { color: theme.text }]}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={st.toolbarActions}>
            {/* Chord toggle */}
            <TouchableOpacity
              style={[st.toggleBtn, { borderColor: theme.border }]}
              onPress={() => setShowChords(!showChords)}
              accessibilityLabel={showChords ? 'Hide chords' : 'Show chords'}
              accessibilityRole="switch"
              accessibilityState={{ checked: showChords }}>
              <Text style={[st.toggleLabel, { color: theme.text }]}>
                {showChords ? 'Hide chords' : 'Show chords'}
              </Text>
            </TouchableOpacity>

            {/* Delete button */}
            <TouchableOpacity
              style={st.deleteBtn}
              onPress={() => handleDeleteSong(song?.id)}
              accessibilityLabel="Delete song"
              accessibilityRole="button">
              <Text style={[st.deleteBtnLabel, { color: theme.destructive || '#FF3B30' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Audio preview (only if link present) ── */}
        {audioUrl ? (
          <View style={{ paddingHorizontal: 16 }}>
            <AudioPreviewBanner
              audioUrl={audioUrl}
              onPressPlay={(url) => playSound(url)}
              isDarkMode={isDarkMode}
              theme={theme}
            />
          </View>
        ) : null}

        {/* ── Lyric / chord content ── */}
        <ScrollView
          style={[st.contentArea, { backgroundColor: theme.bg }]}
          contentContainerStyle={st.contentPadding}>
          <SongContentViewer
            content={
              song?.content !== undefined
                ? song.content
                : migrateSongToInline(song || {})
            }
            semitones={transposeKey}
            showChords={showChords}
            themeState={theme}
            isDarkMode={isDarkMode}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const st = StyleSheet.create({
  screen: { flex: 1 },

  // HIG Navigation Bar (44pt standard height)
  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  barBtn: {
    width: 64,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barBtnLabel: { fontSize: 17, fontWeight: '400' },
  barBtnLabelDone: { fontSize: 17, fontWeight: '600' },
  barTitle: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  songName: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  songMeta: { fontSize: 13, textAlign: 'center', marginTop: 1 },

  // Toolbar — secondary controls
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  keyControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toolbarLabel: { fontSize: 13, fontWeight: '400' },
  stepBtn: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  stepBtnLabel: { fontSize: 18, fontWeight: '300', lineHeight: 22 },
  keyValue: { fontSize: 15, fontWeight: '600', minWidth: 28, textAlign: 'center' },

  toolbarActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleBtn: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 6, borderWidth: 1,
  },
  toggleLabel: { fontSize: 13, fontWeight: '400' },
  deleteBtn: { paddingHorizontal: 8, paddingVertical: 5 },
  deleteBtnLabel: { fontSize: 14, fontWeight: '400' },

  // Content
  contentArea: { flex: 1 },
  contentPadding: { padding: 16, paddingBottom: 48 },
});
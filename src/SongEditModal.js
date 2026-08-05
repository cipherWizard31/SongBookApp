import React from 'react';
import { View, Text, Modal, TextInput, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export const SongEditModal = ({
  modalVisible,
  setModalVisible,
  editingSongId,
  setEditingSongId,
  title,
  setTitle,
  author,
  setAuthor,
  style,
  setStyle,
  styles,
  scale,
  setScale,
  scales,
  content,
  setContent,
  audioUri,
  setAudioUri,
  recorderState,
  recordingStyleName,
  startRecording,
  stopRecording,
  handleSaveSong,
  theme,
  isDarkMode,
}) => {
  const resetAndClose = () => {
    setEditingSongId(null);
    setTitle('');
    setAuthor('');
    setStyle('Ballad (4/4)');
    setScale('1st (C Major/Tizeta)');
    setContent('');
    setAudioUri(null);
    setModalVisible(false);
  };

  return (
    <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
      <View style={stylesContainer.bottomSheetOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setModalVisible(false)} />
        <View style={[stylesContainer.bottomSheetContent, { backgroundColor: theme.cardBg }]}>
          <View style={[stylesContainer.dragHandle, { backgroundColor: isDarkMode ? '#444' : '#DDD' }]} />
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
            <Text style={[stylesContainer.modalHeader, { color: theme.text }]}>{editingSongId ? 'Edit Song' : 'New Song'}</Text>

            <Text style={[stylesContainer.inputLabel, { color: theme.subText }]}>TITLE *</Text>
            <TextInput
              style={[stylesContainer.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
              placeholder="Song Title"
              placeholderTextColor={theme.subText}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[stylesContainer.inputLabel, { color: theme.subText }]}>AUTHOR / ARTIST *</Text>
            <TextInput
              style={[stylesContainer.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
              placeholder="Artist or Composer"
              placeholderTextColor={theme.subText}
              value={author}
              onChangeText={setAuthor}
            />

            <Text style={[stylesContainer.inputLabel, { color: theme.subText }]}>RHYTHM / STYLE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginVertical: 4 }}>
              {styles.filter((st) => st !== 'All').map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[stylesContainer.chip, { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }, style === st && { backgroundColor: theme.chipSelectedBg, borderColor: theme.chipSelectedBg }]}
                  onPress={() => setStyle(st)}>
                  <Text style={[stylesContainer.chipText, { color: theme.chipText }, style === st && { color: theme.chipSelectedText, fontWeight: 'bold' }]}>{st}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[stylesContainer.inputLabel, { color: theme.subText }]}>SCALE (QENET)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginVertical: 4 }}>
              {scales.filter((sc) => sc !== 'All').map((sc) => (
                <TouchableOpacity
                  key={sc}
                  style={[stylesContainer.chip, { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }, scale === sc && { backgroundColor: theme.chipSelectedBg, borderColor: theme.chipSelectedBg }]}
                  onPress={() => setScale(sc)}>
                  <Text style={[stylesContainer.chipText, { color: theme.chipText }, scale === sc && { color: theme.chipSelectedText, fontWeight: 'bold' }]}>{sc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[stylesContainer.inputLabel, { color: theme.subText }]}>AUDIO MEMO</Text>
            <View style={stylesContainer.customInputRow}>
              {recorderState.isRecording && !recordingStyleName ? (
                <TouchableOpacity style={[stylesContainer.btn, { backgroundColor: 'red' }]} onPress={stopRecording}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Stop Recording</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[stylesContainer.btn, { backgroundColor: isDarkMode ? '#FFF' : '#000' }]} onPress={() => startRecording()}>
                  <Text style={{ color: isDarkMode ? '#000' : '#FFF', fontWeight: 'bold' }}>{audioUri ? 'Re-record Memo' : '🎙️ Record Memo'}</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={[stylesContainer.inputLabel, { color: theme.subText }]}>SONG CONTENT (INLINE BRACKET CHORDS)</Text>
            <TextInput
              style={[stylesContainer.input, stylesContainer.textArea, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
              placeholder={'[C]Amazing [G]grace\nHow [Am]sweet the [F]sound'}
              placeholderTextColor={theme.subText}
              multiline
              value={content}
              onChangeText={setContent}
            />

            <View style={stylesContainer.buttonRow}>
              <TouchableOpacity style={[stylesContainer.btn, stylesContainer.btnCancel, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={resetAndClose}>
                <Text style={[stylesContainer.btnCancelText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[stylesContainer.btn, stylesContainer.btnSave, { backgroundColor: isDarkMode ? '#FFF' : '#000' }]} onPress={handleSaveSong}>
                <Text style={[stylesContainer.btnSaveText, { color: isDarkMode ? '#000' : '#FFF' }]}>{editingSongId ? 'Update Song' : 'Save Song'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const stylesContainer = StyleSheet.create({
  bottomSheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheetContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '88%',
    elevation: 10,
  },
  dragHandle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  modalHeader: { fontSize: 22, fontWeight: '800' },
  inputLabel: { fontSize: 11, fontWeight: '700', marginTop: 14, marginBottom: 4, letterSpacing: 1.1 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15 },
  textArea: { height: 160, textAlignVertical: 'top' },
  customInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, marginRight: 6, borderWidth: 1 },
  chipText: { fontSize: 13 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { borderWidth: 1 },
  btnSave: { backgroundColor: '#000' },
  btnCancelText: { fontWeight: '600', fontSize: 15 },
  btnSaveText: { fontWeight: '700', fontSize: 15 },
});
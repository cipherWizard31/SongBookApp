import React, { useState } from 'react';
import {
  View, Text, Modal, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView,
} from 'react-native';

export const SongEditModal = ({
  modalVisible, setModalVisible,
  editingSongId, setEditingSongId,
  title, setTitle,
  author, setAuthor,
  album, setAlbum,
  style, setStyle, styles: rhythmStyles,
  scale, setScale, scales,
  content, setContent,
  audioUrl, setAudioUrl,
  handleSaveSong,
  theme, isDarkMode,
}) => {
  const [contentHeight, setContentHeight] = useState(120);

  const resetAndClose = () => {
    setEditingSongId(null);
    setTitle('');
    setAuthor('');
    setAlbum('');
    setStyle('Uncategorized');
    setScale('Uncategorized');
    setContent('');
    setAudioUrl('');
    setModalVisible(false);
  };

  const isEditing = !!editingSongId;

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={resetAndClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={st.overlay}>

        {/* Scrim tap-to-dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={resetAndClose}
        />

        <View style={[st.sheet, { backgroundColor: theme.bg }]}>
          {/* Sheet drag handle */}
          <View style={[st.handle, { backgroundColor: theme.border }]} />

          {/* HIG Navigation bar header */}
          <View style={[st.sheetHeader, { borderBottomColor: theme.divider }]}>
            <TouchableOpacity
              onPress={resetAndClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[st.headerAction, { color: theme.tint || theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[st.sheetTitle, { color: theme.text }]}>
              {isEditing ? 'Edit Song' : 'New Song'}
            </Text>
            <TouchableOpacity
              onPress={handleSaveSong}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[st.headerAction, st.headerActionPrimary, { color: theme.tint || theme.text }]}>
                {isEditing ? 'Update' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form scroll area */}
          <ScrollView
            contentContainerStyle={st.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            {/* Title */}
            <Text style={[st.label, { color: theme.subText }]}>TITLE *</Text>
            <TextInput
              style={[st.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }]}
              placeholder="Song title"
              placeholderTextColor={theme.subText}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />

            {/* Author */}
            <Text style={[st.label, { color: theme.subText }]}>ARTIST / AUTHOR *</Text>
            <TextInput
              style={[st.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }]}
              placeholder="Artist or composer"
              placeholderTextColor={theme.subText}
              value={author}
              onChangeText={setAuthor}
              returnKeyType="next"
            />

            {/* Album */}
            <Text style={[st.label, { color: theme.subText }]}>ALBUM / COLLECTION</Text>
            <TextInput
              style={[st.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }]}
              placeholder="Album name (optional)"
              placeholderTextColor={theme.subText}
              value={album}
              onChangeText={setAlbum}
              returnKeyType="next"
            />

            {/* Style chips */}
            <Text style={[st.label, { color: theme.subText }]}>RHYTHM / STYLE</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={st.chipRow}
              keyboardShouldPersistTaps="handled">
              {rhythmStyles.filter((s) => s !== 'All').map((s) => {
                const active = style === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      st.chip,
                      { backgroundColor: active ? theme.chipSelectedBg : theme.chipBg,
                        borderColor: active ? theme.chipSelectedBg : theme.chipBorder },
                    ]}
                    onPress={() => setStyle(s)}>
                    <Text style={[
                      st.chipLabel,
                      { color: active ? theme.chipSelectedText : theme.chipText },
                      active && st.chipActive,
                    ]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Scale chips */}
            <Text style={[st.label, { color: theme.subText }]}>SCALE (QENET)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={st.chipRow}
              keyboardShouldPersistTaps="handled">
              {scales.filter((s) => s !== 'All').map((s) => {
                const active = scale === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      st.chip,
                      { backgroundColor: active ? theme.chipSelectedBg : theme.chipBg,
                        borderColor: active ? theme.chipSelectedBg : theme.chipBorder },
                    ]}
                    onPress={() => setScale(s)}>
                    <Text style={[
                      st.chipLabel,
                      { color: active ? theme.chipSelectedText : theme.chipText },
                      active && st.chipActive,
                    ]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Audio URL */}
            <Text style={[st.label, { color: theme.subText }]}>AUDIO URL (OPTIONAL)</Text>
            <TextInput
              style={[st.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }]}
              placeholder="https://example.com/song.mp3 or YouTube link"
              placeholderTextColor={theme.subText}
              value={audioUrl}
              onChangeText={setAudioUrl}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            {/* Content / lyrics */}
            <Text style={[st.label, { color: theme.subText }]}>LYRICS & CHORDS</Text>
            <Text style={[st.hint, { color: theme.subText }]}>
              Wrap chords in brackets, e.g. [C]Amazing [G]grace
            </Text>
            <TextInput
              style={[
                st.input, st.textArea,
                { height: Math.min(Math.max(120, contentHeight), 240),
                  backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text },
              ]}
              placeholder={'[C]Amazing [G]grace\nHow [Am]sweet the [F]sound'}
              placeholderTextColor={theme.subText}
              multiline
              scrollEnabled
              nestedScrollEnabled
              textAlignVertical="top"
              onContentSizeChange={(e) => {
                if (e.nativeEvent?.contentSize) {
                  setContentHeight(e.nativeEvent.contentSize.height);
                }
              }}
              value={content}
              onChangeText={setContent}
            />

            {/* Bottom primary button */}
            <TouchableOpacity
              style={[st.saveBtn, { backgroundColor: theme.fabBg }]}
              onPress={handleSaveSong}>
              <Text style={[st.saveBtnLabel, { color: theme.fabText }]}>
                {isEditing ? 'Update Song' : 'Save Song'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const st = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '92%',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8, marginBottom: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: { fontSize: 17, fontWeight: '600' },
  headerAction: { fontSize: 17, fontWeight: '400' },
  headerActionPrimary: { fontWeight: '600' },

  form: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  label: {
    fontSize: 12, fontWeight: '500',
    marginTop: 16, marginBottom: 6,
    letterSpacing: 0.4,
  },
  hint: { fontSize: 12, marginBottom: 6, lineHeight: 16 },
  input: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12,
    fontSize: 16,
  },
  textArea: { textAlignVertical: 'top' },

  chipRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  chip: {
    height: 32, paddingHorizontal: 12,
    borderRadius: 16, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  chipLabel: { fontSize: 13 },
  chipActive: { fontWeight: '600' },

  saveBtn: {
    marginTop: 24, height: 48, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  saveBtnLabel: { fontSize: 16, fontWeight: '600' },
});
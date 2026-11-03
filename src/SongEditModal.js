import React, { useState, useRef } from 'react'; // React is used for JSX and hooks
import {
  View, Text, Modal, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const C_MAJOR_ROW_1 = ['C', 'Dm', 'Em', 'F'];
const C_MAJOR_ROW_2 = ['G', 'Am', 'Bdim']; // Ensure 'Bdim' is a valid chord

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
  theme,
}) => {
  const [contentHeight, setContentHeight] = useState(120);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const selectionRef = useRef({ start: 0, end: 0 });
  const mainInputRef = useRef(null);
  const fullInputRef = useRef(null);
  const lastTapRef = useRef(0);

  const handlePressLyricsArea = () => { // Removed unused parameter 'isFull'
    const now = Date.now();
    // const timeSinceLastTap = now - lastTapRef.current;
    lastTapRef.current = now;

  //   if (timeSinceLastTap < 450) {
  //     // Double tap detected! Open keyboard
  //     setKeyboardMode(true);
  //     const inputRef = isFull ? fullInputRef : mainInputRef;
  //     setTimeout(() => {
  //       inputRef.current?.focus();
  //     }, 50);
  //   } else if (!keyboardMode) {
  //     // Single tap: keep keyboard dismissed so chords can be inserted without interference
  //     Keyboard.dismiss();
  //   }
  };

  const handleSelectionChange = (newSelection) => {
    selectionRef.current = newSelection;
    setSelection(newSelection);
  };

  const toggleKeyboardMode = (isFull = false) => {
    const nextMode = !keyboardMode;
    setKeyboardMode(nextMode);
    if (nextMode) {
      const inputRef = isFull ? fullInputRef : mainInputRef;
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      Keyboard.dismiss();
    }
  };

  const insertChord = (chordName) => {
    const chordTag = `[${chordName}]`;
    const curContent = content || '';
    const { start = curContent.length, end = curContent.length } = selectionRef.current || {};
    const safeStart = Math.max(0, Math.min(start, curContent.length));
    const safeEnd = Math.max(0, Math.min(end, curContent.length));

    const newContent =
      curContent.slice(0, safeStart) + chordTag + curContent.slice(safeEnd);
    setContent(newContent);

    const newPos = safeStart + chordTag.length;
    const nextSel = { start: newPos, end: newPos };
    selectionRef.current = nextSel;
    setSelection(nextSel);
  };

  const handleBackspace = () => {
    const curContent = content || '';
    if (!curContent) return;
    const { start = curContent.length, end = curContent.length } = selectionRef.current || {};
    const safeStart = Math.max(0, Math.min(start, curContent.length));
    const safeEnd = Math.max(0, Math.min(end, curContent.length));

    if (safeStart !== safeEnd) {
      // Selected text: delete selection
      const newContent = curContent.slice(0, safeStart) + curContent.slice(safeEnd);
      setContent(newContent);
      const nextSel = { start: safeStart, end: safeStart };
      selectionRef.current = nextSel;
      setSelection(nextSel);
    } else if (safeStart > 0) {
      // If cursor is right after a chord bracket like [Dm]|, delete the entire chord tag
      const beforeCursor = curContent.slice(0, safeStart);
      const chordMatch = beforeCursor.match(/\[([A-G][b#]?(?:m|dim|aug|maj|sus)?[0-9]*)\]$/);
      const deleteCount = chordMatch ? chordMatch[0].length : 1;

      const newPos = safeStart - deleteCount;
      const newContent = curContent.slice(0, newPos) + curContent.slice(safeStart);
      setContent(newContent);
      const nextSel = { start: newPos, end: newPos };
      selectionRef.current = nextSel;
      setSelection(nextSel);
    }
  };

  const resetAndClose = () => {
    setEditingSongId(null);
    setTitle('');
    setAuthor('');
    setAlbum('');
    setStyle('Uncategorized'); // Ensure 'Uncategorized' is a valid style
    setScale('Uncategorized'); // Ensure 'Uncategorized' is a valid scale
    setContent('');
    setAudioUrl('');
    setIsFullscreen(false);
    setKeyboardMode(false);
    setSelection({ start: 0, end: 0 });
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
              maxLength={30}
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
              maxLength={30}
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
              maxLength={30}
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
                      {
                        backgroundColor: active ? theme.chipSelectedBg : theme.chipBg,
                        borderColor: active ? theme.chipSelectedBg : theme.chipBorder
                      },
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
            <Text style={[st.label, { color: theme.subText }]}>SCALE (QENET)</Text> // Ensure 'QENET' is intentional
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
                      {
                        backgroundColor: active ? theme.chipSelectedBg : theme.chipBg,
                        borderColor: active ? theme.chipSelectedBg : theme.chipBorder
                      },
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

            {/* Content / lyrics Header with Mode Toggle & Extend Button */}
            <View style={st.lyricsHeaderRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[st.label, { color: theme.subText, marginTop: 0, marginBottom: 2 }]}>
                  LYRICS & CHORDS
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity
                  style={[
                    st.extendBtn,
                    {
                      backgroundColor: keyboardMode ? (theme.tint || '#007AFF') : theme.cardBg,
                      borderColor: keyboardMode ? (theme.tint || '#007AFF') : theme.border,
                    },
                  ]}
                  onPress={() => toggleKeyboardMode(false)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons
                    name={keyboardMode ? 'musical-notes' : 'keypad-outline'}
                    size={15}
                    color={keyboardMode ? '#fff' : (theme.tint || theme.text)}
                  />
                  <Text
                    style={[
                      st.extendBtnText,
                      { color: keyboardMode ? '#fff' : (theme.tint || theme.text) },
                    ]}>
                    {keyboardMode ? 'Chords' : 'Keyboard'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[st.extendBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                  onPress={() => setIsFullscreen(true)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="expand-outline" size={15} color={theme.tint || theme.text} />
                  <Text style={[st.extendBtnText, { color: theme.tint || theme.text }]}>Extend</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => handlePressLyricsArea(false)}>
              <TextInput
                ref={mainInputRef}
                style={[
                  st.input, st.textArea,
                  {
                    height: Math.min(Math.max(120, contentHeight), 240),
                    backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text
                  },
                ]}
                placeholder={'[C]Amazing [G]grace\nHow [Am]sweet the [F]sound'}
                placeholderTextColor={theme.subText}
                multiline
                scrollEnabled
                nestedScrollEnabled
                textAlignVertical="top"
                showSoftInputOnFocus={keyboardMode}
                cursorColor={theme.tint || '#007AFF'}
                selectionColor={theme.tint || '#007AFF'}
                selection={selection}
                onContentSizeChange={(e) => {
                  if (e.nativeEvent?.contentSize) {
                    setContentHeight(e.nativeEvent.contentSize.height);
                  }
                }}
                value={content}
                onChangeText={setContent}
                onSelectionChange={(e) => {
                  handleSelectionChange(e.nativeEvent.selection);
                }}
              />
            </TouchableOpacity>

            {/* Quick Chord Palette */}
            <View style={st.chordPaletteContainer}>
              <Text style={[st.chordPaletteLabel, { color: theme.subText }]}>
                CHORD CHART
              </Text>

              {/* Row 1: C, Dm, Em, F */}
              <View style={st.chordRow}>
                {C_MAJOR_ROW_1.map((chord) => (
                  <TouchableOpacity
                    key={chord}
                    style={[
                      st.chordBtn,
                      {
                        backgroundColor: theme.cardBg || '#f2f2f7',
                        borderColor: theme.border || '#ccc',
                      },
                    ]}
                    activeOpacity={0.65}
                    onPress={() => insertChord(chord)}>
                    <Text style={[st.chordBtnText, { color: theme.tint || '#007AFF' }]}>
                      {`[${chord}]`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row 2: G, Am, Bdim + Backspace */}
              <View style={[st.chordRow, { marginTop: 8 }]}>
                {C_MAJOR_ROW_2.map((chord) => (
                  <TouchableOpacity
                    key={chord}
                    style={[
                      st.chordBtn,
                      {
                        backgroundColor: theme.cardBg || '#f2f2f7',
                        borderColor: theme.border || '#ccc',
                      },
                    ]}
                    activeOpacity={0.65}
                    onPress={() => insertChord(chord)}>
                    <Text style={[st.chordBtnText, { color: theme.tint || '#007AFF' }]}>
                      {`[${chord}]`}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    st.chordBtn,
                    {
                      backgroundColor: theme.cardBg || '#f2f2f7',
                      borderColor: theme.border || '#ccc',
                    },
                  ]}
                  activeOpacity={0.65}
                  onPress={handleBackspace}>
                  <Ionicons name="backspace-outline" size={22} color={theme.subText || theme.text} />
                </TouchableOpacity>
              </View>
            </View>

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

        {/* Fullscreen Lyrics & Chord Editor Modal */}
        <Modal
          visible={isFullscreen}
          animationType="fade"
          transparent={false}
          onRequestClose={() => setIsFullscreen(false)}>
          <SafeAreaView style={[st.fullscreenContainer, { backgroundColor: theme.bg }]}>
            {/* Fullscreen Header */}
            <View style={[st.fullscreenHeader, { borderBottomColor: theme.divider }]}>
              <TouchableOpacity
                style={st.fullscreenHeaderBtn}
                onPress={() => setIsFullscreen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="contract-outline" size={20} color={theme.tint || theme.text} />
                <Text style={[st.fullscreenActionText, { color: theme.tint || theme.text }]}>Done</Text>
              </TouchableOpacity>
              <Text style={[st.fullscreenTitle, { color: theme.text }]} numberOfLines={1}>
                {title ? `${title} (Lyrics)` : 'Lyrics & Chords'}
              </Text>
              <TouchableOpacity
                style={[
                  st.extendBtn,
                  {
                    backgroundColor: keyboardMode ? (theme.tint || '#007AFF') : theme.cardBg,
                    borderColor: keyboardMode ? (theme.tint || '#007AFF') : theme.border,
                  },
                ]}
                onPress={() => toggleKeyboardMode(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons
                  name={keyboardMode ? 'musical-notes' : 'keypad-outline'}
                  size={15}
                  color={keyboardMode ? '#fff' : (theme.tint || theme.text)}
                />
                <Text
                  style={[
                    st.extendBtnText,
                    { color: keyboardMode ? '#fff' : (theme.tint || theme.text) },
                  ]}>
                  {keyboardMode ? 'Chords' : 'Keyboard'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Fullscreen Lyrics Input */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ flex: 1 }}>
              <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={1}
                onPress={() => handlePressLyricsArea(true)}>
                <View style={st.fullscreenInputWrapper}>
                  <TextInput
                    ref={fullInputRef}
                    style={[
                      st.fullscreenTextInput,
                      {
                        backgroundColor: theme.cardBg,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                    placeholder={'[C]Amazing [G]grace\nHow [Am]sweet the [F]sound\n\nTap once on lyrics to set cursor for chords.\nDouble-tap (or press Keyboard above) to type words.'}
                    placeholderTextColor={theme.subText}
                    multiline
                    scrollEnabled
                    textAlignVertical="top"
                    showSoftInputOnFocus={keyboardMode}
                    cursorColor={theme.tint || '#007AFF'}
                    selectionColor={theme.tint || '#007AFF'}
                    selection={selection}
                    value={content}
                    onChangeText={setContent}
                    onSelectionChange={(e) => {
                      handleSelectionChange(e.nativeEvent.selection);
                    }}
                  />
                </View>
              </TouchableOpacity>

              {/* Fixed Footer with Chord Buttons */}
              <View
                style={[
                  st.fullscreenFooter,
                  {
                    backgroundColor: theme.cardBg || theme.bg,
                    borderTopColor: theme.divider || theme.border,
                  },
                ]}>
                <Text style={[st.chordPaletteLabel, { color: theme.subText, marginBottom: 6 }]}>
                  INSERT CHORD (C MAJOR)
                </Text>

                {/* Row 1: C, Dm, Em, F */}
                <View style={st.chordRow}>
                  {C_MAJOR_ROW_1.map((chord) => (
                    <TouchableOpacity
                      key={chord}
                      style={[
                        st.chordBtn,
                        {
                          backgroundColor: theme.bg || '#f2f2f7',
                          borderColor: theme.border || '#ccc',
                        },
                      ]}
                      activeOpacity={0.65}
                      onPress={() => insertChord(chord)}>
                      <Text style={[st.chordBtnText, { color: theme.tint || '#007AFF' }]}>
                        {`[${chord}]`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Row 2: G, Am, Bdim + Backspace */}
                <View style={[st.chordRow, { marginTop: 8 }]}>
                  {C_MAJOR_ROW_2.map((chord) => (
                    <TouchableOpacity
                      key={chord}
                      style={[
                        st.chordBtn,
                        {
                          backgroundColor: theme.bg || '#f2f2f7',
                          borderColor: theme.border || '#ccc',
                        },
                      ]}
                      activeOpacity={0.65}
                      onPress={() => insertChord(chord)}>
                      <Text style={[st.chordBtnText, { color: theme.tint || '#007AFF' }]}>
                        {`[${chord}]`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[
                      st.chordBtn,
                      {
                        backgroundColor: theme.bg || '#f2f2f7',
                        borderColor: theme.border || '#ccc',
                      },
                    ]}
                    activeOpacity={0.65}
                    onPress={handleBackspace}>
                    <Ionicons name="backspace-outline" size={22} color={theme.subText || theme.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
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

  chordPaletteContainer: {
    marginTop: 14,
  },
  chordPaletteLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chordRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  chordBtn: {
    flex: 1,
    minHeight: 46,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chordBtnText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  lyricsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 6,
  },
  extendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  extendBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  fullscreenContainer: {
    flex: 1,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fullscreenHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fullscreenActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fullscreenTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  fullscreenInputWrapper: {
    flex: 1,
    padding: 16,
  },
  fullscreenTextInput: {
    flex: 1,
    fontSize: 18,
    lineHeight: 26,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  fullscreenFooter: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
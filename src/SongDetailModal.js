import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
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
  const song = songDetailModal;
  const audioUrl = song?.audioUrl || song?.audioUri;

  const [fontSize, setFontSize] = useState(16);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPerformanceMode, setIsPerformanceMode] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  const scrollViewRef = useRef(null);
  const scrollOffsetRef = useRef(0);
  const autoScrollTimerRef = useRef(null);

  const handleScroll = (event) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  };

  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollTimerRef.current = setInterval(() => {
        if (scrollViewRef.current) {
          const nextOffset = scrollOffsetRef.current + scrollSpeed * 1.5;
          scrollViewRef.current.scrollTo({ y: nextOffset, animated: true });
          scrollOffsetRef.current = nextOffset;
        }
      }, 50);
    } else {
      if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
    }
    return () => {
      if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
    };
  }, [isAutoScrolling, scrollSpeed]);

  if (!song) return null;

  const author = song.author?.trim();
  const album = song.album?.trim();
  const hasScale = song.scale && song.scale !== 'Uncategorized';
  const hasStyle = song.style && song.style !== 'Uncategorized';

  const keyDisplay =
    transposeKey === 0
      ? 'Original Key'
      : transposeKey > 0
      ? `+${transposeKey}`
      : `${transposeKey}`;

  const confirmDelete = () => {
    setShowOverflowMenu(false);
    Alert.alert(
      'Delete Song',
      `Are you sure you want to delete "${song.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSongDetailModal(null);
            handleDeleteSong(song.id);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={!!song}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => setSongDetailModal(null)}>
      <StatusBar style={isPerformanceMode || isDarkMode ? 'light' : 'dark'} />

      {isPerformanceMode ? (
        <SafeAreaView style={[st.perfScreen, { backgroundColor: '#0A0A0C' }]}>
          <View style={st.perfHeader}>
            <View style={{ flex: 1 }}>
              <Text style={st.perfTitle} numberOfLines={1}>
                {song.title}
              </Text>
              <Text style={st.perfMeta} numberOfLines={1}>
                {[author, song.scale, song.style].filter(Boolean).join('  •  ')}
              </Text>
            </View>

            <TouchableOpacity
              style={st.perfExitBtn}
              onPress={() => {
                setIsAutoScrolling(false);
                setIsPerformanceMode(false);
              }}
              accessibilityLabel="Exit Performance Mode">
              <Ionicons name="contract-outline" size={20} color="#FFFFFF" />
              <Text style={st.perfExitText}>Exit</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={st.perfContentArea}
            contentContainerStyle={st.perfContentPadding}>
            <SongContentViewer
              content={
                song.content !== undefined
                  ? song.content
                  : migrateSongToInline(song)
              }
              semitones={transposeKey}
              showChords={showChords}
              themeState={{ text: '#F3F4F6', subText: '#9CA3AF' }}
              isDarkMode={true}
              fontSize={fontSize + 4}
            />
          </ScrollView>

          <View style={st.perfControlBar}>
            <TouchableOpacity
              style={[
                st.perfBarBtn,
                isAutoScrolling && { backgroundColor: '#2563EB' },
              ]}
              onPress={() => setIsAutoScrolling(!isAutoScrolling)}>
              <Ionicons
                name={isAutoScrolling ? 'pause' : 'play'}
                size={18}
                color="#FFFFFF"
              />
              <Text style={st.perfBarBtnText}>
                {isAutoScrolling ? 'Pause Scroll' : 'Auto Scroll'}
              </Text>
            </TouchableOpacity>

            {isAutoScrolling && (
              <View style={st.speedPillWrap}>
                {[0.5, 1, 1.5, 2].map((spd) => (
                  <TouchableOpacity
                    key={`spd-${spd}`}
                    style={[
                      st.speedChip,
                      scrollSpeed === spd && { backgroundColor: '#374151' },
                    ]}
                    onPress={() => setScrollSpeed(spd)}>
                    <Text style={st.speedChipText}>{spd}x</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={st.perfFontStepper}>
              <TouchableOpacity
                style={st.fontStepBtn}
                onPress={() => setFontSize(Math.max(12, fontSize - 2))}>
                <Text style={st.fontStepText}>A-</Text>
              </TouchableOpacity>
              <Text style={st.fontValText}>{fontSize}</Text>
              <TouchableOpacity
                style={st.fontStepBtn}
                onPress={() => setFontSize(Math.min(32, fontSize + 2))}>
                <Text style={st.fontStepText}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView style={[st.screen, { backgroundColor: theme.bg }]}>
          <View style={[st.topNav, { borderBottomColor: theme.divider }]}>
            <TouchableOpacity
              style={st.iconNavBtn}
              onPress={() => setSongDetailModal(null)}
              accessibilityLabel="Close song view">
              <Ionicons name="chevron-down" size={24} color={theme.text} />
            </TouchableOpacity>

            <Text style={[st.navHeaderTitle, { color: theme.subText }]} numberOfLines={1}>
              SONGBOOK
            </Text>

            <View style={st.topNavRight}>
              <TouchableOpacity
                style={st.iconNavBtn}
                onPress={() => setIsFavorite(!isFavorite)}
                accessibilityLabel="Toggle Favorite">
                <Ionicons
                  name={isFavorite ? 'star' : 'star-outline'}
                  size={20}
                  color={isFavorite ? '#F59E0B' : theme.text}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={st.iconNavBtn}
                onPress={() => setIsPerformanceMode(true)}
                accessibilityLabel="Enter Performance Mode">
                <Ionicons name="expand-outline" size={20} color={theme.tint} />
              </TouchableOpacity>

              <TouchableOpacity
                style={st.iconNavBtn}
                onPress={() => handleEditSong(song)}
                accessibilityLabel="Edit Song">
                <Ionicons name="create-outline" size={20} color={theme.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={st.iconNavBtn}
                onPress={() => setShowOverflowMenu(!showOverflowMenu)}
                accessibilityLabel="More options">
                <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          {showOverflowMenu && (
            <View style={[st.overflowMenu, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <TouchableOpacity style={st.overflowMenuItem} onPress={confirmDelete}>
                <Ionicons name="trash-outline" size={18} color={theme.destructive || '#EF4444'} style={{ marginRight: 8 }} />
                <Text style={[st.overflowMenuText, { color: theme.destructive || '#EF4444' }]}>Delete Song</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            ref={scrollViewRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={[st.scrollArea, { backgroundColor: theme.bg }]}
            contentContainerStyle={st.scrollPadding}>

            <View style={st.songHeaderSection}>
              <Text style={[st.mainTitle, { color: theme.text }]}>
                {song.title}
              </Text>

              {(author || album) ? (
                <Text style={[st.artistMetaSub, { color: theme.subText }]}>
                  {[author, album].filter(Boolean).join('  •  ')}
                </Text>
              ) : null}

              <View style={st.metaStripRow}>
                <View style={[st.metaPill, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                  <Ionicons name="key-outline" size={12} color={theme.tint} style={{ marginRight: 4 }} />
                  <Text style={[st.metaPillLabel, { color: theme.subText }]}>Key:</Text>
                  <Text style={[st.metaPillVal, { color: theme.text }]}>{keyDisplay}</Text>
                </View>

                {hasScale && (
                  <View style={[st.metaPill, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                    <Ionicons name="musical-notes-outline" size={12} color={theme.tint} style={{ marginRight: 4 }} />
                    <Text style={[st.metaPillVal, { color: theme.text }]}>{song.scale}</Text>
                  </View>
                )}

                {hasStyle && (
                  <View style={[st.metaPill, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                    <Ionicons name="pulse-outline" size={12} color={theme.subText} style={{ marginRight: 4 }} />
                    <Text style={[st.metaPillVal, { color: theme.subText }]}>{song.style}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={[st.liveToolbar, { backgroundColor: theme.secondaryBg, borderColor: theme.divider }]}>
              <View style={st.toolGroup}>
                <Text style={[st.toolLabel, { color: theme.subText }]}>KEY</Text>
                <View style={[st.stepperWrap, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                  <TouchableOpacity
                    style={st.stepperBtn}
                    onPress={() => setTransposeKey(transposeKey - 1)}>
                    <Text style={[st.stepperSign, { color: theme.text }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={[st.stepperVal, { color: theme.text }]}>
                    {transposeKey > 0 ? `+${transposeKey}` : transposeKey}
                  </Text>
                  <TouchableOpacity
                    style={st.stepperBtn}
                    onPress={() => setTransposeKey(transposeKey + 1)}>
                    <Text style={[st.stepperSign, { color: theme.text }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={st.toolGroup}>
                <Text style={[st.toolLabel, { color: theme.subText }]}>SIZE</Text>
                <View style={[st.stepperWrap, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                  <TouchableOpacity
                    style={st.stepperBtn}
                    onPress={() => setFontSize(Math.max(12, fontSize - 2))}>
                    <Text style={[st.stepperSign, { color: theme.text }]}>A-</Text>
                  </TouchableOpacity>
                  <Text style={[st.stepperVal, { color: theme.text }]}>{fontSize}</Text>
                  <TouchableOpacity
                    style={st.stepperBtn}
                    onPress={() => setFontSize(Math.min(32, fontSize + 2))}>
                    <Text style={[st.stepperSign, { color: theme.text }]}>A+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  st.toolToggleBtn,
                  {
                    backgroundColor: showChords ? theme.tint : theme.cardBg,
                    borderColor: showChords ? theme.tint : theme.border,
                  },
                ]}
                onPress={() => setShowChords(!showChords)}>
                <Ionicons
                  name="musical-note"
                  size={14}
                  color={showChords ? '#FFFFFF' : theme.subText}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    st.toolToggleText,
                    { color: showChords ? '#FFFFFF' : theme.text },
                  ]}>
                  Chords
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  st.toolToggleBtn,
                  {
                    backgroundColor: isAutoScrolling ? theme.tint : theme.cardBg,
                    borderColor: isAutoScrolling ? theme.tint : theme.border,
                  },
                ]}
                onPress={() => setIsAutoScrolling(!isAutoScrolling)}>
                <Ionicons
                  name={isAutoScrolling ? 'pause' : 'play'}
                  size={13}
                  color={isAutoScrolling ? '#FFFFFF' : theme.subText}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    st.toolToggleText,
                    { color: isAutoScrolling ? '#FFFFFF' : theme.text },
                  ]}>
                  Scroll
                </Text>
              </TouchableOpacity>
            </View>

            {audioUrl ? (
              <View style={{ marginBottom: 16 }}>
                <AudioPreviewBanner
                  audioUrl={audioUrl}
                  onPressPlay={(url) => playSound(url)}
                  isDarkMode={isDarkMode}
                  theme={theme}
                />
              </View>
            ) : null}

            <SongContentViewer
              content={
                song.content !== undefined
                  ? song.content
                  : migrateSongToInline(song)
              }
              semitones={transposeKey}
              showChords={showChords}
              themeState={theme}
              isDarkMode={isDarkMode}
              fontSize={fontSize}
            />
          </ScrollView>
        </SafeAreaView>
      )}
    </Modal>
  );
};

const st = StyleSheet.create({
  screen: { flex: 1 },

  topNav: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconNavBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  navHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  overflowMenu: {
    position: 'absolute',
    top: 52,
    right: 16,
    zIndex: 99,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 4,
    width: 150,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  overflowMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  overflowMenuText: {
    fontSize: 14,
    fontWeight: '500',
  },

  scrollArea: { flex: 1 },
  scrollPadding: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 64,
  },

  songHeaderSection: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 32,
    marginBottom: 6,
  },
  artistMetaSub: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 12,
  },
  metaStripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  metaPillLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 3,
  },
  metaPillVal: {
    fontSize: 12,
    fontWeight: '600',
  },

  liveToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
    gap: 8,
  },
  toolGroup: {
    alignItems: 'center',
  },
  toolLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    height: 32,
    paddingHorizontal: 4,
  },
  stepperBtn: {
    width: 26,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperSign: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepperVal: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 22,
    textAlign: 'center',
  },
  toolToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 13,
  },
  toolToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },

  perfScreen: {
    flex: 1,
  },
  perfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#27272A',
  },
  perfTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  perfMeta: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  perfExitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  perfExitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  perfContentArea: {
    flex: 1,
  },
  perfContentPadding: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 96,
  },
  perfControlBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#18181B',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#27272A',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  perfBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  perfBarBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  speedPillWrap: {
    flexDirection: 'row',
    backgroundColor: '#27272A',
    borderRadius: 8,
    padding: 2,
  },
  speedChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  speedChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  perfFontStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 10,
    paddingHorizontal: 6,
    height: 34,
    gap: 6,
  },
  fontStepBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  fontStepText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  fontValText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 18,
    textAlign: 'center',
  },
});

export default SongDetailModal;
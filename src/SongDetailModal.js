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

// ─── Design tokens from Stitch system ───────────────────────────────────────
const AMBER = '#E5A93C';
const CYAN = '#38BDF8';
const BURG = '#862633';

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
  handleToggleFavorite,
  theme,
  isDarkMode,
}) => {
  const song = songDetailModal;
  const audioUrl = song?.audioUrl || song?.audioUri;

  const [fontSize, setFontSize] = useState(16);
  const isFavorite = Boolean(song?.isFavorite);
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
          const next = scrollOffsetRef.current + scrollSpeed * 1.5;
          scrollViewRef.current.scrollTo({ y: next, animated: true });
          scrollOffsetRef.current = next;
        }
      }, 50);
    } else {
      if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
    }
    return () => { if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current); };
  }, [isAutoScrolling, scrollSpeed]);

  if (!song) return null;

  const author = song.author?.trim();
  const album = song.album?.trim();
  const hasScale = song.scale && song.scale !== 'Uncategorized';
  const hasStyle = song.style && song.style !== 'Uncategorized';
  const keyLabel = transposeKey === 0 ? 'Original' : transposeKey > 0 ? `+${transposeKey}` : `${transposeKey}`;

  const confirmDelete = () => {
    setShowOverflowMenu(false);
    Alert.alert('Delete Song', `Delete "${song.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { setSongDetailModal(null); handleDeleteSong(song.id); } },
    ]);
  };

  // ─── Performance Mode ────────────────────────────────────────────────────
  if (isPerformanceMode) {
    return (
      <Modal visible animationType="slide" statusBarTranslucent onRequestClose={() => setIsPerformanceMode(false)}>
        <StatusBar style="light" />
        <SafeAreaView style={st.perfScreen}>
          {/* Perf Header */}
          <View style={st.perfHeader}>
            <View style={{ flex: 1 }}>
              <Text style={st.perfTitle} numberOfLines={1}>{song.title}</Text>
              <Text style={st.perfMeta} numberOfLines={1}>
                {[author, song.scale, song.style].filter(Boolean).join('  •  ')}
              </Text>
            </View>
            <TouchableOpacity style={st.perfExitBtn} onPress={() => { setIsAutoScrolling(false); setIsPerformanceMode(false); }}>
              <Ionicons name="contract-outline" size={18} color="#FFF" />
              <Text style={st.perfExitText}>Exit</Text>
            </TouchableOpacity>
          </View>

          <ScrollView ref={scrollViewRef} onScroll={handleScroll} scrollEventThrottle={16}
            style={{ flex: 1 }} contentContainerStyle={st.perfContentPadding}>
            <SongContentViewer
              content={song.content !== undefined ? song.content : migrateSongToInline(song)}
              semitones={transposeKey}
              showChords={showChords}
              themeState={{ text: '#F1F5F9', subText: '#94A3B8' }}
              isDarkMode={true}
              fontSize={fontSize + 4}
            />
          </ScrollView>

          {/* Perf Control Bar */}
          <View style={st.perfControlBar}>
            <View style={st.perfTopControlsRow}>
              <TouchableOpacity
                style={[st.perfBarBtn, isAutoScrolling && { backgroundColor: AMBER }]}
                onPress={() => setIsAutoScrolling(!isAutoScrolling)}>
                <Ionicons name={isAutoScrolling ? 'pause' : 'play'} size={15} color={isAutoScrolling ? '#1E1909' : '#FFF'} />
                <Text style={[st.perfBarBtnText, isAutoScrolling && { color: '#1E1909' }]}>
                  {isAutoScrolling ? 'Pause' : 'Auto Scroll'}
                </Text>
              </TouchableOpacity>

              <View style={st.perfFontStepper}>
                <TouchableOpacity style={st.fontStepBtn} onPress={() => setFontSize(Math.max(12, fontSize - 2))}>
                  <Text style={st.fontStepText}>A−</Text>
                </TouchableOpacity>
                <Text style={st.fontValText}>{fontSize}</Text>
                <TouchableOpacity style={st.fontStepBtn} onPress={() => setFontSize(Math.min(32, fontSize + 2))}>
                  <Text style={st.fontStepText}>A+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {isAutoScrolling && (
              <View style={st.perfSpeedRow}>
                <Text style={st.speedLabel}>SPEED</Text>
                <View style={st.speedPillWrap}>
                  {[0.5, 1, 1.5, 2].map((spd) => (
                    <TouchableOpacity
                      key={spd}
                      style={[st.speedChip, scrollSpeed === spd && { backgroundColor: AMBER }]}
                      onPress={() => setScrollSpeed(spd)}>
                      <Text style={[st.speedChipText, scrollSpeed === spd && { color: '#1E1909', fontWeight: '700' }]}>
                        {spd}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  // ─── Normal Detail View ──────────────────────────────────────────────────
  return (
    <Modal visible={!!song} animationType="slide" statusBarTranslucent onRequestClose={() => setSongDetailModal(null)}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <SafeAreaView style={[st.screen, { backgroundColor: theme.bg }]}>

        {/* ── Top Nav Bar ── */}
        <View style={[st.topNav, { borderBottomColor: theme.divider }]}>
          <TouchableOpacity style={st.iconNavBtn} onPress={() => setSongDetailModal(null)}>
            <Ionicons name="chevron-down" size={24} color={theme.text} />
          </TouchableOpacity>

          <View style={[st.screenLabelPill, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[st.screenLabelText, { color: theme.subText }]}>SONGBOOK</Text>
          </View>

          <View style={st.topNavRight}>
            <TouchableOpacity
              style={st.iconNavBtn}
              onPress={() => handleToggleFavorite && handleToggleFavorite(song.id)}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remove from favourites' : 'Add to favourites'}>
              <Ionicons name={isFavorite ? 'star' : 'star-outline'} size={20} color={isFavorite ? AMBER : theme.subText} />
            </TouchableOpacity>
            <TouchableOpacity style={[st.iconNavBtn, { backgroundColor: theme.cardBg, borderRadius: 10 }]}
              onPress={() => setIsPerformanceMode(true)}>
              <Ionicons name="expand-outline" size={18} color={AMBER} />
            </TouchableOpacity>
            <TouchableOpacity style={st.iconNavBtn} onPress={() => handleEditSong(song)}>
              <Ionicons name="create-outline" size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={st.iconNavBtn} onPress={() => setShowOverflowMenu(!showOverflowMenu)}>
              <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Scrollable Content ── */}
        <ScrollView ref={scrollViewRef} onScroll={handleScroll} scrollEventThrottle={16}
          style={{ flex: 1, backgroundColor: theme.bg }}
          contentContainerStyle={st.scrollPadding}
          showsVerticalScrollIndicator={false}>

          {/* Song Header Hero Card */}
          <View style={[st.songHeader, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            {/* Top row with hero badge and quick action */}
            <View style={st.headerTopRow}>
              <View style={[st.songIcon, { backgroundColor: `${AMBER}15`, borderColor: `${AMBER}35` }]}>
                <Ionicons name="musical-notes" size={24} color={AMBER} />
              </View>
              <View style={st.headerActions}>
                <TouchableOpacity
                  style={[st.actionChip, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}
                  onPress={() => setIsPerformanceMode(true)}
                  activeOpacity={0.7}>
                  <Ionicons name="expand-outline" size={13} color={AMBER} style={{ marginRight: 4 }} />
                  <Text style={[st.actionChipText, { color: theme.text }]}>Perform</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[st.mainTitle, { color: theme.text }]}>{song.title}</Text>

            {(author || album) ? (
              <View style={st.metaLine}>
                {author ? (
                  <View style={st.metaItem}>
                    <Ionicons name="person-outline" size={13} color={theme.subText} style={{ marginRight: 4 }} />
                    <Text style={[st.artistSub, { color: theme.subText }]}>{author}</Text>
                  </View>
                ) : null}
                {(author && album) ? (
                  <Text style={[st.metaDot, { color: theme.divider }]}>•</Text>
                ) : null}
                {album ? (
                  <View style={st.metaItem}>
                    <Ionicons name="disc-outline" size={13} color={theme.subText} style={{ marginRight: 4 }} />
                    <Text style={[st.artistSub, { color: theme.subText }]}>{album}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* Kignit Scale & Rhythm pills */}
            {(hasScale || hasStyle) ? (
              <View style={st.tagRow}>
                {hasScale && (
                  <View style={[st.kignitPill, { backgroundColor: `${AMBER}14`, borderColor: `${AMBER}38` }]}>
                    <Ionicons name="key-outline" size={11} color={AMBER} style={{ marginRight: 5 }} />
                    <Text style={[st.kignitPillText, { color: AMBER }]}>{song.scale}</Text>
                  </View>
                )}
                {hasStyle && (
                  <View style={[st.rhythmPill, { backgroundColor: `${BURG}15`, borderColor: `${BURG}40` }]}>
                    <Ionicons name="pulse-outline" size={11} color={BURG} style={{ marginRight: 5 }} />
                    <Text style={[st.rhythmPillText, { color: BURG }]}>{song.style}</Text>
                  </View>
                )}
              </View>
            ) : null}
          </View>

          {/* ── Live Transpose & Display Toolbar ── */}
          <View style={[st.liveToolbar, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            {/* Key Transpose */}
            <View style={st.toolGroup}>
              <Text style={[st.toolLabel, { color: theme.subText }]}>KEY</Text>
              <View style={[st.stepper, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
                <TouchableOpacity
                  style={st.stepBtn}
                  onPress={() => setTransposeKey(transposeKey - 1)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Text style={[st.stepSign, { color: theme.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[st.stepVal, { color: AMBER }]}>{keyLabel}</Text>
                <TouchableOpacity
                  style={st.stepBtn}
                  onPress={() => setTransposeKey(transposeKey + 1)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Text style={[st.stepSign, { color: theme.text }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider between tools */}
            <View style={[st.toolDivider, { backgroundColor: theme.divider }]} />

            {/* Font Size */}
            <View style={st.toolGroup}>
              <Text style={[st.toolLabel, { color: theme.subText }]}>FONT</Text>
              <View style={[st.stepper, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
                <TouchableOpacity
                  style={st.stepBtn}
                  onPress={() => setFontSize(Math.max(12, fontSize - 2))}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Text style={[st.stepSign, { color: theme.text }]}>A−</Text>
                </TouchableOpacity>
                <Text style={[st.stepVal, { color: theme.text }]}>{fontSize}</Text>
                <TouchableOpacity
                  style={st.stepBtn}
                  onPress={() => setFontSize(Math.min(32, fontSize + 2))}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Text style={[st.stepSign, { color: theme.text }]}>A+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider between tools */}
            <View style={[st.toolDivider, { backgroundColor: theme.divider }]} />

            {/* Chords Toggle */}
            <View style={st.toolGroup}>
              <Text style={[st.toolLabel, { color: theme.subText }]}>CHORDS</Text>
              <TouchableOpacity
                style={[
                  st.toggleBtn,
                  {
                    backgroundColor: showChords ? `${CYAN}20` : theme.secondaryBg,
                    borderColor: showChords ? `${CYAN}60` : theme.border,
                  },
                ]}
                activeOpacity={0.75}
                onPress={() => setShowChords(!showChords)}>
                <Ionicons
                  name={showChords ? 'musical-notes' : 'musical-note-outline'}
                  size={13}
                  color={showChords ? CYAN : theme.subText}
                  style={{ marginRight: 4 }}
                />
                <Text style={[st.toggleText, { color: showChords ? CYAN : theme.subText }]}>
                  {showChords ? 'On' : 'Off'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Audio Banner */}
          {audioUrl ? (
            <View style={{ marginBottom: 16 }}>
              <AudioPreviewBanner audioUrl={audioUrl} onPressPlay={(url) => playSound(url)} isDarkMode={isDarkMode} theme={theme} />
            </View>
          ) : null}

          {/* Song Content / Lyrics Card */}
          <View style={[st.contentCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={st.contentCardHeader}>
              <View style={[st.lyricsPill, { backgroundColor: theme.secondaryBg }]}>
                <Ionicons name="document-text-outline" size={11} color={theme.subText} style={{ marginRight: 4 }} />
                <Text style={[st.lyricsPillText, { color: theme.subText }]}>CHORDS & LYRICS</Text>
              </View>
              {transposeKey !== 0 && (
                <View style={[st.transposedBadge, { backgroundColor: `${AMBER}15` }]}>
                  <Text style={[st.transposedBadgeText, { color: AMBER }]}>
                    Transposed ({keyLabel})
                  </Text>
                </View>
              )}
            </View>

            <SongContentViewer
              content={song.content !== undefined ? song.content : migrateSongToInline(song)}
              semitones={transposeKey}
              showChords={showChords}
              themeState={theme}
              isDarkMode={isDarkMode}
              fontSize={fontSize}
            />
          </View>
        </ScrollView>

        {/* Backdrop — rendered AFTER ScrollView so it sits above it in the view stack */}
        {showOverflowMenu && (
          <TouchableOpacity
            style={[StyleSheet.absoluteFillObject, { zIndex: 90 }]}
            activeOpacity={1}
            onPress={() => setShowOverflowMenu(false)}
          />
        )}

        {/* Overflow Menu — above backdrop */}
        {showOverflowMenu && (
          <View style={[st.overflowMenu, { backgroundColor: theme.cardBg, borderColor: theme.border, zIndex: 100 }]}>
            <TouchableOpacity style={st.overflowMenuItem} onPress={confirmDelete}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={[st.overflowMenuText, { color: '#EF4444' }]}>Delete Song</Text>
            </TouchableOpacity>
          </View>
        )}

      </SafeAreaView>
    </Modal>
  );
};

const st = StyleSheet.create({
  screen: { flex: 1 },

  // Top nav
  topNav: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconNavBtn: {
    width: 40, height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  screenLabelPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  screenLabelText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  topNavRight: { flexDirection: 'row', alignItems: 'center', gap: 2 },

  // Overflow
  overflowMenu: {
    position: 'absolute', top: 56, right: 12, zIndex: 99,
    borderRadius: 12, borderWidth: 1, paddingVertical: 4, width: 148,
    elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  overflowMenuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11 },
  overflowMenuText: { fontSize: 14, fontWeight: '600' },

  // Scroll
  scrollPadding: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 72 },

  // Song Header Card
  songHeader: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  songIcon: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mainTitle: {
    fontSize: 24, fontWeight: '700', letterSpacing: -0.4,
    lineHeight: 30, marginBottom: 8,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaDot: {
    fontSize: 12,
    marginHorizontal: 2,
  },
  artistSub: {
    fontSize: 13, fontWeight: '500',
  },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  kignitPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1,
  },
  kignitPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  rhythmPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1,
  },
  rhythmPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },

  // Live Toolbar
  liveToolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 16, borderWidth: 1,
    marginBottom: 16,
  },
  toolGroup: { alignItems: 'center', flex: 1 },
  toolDivider: { width: 1, height: 28 },
  toolLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.9, marginBottom: 4 },
  stepper: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: StyleSheet.hairlineWidth,
    height: 32, paddingHorizontal: 2,
  },
  stepBtn: { width: 26, height: 30, justifyContent: 'center', alignItems: 'center' },
  stepSign: { fontSize: 13, fontWeight: '700' },
  stepVal: { fontSize: 12, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 32, paddingHorizontal: 10, borderRadius: 10,
    borderWidth: 1,
  },
  toggleText: { fontSize: 12, fontWeight: '700' },

  // Content Card
  contentCard: {
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 18, paddingVertical: 18,
  },
  contentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  lyricsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lyricsPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  transposedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  transposedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Performance Mode ─────────────────────────────────────────────────────
  perfScreen: { flex: 1, backgroundColor: '#0A0D12' },
  perfHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#27272A',
  },
  perfTitle: { fontSize: 22, fontWeight: '700', color: '#F1F5F9', marginBottom: 2 },
  perfMeta: { fontSize: 13, color: '#94A3B8' },
  perfExitBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#27272A', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, gap: 6,
  },
  perfExitText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  perfContentPadding: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 96 },
  perfControlBar: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
    backgroundColor: '#141821', borderRadius: 18,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: '#27272A',
    elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  perfTopControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  perfBarBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#27272A', paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 10, gap: 6,
  },
  perfBarBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  perfSpeedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#27272A',
    width: '100%',
  },
  speedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  speedPillWrap: { flexDirection: 'row', backgroundColor: '#27272A', borderRadius: 8, padding: 2, gap: 4 },
  speedChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  speedChipText: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  perfFontStepper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#27272A', borderRadius: 10,
    paddingHorizontal: 6, height: 36, gap: 6,
  },
  fontStepBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  fontStepText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  fontValText: { color: '#94A3B8', fontSize: 12, fontWeight: '600', minWidth: 20, textAlign: 'center' },
});

export default SongDetailModal;
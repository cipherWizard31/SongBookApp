import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Image,
  Animated,
  Dimensions,
  BackHandler,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  createAudioPlayer,
} from 'expo-audio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

// ==========================================
// CORE DATA & CONSTANTS
// ==========================================
const DEFAULT_STYLES = [
  'All',
  'Waltz (3/4)',
  'Ballad (4/4)',
  'Wollo (6/8)',
  'Reggae (2/4)',
  'Chikchika (6/8)',
  'Disco (4/4)',
  'Swing(4/4)',
];

const DEFAULT_SCALES = [
  'All',
  '1st (C Major/Tizeta)',
  '2nd (D Minor/Natural)',
  '5th (C Major/Ambassel)',
  '6th (D Minor/Bati)',
  'C Minor (Anchihoye)',
  'C Minor (Tizeta)',
  'C Minor (Ambassel)',
  'C Minor (Blues)',
];

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const STYLE_DICTIONARY_INITIAL = [
  { name: 'Waltz (3/4)', rhythm: '1 - 2 - 3', description: 'Triple time rhythm ideal for slow devotional worship.', audioUri: null },
  { name: 'Ballad (4/4)', rhythm: '1 - 2 - 3 - 4', description: 'Standard 4/4 slow worship tempo.', audioUri: null },
  { name: 'Wollo (6/8)', rhythm: '1-2-3, 4-5-6', description: 'Traditional Ethiopian 6/8 compound rhythm.', audioUri: null },
  { name: 'Reggae (2/4)', rhythm: 'Offbeat Emphasis', description: 'Upbeat rhythm with syncopated offbeats.', audioUri: null },
  { name: 'Chikchika (6/8)', rhythm: 'Fast 6/8 Syncopation', description: 'Lively fast-paced traditional rhythm.', audioUri: null },
  { name: 'Disco (4/4)', rhythm: 'Four on the Floor', description: 'Upbeat energetic dance rhythm.', audioUri: null },
  { name: 'Swing (4/4)', rhythm: 'Swung Eighths', description: 'Classic jazz/swing beat pattern.', audioUri: null },
];

const SCALE_DICTIONARY = [
  { name: '1st (C Major/Tizeta)', notes: 'C - D - E - G - A', description: 'Traditional nostalgic pentatonic scale.' },
  { name: '2nd (D Minor/Natural)', notes: 'D - E - F - G - A - Bb - C', description: 'Standard minor scale for worship songs.' },
  { name: '5th (C Major/Ambassel)', notes: 'C - Db - F - G - Ab', description: 'Features a flat second, ideal for prayerful worship.' },
  { name: '6th (D Minor/Bati)', notes: 'D - F - G - A - C', description: 'Minor pentatonic used in worship ballads.' },
  { name: 'C Minor (Anchihoye)', notes: 'C - Db - F - Gb - Bb', description: 'Unique scale evoking deep spiritual reverence.' },
  { name: 'C Minor (Tizeta)', notes: 'C - D - Eb - G - Ab', description: 'Minor variant of Tizeta.' },
  { name: 'C Minor (Ambassel)', notes: 'C - Eb - F - Ab - Bb', description: 'Deep minor Ambassel variation.' },
  { name: 'C Minor (Blues)', notes: 'C - Eb - F - F# - G - Bb', description: 'Contemporary worship scale.' },
];

const STORAGE_KEY = '@songbook_songs';
const CUSTOM_STYLES_KEY = '@songbook_custom_styles';
const CUSTOM_SCALES_KEY = '@songbook_custom_scales';
const STYLE_DICT_KEY = '@songbook_style_dictionary';
const DARK_MODE_KEY = '@songbook_dark_mode';

// ==========================================
// CHORD & LYRIC UTILITIES (PARSER & TRANSPOSER)
// ==========================================

/**
 * Transposes a single chord string by given semitones.
 */
function transposeChord(chord, semitones) {
  if (!chord || semitones === 0) return chord;
  return chord.replace(/\b[A-G](?:#|b)?(?:m|maj|min|7|m7|dim|aug|add9|sus2|sus4|\/[A-G](?:#|b)?)?\b/g, (match) => {
    const rootMatch = match.match(/^[A-G](?:#|b)?/);
    if (!rootMatch) return match;
    const root = rootMatch[0];
    const suffix = match.slice(root.length);

    let idx = CHROMATIC_NOTES.indexOf(root);
    if (idx === -1) {
      if (root === 'Bb') idx = 10;
      if (root === 'Eb') idx = 3;
      if (root === 'Ab') idx = 8;
      if (root === 'Db') idx = 1;
      if (root === 'Gb') idx = 6;
    }
    if (idx === -1) return match;

    let newIdx = (idx + semitones) % 12;
    if (newIdx < 0) newIdx += 12;
    return CHROMATIC_NOTES[newIdx] + suffix;
  });
}

/**
 * Parses a single line into structural objects.
 * Handles bracketed chords [C], empty lyric segments, sections, and plain text.
 */
function parseChordLine(line) {
  const trimmed = line.trim();

  // Blank line check
  if (!trimmed) {
    return { type: 'blank' };
  }

  // Section Header check (e.g. Verse 1, [Chorus], Bridge, etc.)
  const sectionMatch = trimmed.match(/^\[?(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Hook|Tag|Ending|Refrain)[\s\d]*\]?$/i);
  if (sectionMatch) {
    return {
      type: 'section',
      text: trimmed.replace(/[\[\]]/g, '').toUpperCase(),
    };
  }

  // Parse segments splitting by [CHORD] pattern
  const parts = line.split(/(\[[^\]]+\])/);
  const segments = [];
  let currentChord = null;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('[') && part.endsWith(']')) {
      // If we already had an unattached chord, push it with empty lyric
      if (currentChord !== null) {
        segments.push({ chord: currentChord, lyric: '' });
      }
      currentChord = part.slice(1, -1);
    } else {
      if (currentChord !== null) {
        segments.push({ chord: currentChord, lyric: part });
        currentChord = null;
      } else if (part.length > 0) {
        segments.push({ chord: null, lyric: part });
      }
    }
  }

  // Trailing chord without following lyric
  if (currentChord !== null) {
    segments.push({ chord: currentChord, lyric: '' });
  }

  return { type: 'line', segments };
}

/**
 * Migration Helper: Converts legacy separated (chords + lyrics) structure to single inline content.
 */
function migrateSongToInline(song) {
  if (song.content !== undefined) {
    return song.content; // Already migrated
  }

  const chords = (song.chords || '').trim();
  const lyrics = (song.lyrics || '').trim();

  if (chords && lyrics) {
    return `Intro / Main Chords:\n[${chords.replace(/\s+/g, '][')}]\n\n${lyrics}`;
  } else if (chords) {
    return chords;
  } else if (lyrics) {
    return lyrics;
  }
  return '';
}

// ==========================================
// RENDERER COMPONENTS
// ==========================================
const LyricChordSegment = React.memo(({ chord, lyric, semitones, showChords, themeState, isDarkMode }) => {
  const chordColor = isDarkMode ? '#4DA6FF' : '#0066FF';
  const transposed = chord ? transposeChord(chord, semitones) : null;

  return (
    <View style={stylesContainer.segmentContainer}>
      {showChords && (
        <Text style={[stylesContainer.chordText, { color: chordColor }]}>
          {transposed || ' '}
        </Text>
      )}
      <Text style={[stylesContainer.lyricText, { color: themeState.text }]}>
        {lyric || ' '}
      </Text>
    </View>
  );
});

const SongContentViewer = React.memo(({ content, semitones, showChords, themeState, isDarkMode }) => {
  const parsedLines = useMemo(() => {
    if (!content) return [];
    return content.split('\n').map(parseChordLine);
  }, [content]);

  if (!content || !content.trim()) {
    return (
      <Text style={{ fontStyle: 'italic', color: themeState.subText, textAlign: 'center', marginVertical: 20 }}>
        No lyrics or chords provided for this song.
      </Text>
    );
  }

  const headerColor = isDarkMode ? '#FFB74D' : '#E65100';

  return (
    <View style={{ flex: 1 }}>
      {parsedLines.map((lineObj, idx) => {
        if (lineObj.type === 'blank') {
          return <View key={`blank-${idx}`} style={{ height: 12 }} />;
        }

        if (lineObj.type === 'section') {
          return (
            <View key={`sec-${idx}`} style={{ marginTop: 14, marginBottom: 4 }}>
              <Text style={[stylesContainer.sectionHeader, { color: headerColor }]}>
                {lineObj.text}
              </Text>
            </View>
          );
        }

        return (
          <View key={`line-${idx}`} style={stylesContainer.lineRow}>
            {lineObj.segments.map((seg, sIdx) => (
              <LyricChordSegment
                key={`seg-${idx}-${sIdx}`}
                chord={seg.chord}
                lyric={seg.lyric}
                semitones={semitones}
                showChords={showChords}
                themeState={themeState}
                isDarkMode={isDarkMode}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
});

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [songs, setSongs] = useState([]);
  const [styles, setStyles] = useState(DEFAULT_STYLES);
  const [scales, setScales] = useState(DEFAULT_SCALES);
  const [styleDict, setStyleDict] = useState(STYLE_DICTIONARY_INITIAL);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [currentScreen, setCurrentScreen] = useState('songs');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedScale, setSelectedScale] = useState('All');

  const [modalVisible, setModalVisible] = useState(false);
  const [songDetailModal, setSongDetailModal] = useState(null);

  const [transposeKey, setTransposeKey] = useState(0);
  const [showChords, setShowChords] = useState(true);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const scrollRef = useRef(null);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [style, setStyle] = useState('Ballad (4/4)');
  const [scale, setScale] = useState('1st (C Major/Tizeta)');
  const [content, setContent] = useState('');
  const [audioUri, setAudioUri] = useState(null);
  const [editingSongId, setEditingSongId] = useState(null);

  // Audio recording
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [recordingStyleName, setRecordingStyleName] = useState(null);
  const currentPlayerRef = useRef(null);

  const theme = isDarkMode
    ? {
      bg: '#121212',
      cardBg: '#1E1E1E',
      text: '#F0F0F0',
      subText: '#AAAAAA',
      border: '#2C2C2C',
      inputBg: '#252525',
      secondaryBg: '#1A1A1A',
      headerBg: '#181818',
      chipBg: '#2C2C2C',
      chipBorder: '#444444',
      chipText: '#CCCCCC',
      chipSelectedBg: '#FFFFFF',
      chipSelectedText: '#000000',
      fabBg: '#FFFFFF',
      fabText: '#000000',
    }
    : {
      bg: '#FFFFFF',
      cardBg: '#FFFFFF',
      text: '#000000',
      subText: '#666666',
      border: '#E5E5E5',
      inputBg: '#FAFAFA',
      secondaryBg: '#F8F8F8',
      headerBg: '#FFFFFF',
      chipBg: '#F5F5F5',
      chipBorder: '#E5E5E5',
      chipText: '#555555',
      chipSelectedBg: '#000000',
      chipSelectedText: '#FFFFFF',
      fabBg: '#000000',
      fabText: '#FFFFFF',
    };

  useEffect(() => {
    loadData();
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        console.warn('Microphone permission not granted');
      }
      await setAudioModeAsync({ playsInSilentMode: true });
    })();
    return () => {
      if (currentPlayerRef.current) {
        currentPlayerRef.current.release();
        currentPlayerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let scrollInterval = null;
    if (isAutoScrolling) {
      scrollInterval = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ y: 100, animated: true });
        }
      }, 1000);
    } else {
      clearInterval(scrollInterval);
    }
    return () => clearInterval(scrollInterval);
  }, [isAutoScrolling]);

  useEffect(() => {
    const handleBackPress = () => {
      if (songDetailModal) {
        setSongDetailModal(null);
        setIsAutoScrolling(false);
        return true;
      }
      if (modalVisible) {
        setModalVisible(false);
        setEditingSongId(null);
        return true;
      }
      if (sidebarOpen) {
        toggleSidebar(false);
        return true;
      }
      if (currentScreen !== 'songs') {
        setCurrentScreen('songs');
        return true;
      }
      if (searchQuery || selectedStyle !== 'All' || selectedScale !== 'All') {
        setSearchQuery('');
        setSelectedStyle('All');
        setSelectedScale('All');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [
    songDetailModal,
    modalVisible,
    sidebarOpen,
    currentScreen,
    searchQuery,
    selectedStyle,
    selectedScale,
  ]);

  const toggleSidebar = (open) => {
    if (open) {
      setSidebarOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setSidebarOpen(false));
    }
  };

  const loadData = async () => {
    try {
      const savedSongs = await AsyncStorage.getItem(STORAGE_KEY);
      const savedStyles = await AsyncStorage.getItem(CUSTOM_STYLES_KEY);
      const savedScales = await AsyncStorage.getItem(CUSTOM_SCALES_KEY);
      const savedStyleDict = await AsyncStorage.getItem(STYLE_DICT_KEY);
      const savedDarkMode = await AsyncStorage.getItem(DARK_MODE_KEY);

      if (savedSongs) {
        const rawSongs = JSON.parse(savedSongs);
        // Execute automatic inline format migration for legacy entries
        const migrated = rawSongs.map((s) => ({
          ...s,
          content: migrateSongToInline(s),
        }));
        setSongs(migrated);
      }
      if (savedStyles) setStyles(JSON.parse(savedStyles));
      if (savedScales) setScales(JSON.parse(savedScales));
      if (savedStyleDict) setStyleDict(JSON.parse(savedStyleDict));
      if (savedDarkMode !== null) setIsDarkMode(JSON.parse(savedDarkMode));
    } catch (e) {
      console.error('Data load error', e);
    }
  };

  const toggleDarkMode = async (val) => {
    setIsDarkMode(val);
    try {
      await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(val));
    } catch (e) {
      console.error('Save dark mode error', e);
    }
  };

  const startRecording = async (styleTargetName = null) => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) return Alert.alert('Permission required', 'Microphone access is needed to record audio.');
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      setRecordingStyleName(styleTargetName);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      Alert.alert('Recording failed', err.message);
    }
  };

  const stopRecording = async () => {
    if (!recorderState.isRecording) return;
    await audioRecorder.stop();
    const uri = audioRecorder.uri;

    if (recordingStyleName) {
      const updatedDict = styleDict.map((s) => (s.name === recordingStyleName ? { ...s, audioUri: uri } : s));
      setStyleDict(updatedDict);
      await AsyncStorage.setItem(STYLE_DICT_KEY, JSON.stringify(updatedDict));
      setRecordingStyleName(null);
    } else {
      setAudioUri(uri);
    }
  };

  const playSound = async (uri) => {
    if (!uri) return;
    try {
      if (currentPlayerRef.current) {
        currentPlayerRef.current.release();
        currentPlayerRef.current = null;
      }
      const player = createAudioPlayer({ uri });
      currentPlayerRef.current = player;
      player.play();
    } catch (err) {
      Alert.alert('Playback failed', err.message);
    }
  };

  const handleEditSong = (song) => {
    if (!song) return;
    setEditingSongId(song.id);
    setTitle(song.title || '');
    setAuthor(song.author || '');
    setStyle(song.style || 'Ballad (4/4)');
    setScale(song.scale || '1st (C Major/Tizeta)');
    setContent(song.content !== undefined ? song.content : migrateSongToInline(song));
    setAudioUri(song.audioUri || null);
    setSongDetailModal(null);
    setModalVisible(true);
  };

  const handleDeleteSong = (songId) => {
    Alert.alert(
      'Delete Song',
      'Are you sure you want to delete this song?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedSongs = songs.filter((s) => s.id !== songId);
            setSongs(updatedSongs);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSongs));

            if (songDetailModal?.id === songId) {
              setSongDetailModal(null);
            }
          },
        },
      ]
    );
  };

  const handleSaveSong = async () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert('Missing Fields', 'Please enter a song title and author.');
      return;
    }

    let updated;
    if (editingSongId) {
      updated = songs.map((s) =>
        s.id === editingSongId
          ? { ...s, title, author, style, scale, content, audioUri }
          : s
      );
    } else {
      const newSong = {
        id: Date.now().toString(),
        title,
        author,
        style,
        scale,
        content,
        audioUri,
      };
      updated = [newSong, ...songs];
    }

    setSongs(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setEditingSongId(null);
    setTitle('');
    setAuthor('');
    setStyle('Ballad (4/4)');
    setScale('1st (C Major/Tizeta)');
    setContent('');
    setAudioUri(null);
    setModalVisible(false);
  };

  const handleExportSongs = async () => {
    const backupData = {
      songs,
      styles,
      scales,
      styleDict,
      exportedAt: new Date().toISOString(),
    };

    try {
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const fileName = `SelahKignit_FullBackup_${Date.now()}`;
          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            'application/json'
          );
          await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));
          Alert.alert('Backup Saved', 'Your backup file was saved directly to your device storage!');
          return;
        }
      }

      const uri = `${FileSystem.documentDirectory}SelahKignit_FullBackup.json`;
      await FileSystem.writeAsStringAsync(uri, JSON.stringify(backupData, null, 2));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/json',
          dialogTitle: 'Save Backup File to Device Storage',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Backup Saved', `Saved to device storage: ${uri}`);
      }
    } catch (e) {
      Alert.alert('Export failed', e.message);
    }
  };

  const handleImportSongs = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (!res.canceled && res.assets && res.assets[0]) {
        const contentStr = await FileSystem.readAsStringAsync(res.assets[0].uri);
        const parsed = JSON.parse(contentStr);

        if (parsed.songs) {
          const migratedImported = parsed.songs.map((s) => ({
            ...s,
            content: migrateSongToInline(s),
          }));
          const mergedSongs = [...migratedImported, ...songs];
          setSongs(mergedSongs);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedSongs));

          if (parsed.styles) {
            setStyles(parsed.styles);
            await AsyncStorage.setItem(CUSTOM_STYLES_KEY, JSON.stringify(parsed.styles));
          }
          if (parsed.scales) {
            setScales(parsed.scales);
            await AsyncStorage.setItem(CUSTOM_SCALES_KEY, JSON.stringify(parsed.scales));
          }
          if (parsed.styleDict) {
            setStyleDict(parsed.styleDict);
            await AsyncStorage.setItem(STYLE_DICT_KEY, JSON.stringify(parsed.styleDict));
          }
          Alert.alert('Restore Complete', 'Full application state restored successfully.');
        } else if (Array.isArray(parsed)) {
          const migratedImported = parsed.map((s) => ({
            ...s,
            content: migrateSongToInline(s),
          }));
          const merged = [...migratedImported, ...songs];
          setSongs(merged);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          Alert.alert('Success', `Imported ${parsed.length} songs.`);
        }
      }
    } catch (e) {
      Alert.alert('Import Failed', 'Invalid JSON backup file.');
    }
  };

  const filteredSongs = songs.filter((s) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = (s.title || '').toLowerCase().includes(query);
    const authorMatch = (s.author || '').toLowerCase().includes(query);
    const contentMatch = (s.content || s.lyrics || '').toLowerCase().includes(query);
    const searchMatch = titleMatch || authorMatch || contentMatch;

    const styleMatch = selectedStyle === 'All' || s.style === selectedStyle;
    const scaleMatch = selectedScale === 'All' || s.scale === selectedScale;

    return searchMatch && styleMatch && scaleMatch;
  });

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <SafeAreaView style={[stylesContainer.container, { backgroundColor: theme.bg }]}>
        {/* HEADER */}
        <View style={[stylesContainer.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => toggleSidebar(true)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={stylesContainer.hamburgerBtn}>
            <Text style={[stylesContainer.hamburgerIcon, { color: theme.text }]}>☰</Text>
          </TouchableOpacity>

          <View style={stylesContainer.titleRow}>
            <Image source={require('./assets/music-note.png')} style={stylesContainer.appLogo} resizeMode="contain" />
            <Text style={[stylesContainer.headerTitle, { color: theme.text }]}>SELAH KIGNIT</Text>
          </View>

          <View style={{ width: 24 }} />
        </View>

        {/* MAIN SONGS SCREEN */}
        {currentScreen === 'songs' && (
          <View style={{ flex: 1 }}>
            <View style={stylesContainer.searchBox}>
              <TextInput
                style={[stylesContainer.searchInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                placeholder="Search title, artist or lyrics..."
                placeholderTextColor={theme.subText}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={[stylesContainer.filterContainer, { backgroundColor: theme.bg }]}>
              <Text style={[stylesContainer.filterLabel, { color: theme.subText }]}>STYLE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={stylesContainer.chipRow}>
                {styles.map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      stylesContainer.chip,
                      { backgroundColor: theme.chipBg, borderColor: theme.chipBorder },
                      selectedStyle === st && { backgroundColor: theme.chipSelectedBg, borderColor: theme.chipSelectedBg },
                    ]}
                    onPress={() => setSelectedStyle(st)}>
                    <Text
                      style={[
                        stylesContainer.chipText,
                        { color: theme.chipText },
                        selectedStyle === st && { color: theme.chipSelectedText, fontWeight: 'bold' },
                      ]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[stylesContainer.filterLabel, { color: theme.subText }]}>SCALE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={stylesContainer.chipRow}>
                {scales.map((sc) => (
                  <TouchableOpacity
                    key={sc}
                    style={[
                      stylesContainer.chip,
                      { backgroundColor: theme.chipBg, borderColor: theme.chipBorder },
                      selectedScale === sc && { backgroundColor: theme.chipSelectedBg, borderColor: theme.chipSelectedBg },
                    ]}
                    onPress={() => setSelectedScale(sc)}>
                    <Text
                      style={[
                        stylesContainer.chipText,
                        { color: theme.chipText },
                        selectedScale === sc && { color: theme.chipSelectedText, fontWeight: 'bold' },
                      ]}>
                      {sc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <FlatList
              data={filteredSongs}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              ListEmptyComponent={<Text style={[stylesContainer.emptyText, { color: theme.subText }]}>No songs found.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[stylesContainer.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSongDetailModal(item);
                    setTransposeKey(0);
                  }}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[stylesContainer.cardTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[stylesContainer.cardAuthor, { color: theme.subText }]}>{item.author}</Text>
                  </View>
                  <View style={stylesContainer.tagContainer}>
                    <Text style={[stylesContainer.tag, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0', color: theme.text }]}>{item.style}</Text>
                    <Text style={[stylesContainer.tag, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0', color: theme.text }]}>{item.scale}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={[stylesContainer.fab, { backgroundColor: theme.fabBg }]} activeOpacity={0.8} onPress={() => setModalVisible(true)}>
              <Text style={[stylesContainer.fabText, { color: theme.fabText }]}>+</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STYLE DICTIONARY SCREEN */}
        {currentScreen === 'styledict' && (
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <Text style={[stylesContainer.screenTitle, { color: theme.text }]}>Style & Rhythm Dictionary</Text>
            <Text style={[stylesContainer.screenSub, { color: theme.subText }]}>Listen to audio samples and rhythm patterns.</Text>
            {styleDict.map((s) => (
              <View key={s.name} style={[stylesContainer.dictCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <Text style={[stylesContainer.dictTitle, { color: theme.text }]}>{s.name}</Text>
                <Text style={[stylesContainer.dictNotes, { color: theme.subText }]}>Rhythm Pattern: {s.rhythm}</Text>
                <Text style={[stylesContainer.dictDesc, { color: theme.subText }]}>{s.description}</Text>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  {s.audioUri ? (
                    <TouchableOpacity style={stylesContainer.smallBtn} onPress={() => playSound(s.audioUri)}>
                      <Text style={{ color: '#FFF', fontSize: 11 }}>▶ Play Sample</Text>
                    </TouchableOpacity>
                  ) : null}

                  {recorderState.isRecording && recordingStyleName === s.name ? (
                    <TouchableOpacity style={[stylesContainer.smallBtn, { backgroundColor: 'red' }]} onPress={stopRecording}>
                      <Text style={{ color: '#FFF', fontSize: 11 }}>Stop Recording</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={stylesContainer.smallBtn} onPress={() => startRecording(s.name)}>
                      <Text style={{ color: '#FFF', fontSize: 11 }}>🎙️ {s.audioUri ? 'Re-record' : 'Record Sample'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* SCALE DICTIONARY SCREEN */}
        {currentScreen === 'dictionary' && (
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <Text style={[stylesContainer.screenTitle, { color: theme.text }]}>Scale Dictionary (Qenet)</Text>
            <Text style={[stylesContainer.screenSub, { color: theme.subText }]}>Traditional scale notes and features.</Text>
            {SCALE_DICTIONARY.map((s) => (
              <View key={s.name} style={[stylesContainer.dictCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <Text style={[stylesContainer.dictTitle, { color: theme.text }]}>{s.name}</Text>
                <Text style={[stylesContainer.dictNotes, { color: theme.subText }]}>{s.notes}</Text>
                <Text style={[stylesContainer.dictDesc, { color: theme.subText }]}>{s.description}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* SETTINGS SCREEN */}
        {currentScreen === 'settings' && (
          <View style={{ flex: 1, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20 }}>
              <Text style={[stylesContainer.screenTitle, { color: theme.text }]}>Settings & Backup</Text>
            </View>
            <View style={[stylesContainer.settingItem, { marginBottom: 12 }, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[stylesContainer.settingTitle, { color: theme.text }]}>Dark Mode</Text>
                <Text style={[stylesContainer.settingDesc, { color: theme.subText }]}>Switch between light and dark themes</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#767577', true: '#555555' }}
                thumbColor={isDarkMode ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity style={[stylesContainer.settingItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={handleExportSongs}>
              <View>
                <Text style={[stylesContainer.settingTitle, { color: theme.text }]}>Export Full Backup</Text>
                <Text style={[stylesContainer.settingDesc, { color: theme.subText }]}>Export songs, setlists, and style dictionary.</Text>
              </View>
              <Text style={{ color: theme.text }}>➔</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[stylesContainer.settingItem, { marginTop: 10 }, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={handleImportSongs}>
              <View>
                <Text style={[stylesContainer.settingTitle, { color: theme.text }]}>Import Full Backup</Text>
                <Text style={[stylesContainer.settingDesc, { color: theme.subText }]}>Restore full application state from backup.</Text>
              </View>
              <Text style={{ color: theme.text }}>➔</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LEFT SIDE SLIDING SIDEBAR */}
        <Modal visible={sidebarOpen} transparent={true} animationType="none" onRequestClose={() => toggleSidebar(false)}>
          <View style={stylesContainer.drawerOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => toggleSidebar(false)} />

            <Animated.View style={[stylesContainer.drawerContainer, { backgroundColor: theme.cardBg, transform: [{ translateX: slideAnim }] }]}>
              <View style={[stylesContainer.drawerHeader, { borderBottomColor: theme.border }]}>
                <Image source={require('./assets/music-note.png')} style={stylesContainer.drawerLogo} resizeMode="contain" />
                <Text style={[stylesContainer.drawerTitle, { color: theme.text }]}>Selah Kignit</Text>
              </View>

              <TouchableOpacity
                style={[stylesContainer.drawerItem, currentScreen === 'songs' && { backgroundColor: isDarkMode ? '#2C2C2C' : '#F5F5F5' }]}
                onPress={() => {
                  setCurrentScreen('songs');
                  toggleSidebar(false);
                }}>
                <Text style={[stylesContainer.drawerItemText, { color: theme.text }]}>🎵 Songs Feed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[stylesContainer.drawerItem, currentScreen === 'styledict' && { backgroundColor: isDarkMode ? '#2C2C2C' : '#F5F5F5' }]}
                onPress={() => {
                  setCurrentScreen('styledict');
                  toggleSidebar(false);
                }}>
                <Text style={[stylesContainer.drawerItemText, { color: theme.text }]}>🥁 Style Dictionary</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[stylesContainer.drawerItem, currentScreen === 'dictionary' && { backgroundColor: isDarkMode ? '#2C2C2C' : '#F5F5F5' }]}
                onPress={() => {
                  setCurrentScreen('dictionary');
                  toggleSidebar(false);
                }}>
                <Text style={[stylesContainer.drawerItemText, { color: theme.text }]}>📖 Scale Dictionary</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[stylesContainer.drawerItem, currentScreen === 'settings' && { backgroundColor: isDarkMode ? '#2C2C2C' : '#F5F5F5' }]}
                onPress={() => {
                  setCurrentScreen('settings');
                  toggleSidebar(false);
                }}>
                <Text style={[stylesContainer.drawerItemText, { color: theme.text }]}>⚙️ Settings</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        {/* SONG EDITOR MODAL (SINGLE CONSOLIDATED CONTENT TEXTAREA) */}
        <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
          <View style={stylesContainer.bottomSheetOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setModalVisible(false)} />
            <View style={[stylesContainer.bottomSheetContent, { backgroundColor: theme.cardBg }]}>
              <View style={[stylesContainer.dragHandle, { backgroundColor: isDarkMode ? '#444' : '#DDD' }]} />
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
                <Text style={[stylesContainer.modalHeader, { color: theme.text }]}>{editingSongId ? 'Edit Song' : 'New Song'}</Text>

                <Text style={[stylesContainer.inputLabel, { color: theme.subText }]}>TITLE *</Text>
                <TextInput style={[stylesContainer.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} placeholder="Song Title" placeholderTextColor={theme.subText} value={title} onChangeText={setTitle} />

                <Text style={[stylesContainer.inputLabel, { color: theme.subText }]}>AUTHOR / ARTIST *</Text>
                <TextInput style={[stylesContainer.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} placeholder="Artist or Composer" placeholderTextColor={theme.subText} value={author} onChangeText={setAuthor} />

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
                  <TouchableOpacity
                    style={[stylesContainer.btn, stylesContainer.btnCancel, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                    onPress={() => {
                      setEditingSongId(null);
                      setTitle('');
                      setAuthor('');
                      setStyle('Ballad (4/4)');
                      setScale('1st (C Major/Tizeta)');
                      setContent('');
                      setAudioUri(null);
                      setModalVisible(false);
                    }}>
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

        {/* READ SONG DETAIL MODAL */}
        <Modal
          visible={!!songDetailModal}
          animationType="slide"
          onRequestClose={() => {
            setSongDetailModal(null);
            setIsAutoScrolling(false);
          }}>
          <SafeAreaView style={[stylesContainer.modalContainer, { backgroundColor: theme.bg }]}>
            <View style={{ padding: 16, flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[stylesContainer.modalHeader, { color: theme.text }]}>{songDetailModal?.title}</Text>
                  <Text style={[stylesContainer.detailAuthor, { color: theme.subText }]}>{songDetailModal?.author}</Text>
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

              <View style={[stylesContainer.readerBar, { backgroundColor: theme.secondaryBg }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.text }}>KEY:</Text>
                  <TouchableOpacity style={[stylesContainer.smallBtn, { backgroundColor: isDarkMode ? '#FFF' : '#000' }]} onPress={() => setTransposeKey(transposeKey - 1)}>
                    <Text style={{ color: isDarkMode ? '#000' : '#FFF' }}>-1</Text>
                  </TouchableOpacity>
                  <Text style={{ fontWeight: 'bold', color: theme.text }}>{transposeKey > 0 ? `+${transposeKey}` : transposeKey}</Text>
                  <TouchableOpacity style={[stylesContainer.smallBtn, { backgroundColor: isDarkMode ? '#FFF' : '#000' }]} onPress={() => setTransposeKey(transposeKey + 1)}>
                    <Text style={{ color: isDarkMode ? '#000' : '#FFF' }}>+1</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[stylesContainer.smallBtn, { backgroundColor: isAutoScrolling ? (isDarkMode ? '#FFF' : '#000') : '#666' }]}
                  onPress={() => setIsAutoScrolling(!isAutoScrolling)}>
                  <Text style={{ color: isAutoScrolling && isDarkMode ? '#000' : '#FFF' }}>{isAutoScrolling ? 'Pause Scroll' : 'Auto Scroll'}</Text>
                </TouchableOpacity>
              </View>

              {songDetailModal?.audioUri && (
                <TouchableOpacity
                  style={{ backgroundColor: isDarkMode ? '#FFF' : '#000', padding: 8, borderRadius: 6, marginVertical: 6 }}
                  onPress={() => playSound(songDetailModal.audioUri)}>
                  <Text style={{ color: isDarkMode ? '#000' : '#FFF', fontWeight: 'bold', textAlign: 'center', fontSize: 12 }}>▶ Play Audio Memo</Text>
                </TouchableOpacity>
              )}

              <ScrollView ref={scrollRef} style={[stylesContainer.lyricsBox, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
                <SongContentViewer
                  content={songDetailModal?.content !== undefined ? songDetailModal.content : migrateSongToInline(songDetailModal || {})}
                  semitones={transposeKey}
                  showChords={showChords}
                  themeState={theme}
                  isDarkMode={isDarkMode}
                />
              </ScrollView>

              <TouchableOpacity
                style={[stylesContainer.btnCancel, { backgroundColor: theme.cardBg, borderColor: theme.border, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 }]}
                onPress={() => {
                  setSongDetailModal(null);
                  setIsAutoScrolling(false);
                }}>
                <Text style={[stylesContainer.btnCancelText, { color: theme.text }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ==========================================
// STYLES
// ==========================================
const stylesContainer = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hamburgerBtn: { padding: 8 },
  hamburgerIcon: { fontSize: 22, color: '#000' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  appLogo: { width: 20, height: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#000', letterSpacing: 1.5 },

  searchBox: { paddingHorizontal: 16, paddingTop: 10 },
  searchInput: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: '#E5E5E5' },

  filterContainer: { backgroundColor: '#FFFFFF', paddingVertical: 4 },
  filterLabel: { fontSize: 11, fontWeight: '700', color: '#888', marginLeft: 16, marginTop: 4, letterSpacing: 1.1 },
  chipRow: { flexDirection: 'row', paddingHorizontal: 12, marginVertical: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: '#F5F5F5', marginRight: 6, borderWidth: 1, borderColor: '#E5E5E5' },
  chipText: { fontSize: 13, color: '#555' },

  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
  cardAuthor: { fontSize: 13, color: '#666', marginTop: 3 },
  tagContainer: { alignItems: 'flex-end', gap: 4 },
  tag: { fontSize: 10, fontWeight: '600', backgroundColor: '#F0F0F0', color: '#000', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, textTransform: 'uppercase' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'android' ? 30 : 20,
    backgroundColor: '#000',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: {
    fontSize: 34,
    color: '#FFF',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 56,
    includeFontPadding: false,
  },

  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  drawerLogo: { width: 28, height: 28 },
  drawerTitle: { fontSize: 20, fontWeight: '800', color: '#000' },
  drawerItem: { paddingVertical: 13, paddingHorizontal: 12, borderRadius: 8, marginBottom: 2 },
  drawerItemText: { fontSize: 15, fontWeight: '600', color: '#000' },

  readerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F8F8', padding: 8, borderRadius: 8, marginVertical: 8 },
  smallBtn: { backgroundColor: '#000', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 5 },

  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#DDD',
    alignSelf: 'center',
    marginBottom: 15,
  },
  modalHeader: { fontSize: 22, fontWeight: '800', color: '#000' },
  detailAuthor: { fontSize: 15, color: '#666' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#888', marginTop: 14, marginBottom: 4, letterSpacing: 1.1 },
  input: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, backgroundColor: '#FAFAFA' },
  textArea: { height: 160, textAlignVertical: 'top' },
  customInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },

  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E5E5' },
  btnSave: { backgroundColor: '#000' },
  btnCancelText: { color: '#000', fontWeight: '600', fontSize: 15 },
  btnSaveText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  screenTitle: { fontSize: 20, fontWeight: '800', color: '#000' },
  screenSub: { fontSize: 13, color: '#666', marginBottom: 14 },
  dictCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, padding: 14, marginBottom: 10 },
  dictTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
  dictNotes: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 3 },
  dictDesc: { fontSize: 13, color: '#666' },

  settingItem: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingTitle: { fontSize: 15, fontWeight: '700', color: '#000' },
  settingDesc: { fontSize: 12, color: '#666' },

  lyricsBox: { flex: 1, backgroundColor: '#FAFAFA', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: '#E5E5E5', marginTop: 4 },

  // INLINE CHORD RENDERER STYLES
  lineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    marginVertical: 2,
  },
  segmentContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  chordText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 1,
    paddingRight: 2,
  },
  lyricText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
});
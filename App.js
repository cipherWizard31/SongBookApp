import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
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

// Core Data & Constants
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
const SETLISTS_KEY = '@songbook_setlists';
const STYLE_DICT_KEY = '@songbook_style_dictionary';

export default function App() {
  const [songs, setSongs] = useState([]);
  const [styles, setStyles] = useState(DEFAULT_STYLES);
  const [scales, setScales] = useState(DEFAULT_SCALES);
  const [setlists, setSetlists] = useState([]);
  const [styleDict, setStyleDict] = useState(STYLE_DICTIONARY_INITIAL);

  const [currentScreen, setCurrentScreen] = useState('songs');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedScale, setSelectedScale] = useState('All');
  const [activeSetlistFilter, setActiveSetlistFilter] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [songDetailModal, setSongDetailModal] = useState(null);
  const [createSetlistModal, setCreateSetlistModal] = useState(false);

  const [transposeKey, setTransposeKey] = useState(0);
  const [showChords, setShowChords] = useState(true);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const scrollRef = useRef(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [style, setStyle] = useState('Ballad (4/4)');
  const [scale, setScale] = useState('1st (C Major/Tizeta)');
  const [chords, setChords] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [audioUri, setAudioUri] = useState(null);

  const [newSetlistName, setNewSetlistName] = useState('');

  // expo-audio: hook-based recorder (must be at top level)
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [recordingStyleName, setRecordingStyleName] = useState(null);
  // Track the current audio player so we can release it before creating a new one
  const currentPlayerRef = useRef(null);

  useEffect(() => {
    loadData();
    // Request microphone permission on mount
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        console.warn('Microphone permission not granted');
      }
      await setAudioModeAsync({ playsInSilentMode: true });
    })();
    return () => {
      // Release player on unmount
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
      const savedSetlists = await AsyncStorage.getItem(SETLISTS_KEY);
      const savedStyleDict = await AsyncStorage.getItem(STYLE_DICT_KEY);

      if (savedSongs) setSongs(JSON.parse(savedSongs));
      if (savedStyles) setStyles(JSON.parse(savedStyles));
      if (savedScales) setScales(JSON.parse(savedScales));
      if (savedSetlists) setSetlists(JSON.parse(savedSetlists));
      if (savedStyleDict) setStyleDict(JSON.parse(savedStyleDict));
    } catch (e) {
      console.error('Data load error', e);
    }
  };

  const startRecording = async (styleTargetName = null) => {
    try {
      // Check permission
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
      // Release any existing player first
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

  const transposeChordText = (text, semitones) => {
    if (!text || semitones === 0) return text;
    return text.replace(/\b[A-G](?:#|b)?(?:m|maj|min|7|m7|dim|aug|add9)?\b/g, (match) => {
      const root = match.match(/^[A-G](?:#|b)?/)[0];
      const suffix = match.slice(root.length);
      let idx = CHROMATIC_NOTES.indexOf(root);
      if (idx === -1) {
        if (root === 'Bb') idx = 10;
        if (root === 'Eb') idx = 3;
        if (root === 'Ab') idx = 8;
        if (root === 'Db') idx = 1;
      }
      if (idx === -1) return match;
      let newIdx = (idx + semitones) % 12;
      if (newIdx < 0) newIdx += 12;
      return CHROMATIC_NOTES[newIdx] + suffix;
    });
  };

  const handleSaveSong = async () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert('Missing Fields', 'Please enter a song title and author.');
      return;
    }

    const newSong = {
      id: Date.now().toString(),
      title,
      author,
      style,
      scale,
      chords,
      lyrics,
      audioUri,
    };

    const updated = [newSong, ...songs];
    setSongs(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setTitle('');
    setAuthor('');
    setChords('');
    setLyrics('');
    setAudioUri(null);
    setModalVisible(false);
  };

  const handleExportSongs = async () => {
    const backupData = {
      songs,
      styles,
      scales,
      setlists,
      styleDict,
      exportedAt: new Date().toISOString(),
    };

    try {
      const uri = `${FileSystem.documentDirectory}SelahKignit_FullBackup.json`;
      await FileSystem.writeAsStringAsync(uri, JSON.stringify(backupData, null, 2));
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
    } catch (e) {
      Alert.alert('Export failed', e.message);
    }
  };

  const handleImportSongs = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (!res.canceled && res.assets && res.assets[0]) {
        const content = await FileSystem.readAsStringAsync(res.assets[0].uri);
        const parsed = JSON.parse(content);

        if (parsed.songs) {
          const mergedSongs = [...parsed.songs, ...songs];
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
          if (parsed.setlists) {
            setSetlists(parsed.setlists);
            await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(parsed.setlists));
          }
          if (parsed.styleDict) {
            setStyleDict(parsed.styleDict);
            await AsyncStorage.setItem(STYLE_DICT_KEY, JSON.stringify(parsed.styleDict));
          }
          Alert.alert('Restore Complete', 'Full application state restored successfully.');
        } else if (Array.isArray(parsed)) {
          const merged = [...parsed, ...songs];
          setSongs(merged);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          Alert.alert('Success', `Imported ${parsed.length} songs.`);
        }
      }
    } catch (e) {
      Alert.alert('Import Failed', 'Invalid JSON backup file.');
    }
  };

  const handleCreateSetlist = async () => {
    if (!newSetlistName.trim()) return;
    const newSetlist = { id: Date.now().toString(), name: newSetlistName, songIds: [] };
    const updated = [...setlists, newSetlist];
    setSetlists(updated);
    await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(updated));
    setNewSetlistName('');
    setCreateSetlistModal(false);
  };

  const toggleSongInSetlist = async (setlistId, songId) => {
    const updated = setlists.map((sl) => {
      if (sl.id === setlistId) {
        const exists = sl.songIds.includes(songId);
        const newIds = exists ? sl.songIds.filter((id) => id !== songId) : [...sl.songIds, songId];
        return { ...sl, songIds: newIds };
      }
      return sl;
    });
    setSetlists(updated);
    await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(updated));
  };

  const filteredSongs = songs.filter((s) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(query);
    const authorMatch = s.author.toLowerCase().includes(query);
    const lyricsMatch = s.lyrics.toLowerCase().includes(query);
    const searchMatch = titleMatch || authorMatch || lyricsMatch;

    const styleMatch = selectedStyle === 'All' || s.style === selectedStyle;
    const scaleMatch = selectedScale === 'All' || s.scale === selectedScale;

    let setlistMatch = true;
    if (activeSetlistFilter) {
      const activeSl = setlists.find((sl) => sl.id === activeSetlistFilter);
      setlistMatch = activeSl ? activeSl.songIds.includes(s.id) : true;
    }

    return searchMatch && styleMatch && scaleMatch && setlistMatch;
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={stylesContainer.container}>
        {/* HEADER */}
        <View style={stylesContainer.header}>
          <TouchableOpacity onPress={() => toggleSidebar(true)}>
            <Text style={stylesContainer.hamburgerIcon}>☰</Text>
          </TouchableOpacity>

          <View style={stylesContainer.titleRow}>
            <Image source={require('./assets/music-note.png')} style={stylesContainer.appLogo} resizeMode="contain" />
            <Text style={stylesContainer.headerTitle}>SELAH KIGNIT</Text>
          </View>

          <View style={{ width: 24 }} />
        </View>

        {/* MAIN SONGS SCREEN */}
        {currentScreen === 'songs' && (
          <View style={{ flex: 1 }}>
            <View style={stylesContainer.searchBox}>
              <TextInput
                style={stylesContainer.searchInput}
                placeholder="Search title, artist or lyrics..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {setlists.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={stylesContainer.setlistBar}>
                <TouchableOpacity
                  style={[stylesContainer.setlistChip, !activeSetlistFilter && stylesContainer.setlistChipActive]}
                  onPress={() => setActiveSetlistFilter(null)}>
                  <Text style={[stylesContainer.setlistText, !activeSetlistFilter && stylesContainer.setlistTextActive]}>All Songs</Text>
                </TouchableOpacity>
                {setlists.map((sl) => (
                  <TouchableOpacity
                    key={sl.id}
                    style={[stylesContainer.setlistChip, activeSetlistFilter === sl.id && stylesContainer.setlistChipActive]}
                    onPress={() => setActiveSetlistFilter(sl.id)}>
                    <Text style={[stylesContainer.setlistText, activeSetlistFilter === sl.id && stylesContainer.setlistTextActive]}>📋 {sl.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={stylesContainer.filterContainer}>
              <Text style={stylesContainer.filterLabel}>STYLE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={stylesContainer.chipRow}>
                {styles.map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[stylesContainer.chip, selectedStyle === st && stylesContainer.chipSelected]}
                    onPress={() => setSelectedStyle(st)}>
                    <Text style={[stylesContainer.chipText, selectedStyle === st && stylesContainer.chipTextSelected]}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={stylesContainer.filterLabel}>SCALE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={stylesContainer.chipRow}>
                {scales.map((sc) => (
                  <TouchableOpacity
                    key={sc}
                    style={[stylesContainer.chip, selectedScale === sc && stylesContainer.chipSelected]}
                    onPress={() => setSelectedScale(sc)}>
                    <Text style={[stylesContainer.chipText, selectedScale === sc && stylesContainer.chipTextSelected]}>{sc}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <FlatList
              data={filteredSongs}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              ListEmptyComponent={<Text style={stylesContainer.emptyText}>No songs found.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={stylesContainer.card}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSongDetailModal(item);
                    setTransposeKey(0);
                  }}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={stylesContainer.cardTitle}>{item.title}</Text>
                    <Text style={stylesContainer.cardAuthor}>{item.author}</Text>
                  </View>
                  <View style={stylesContainer.tagContainer}>
                    <Text style={stylesContainer.tag}>{item.style}</Text>
                    <Text style={stylesContainer.tag}>{item.scale}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={stylesContainer.fab} activeOpacity={0.8} onPress={() => setModalVisible(true)}>
              <Text style={stylesContainer.fabText}>+</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STYLE DICTIONARY SCREEN */}
        {currentScreen === 'styledict' && (
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <Text style={stylesContainer.screenTitle}>Style & Rhythm Dictionary</Text>
            <Text style={stylesContainer.screenSub}>Listen to audio samples and rhythm patterns.</Text>
            {styleDict.map((s) => (
              <View key={s.name} style={stylesContainer.dictCard}>
                <Text style={stylesContainer.dictTitle}>{s.name}</Text>
                <Text style={stylesContainer.dictNotes}>Rhythm Pattern: {s.rhythm}</Text>
                <Text style={stylesContainer.dictDesc}>{s.description}</Text>

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
            <Text style={stylesContainer.screenTitle}>Scale Dictionary (Qenet)</Text>
            <Text style={stylesContainer.screenSub}>Traditional scale notes and features.</Text>
            {SCALE_DICTIONARY.map((s) => (
              <View key={s.name} style={stylesContainer.dictCard}>
                <Text style={stylesContainer.dictTitle}>{s.name}</Text>
                <Text style={stylesContainer.dictNotes}>{s.notes}</Text>
                <Text style={stylesContainer.dictDesc}>{s.description}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* SETTINGS SCREEN */}
        {currentScreen === 'settings' && (
          <View style={{ flex: 1, padding: 16 }}>
            <Text style={stylesContainer.screenTitle}>Settings & Backup</Text>
            <TouchableOpacity style={stylesContainer.settingItem} onPress={handleExportSongs}>
              <View>
                <Text style={stylesContainer.settingTitle}>Export Full Backup</Text>
                <Text style={stylesContainer.settingDesc}>Export songs, setlists, and style dictionary.</Text>
              </View>
              <Text>➔</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[stylesContainer.settingItem, { marginTop: 10 }]} onPress={handleImportSongs}>
              <View>
                <Text style={stylesContainer.settingTitle}>Import Full Backup</Text>
                <Text style={stylesContainer.settingDesc}>Restore full application state from backup.</Text>
              </View>
              <Text>➔</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LEFT SIDE SLIDING SIDEBAR */}
        <Modal visible={sidebarOpen} transparent={true} animationType="none">
          <View style={stylesContainer.drawerOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => toggleSidebar(false)} />
            
            <Animated.View style={[stylesContainer.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
              <View style={stylesContainer.drawerHeader}>
                <Image source={require('./assets/music-note.png')} style={stylesContainer.drawerLogo} resizeMode="contain" />
                <Text style={stylesContainer.drawerTitle}>Selah Kignit</Text>
              </View>

              <TouchableOpacity
                style={[stylesContainer.drawerItem, currentScreen === 'songs' && stylesContainer.drawerItemActive]}
                onPress={() => {
                  setCurrentScreen('songs');
                  toggleSidebar(false);
                }}>
                <Text style={stylesContainer.drawerItemText}>🎵 Songs Feed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[stylesContainer.drawerItem, currentScreen === 'styledict' && stylesContainer.drawerItemActive]}
                onPress={() => {
                  setCurrentScreen('styledict');
                  toggleSidebar(false);
                }}>
                <Text style={stylesContainer.drawerItemText}>🥁 Style Dictionary</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[stylesContainer.drawerItem, currentScreen === 'dictionary' && stylesContainer.drawerItemActive]}
                onPress={() => {
                  setCurrentScreen('dictionary');
                  toggleSidebar(false);
                }}>
                <Text style={stylesContainer.drawerItemText}>📖 Scale Dictionary</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[stylesContainer.drawerItem, currentScreen === 'settings' && stylesContainer.drawerItemActive]}
                onPress={() => {
                  setCurrentScreen('settings');
                  toggleSidebar(false);
                }}>
                <Text style={stylesContainer.drawerItemText}>⚙️ Backup & Restore</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[stylesContainer.drawerItem, { marginTop: 20, borderTopWidth: 1, borderColor: '#EEE' }]}
                onPress={() => {
                  toggleSidebar(false);
                  setCreateSetlistModal(true);
                }}>
                <Text style={stylesContainer.drawerItemText}>➕ Create New Setlist</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        {/* CREATE SETLIST MODAL */}
        <Modal visible={createSetlistModal} animationType="fade" transparent={true}>
          <View style={stylesContainer.drawerOverlay}>
            <View style={[stylesContainer.drawerContainer, { width: '85%', margin: 'auto', borderRadius: 12, height: 'auto', alignSelf: 'center', position: 'relative' }]}>
              <Text style={stylesContainer.modalHeader}>Create Setlist</Text>
              <TextInput
                style={stylesContainer.input}
                placeholder="Setlist Name (e.g. Sunday Service)"
                value={newSetlistName}
                onChangeText={setNewSetlistName}
              />
              <View style={stylesContainer.buttonRow}>
                <TouchableOpacity style={[stylesContainer.btn, stylesContainer.btnCancel]} onPress={() => setCreateSetlistModal(false)}>
                  <Text style={stylesContainer.btnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[stylesContainer.btn, stylesContainer.btnSave]} onPress={handleCreateSetlist}>
                  <Text style={stylesContainer.btnSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ADD SONG MODAL */}
        <Modal visible={modalVisible} animationType="slide">
          <SafeAreaView style={stylesContainer.modalContainer}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
              <Text style={stylesContainer.modalHeader}>New Song</Text>

              <Text style={stylesContainer.inputLabel}>TITLE *</Text>
              <TextInput style={stylesContainer.input} placeholder="Song Title" value={title} onChangeText={setTitle} />

              <Text style={stylesContainer.inputLabel}>AUTHOR / ARTIST *</Text>
              <TextInput style={stylesContainer.input} placeholder="Artist or Composer" value={author} onChangeText={setAuthor} />

              <Text style={stylesContainer.inputLabel}>CHORDS (OPTIONAL)</Text>
              <TextInput
                style={[stylesContainer.input, { height: 50 }]}
                placeholder="e.g. Intro: C - Am - F - G"
                multiline
                value={chords}
                onChangeText={setChords}
              />

              <Text style={stylesContainer.inputLabel}>AUDIO MEMO</Text>
              <View style={stylesContainer.customInputRow}>
                {recorderState.isRecording && !recordingStyleName ? (
                  <TouchableOpacity style={[stylesContainer.btn, { backgroundColor: 'red' }]} onPress={stopRecording}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Stop Recording</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[stylesContainer.btn, { backgroundColor: '#000' }]} onPress={() => startRecording()}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{audioUri ? 'Re-record Memo' : '🎙️ Record Memo'}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={stylesContainer.inputLabel}>LYRICS</Text>
              <TextInput
                style={[stylesContainer.input, stylesContainer.textArea]}
                placeholder="Lyrics..."
                multiline
                value={lyrics}
                onChangeText={setLyrics}
              />

              <View style={stylesContainer.buttonRow}>
                <TouchableOpacity style={[stylesContainer.btn, stylesContainer.btnCancel]} onPress={() => setModalVisible(false)}>
                  <Text style={stylesContainer.btnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[stylesContainer.btn, stylesContainer.btnSave]} onPress={handleSaveSong}>
                  <Text style={stylesContainer.btnSaveText}>Save Song</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* READ SONG DETAIL MODAL */}
        <Modal visible={!!songDetailModal} animationType="slide">
          <SafeAreaView style={stylesContainer.modalContainer}>
            <View style={{ padding: 16, flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={stylesContainer.modalHeader}>{songDetailModal?.title}</Text>
                  <Text style={stylesContainer.detailAuthor}>{songDetailModal?.author}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowChords(!showChords)}>
                  <Text style={{ fontSize: 12, fontWeight: '700' }}>{showChords ? 'Hide Chords' : 'Show Chords'}</Text>
                </TouchableOpacity>
              </View>

              <View style={stylesContainer.readerBar}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold' }}>KEY:</Text>
                  <TouchableOpacity style={stylesContainer.smallBtn} onPress={() => setTransposeKey(transposeKey - 1)}>
                    <Text style={{ color: '#FFF' }}>-1</Text>
                  </TouchableOpacity>
                  <Text style={{ fontWeight: 'bold' }}>{transposeKey > 0 ? `+${transposeKey}` : transposeKey}</Text>
                  <TouchableOpacity style={stylesContainer.smallBtn} onPress={() => setTransposeKey(transposeKey + 1)}>
                    <Text style={{ color: '#FFF' }}>+1</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[stylesContainer.smallBtn, { backgroundColor: isAutoScrolling ? 'black' : '#666' }]}
                  onPress={() => setIsAutoScrolling(!isAutoScrolling)}>
                  <Text style={{ color: '#FFF' }}>{isAutoScrolling ? 'Pause Scroll' : 'Auto Scroll'}</Text>
                </TouchableOpacity>
              </View>

              {setlists.length > 0 && (
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#888' }}>ADD TO SETLIST:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 2 }}>
                    {setlists.map((sl) => {
                      const inSetlist = sl.songIds.includes(songDetailModal?.id);
                      return (
                        <TouchableOpacity
                          key={sl.id}
                          style={[stylesContainer.chip, inSetlist && stylesContainer.chipSelected]}
                          onPress={() => toggleSongInSetlist(sl.id, songDetailModal?.id)}>
                          <Text style={[stylesContainer.chipText, inSetlist && stylesContainer.chipTextSelected]}>
                            {inSetlist ? '✓ ' : '+ '}
                            {sl.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {songDetailModal?.audioUri && (
                <TouchableOpacity
                  style={{ backgroundColor: '#000', padding: 8, borderRadius: 6, marginVertical: 6 }}
                  onPress={() => playSound(songDetailModal.audioUri)}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold', textAlign: 'center', fontSize: 12 }}>▶ Play Audio Memo</Text>
                </TouchableOpacity>
              )}

              <ScrollView ref={scrollRef} style={stylesContainer.lyricsBox}>
                {showChords && songDetailModal?.chords && (
                  <Text style={stylesContainer.chordText}>Chords: {transposeChordText(songDetailModal.chords, transposeKey)}</Text>
                )}
                <Text style={stylesContainer.lyricsText}>{transposeChordText(songDetailModal?.lyrics || '', transposeKey)}</Text>
              </ScrollView>

              <TouchableOpacity
                style={[stylesContainer.btn, stylesContainer.btnCancel, { marginTop: 10 }]}
                onPress={() => {
                  setSongDetailModal(null);
                  setIsAutoScrolling(false);
                }}>
                <Text style={stylesContainer.btnCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const stylesContainer = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hamburgerIcon: { fontSize: 20, color: '#000' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  appLogo: { width: 18, height: 18 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 1.5 },

  searchBox: { paddingHorizontal: 16, paddingTop: 8 },
  searchInput: { backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, borderWidth: 1, borderColor: '#E5E5E5' },

  setlistBar: { paddingHorizontal: 14, marginTop: 6 },
  setlistChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', marginRight: 6 },
  setlistChipActive: { backgroundColor: '#000', borderColor: '#000' },
  setlistText: { fontSize: 11, color: '#333' },
  setlistTextActive: { color: '#FFF', fontWeight: 'bold' },

  filterContainer: { backgroundColor: '#FFFFFF', paddingVertical: 4 },
  filterLabel: { fontSize: 9, fontWeight: '700', color: '#888', marginLeft: 16, marginTop: 2, letterSpacing: 1.2 },
  chipRow: { flexDirection: 'row', paddingHorizontal: 12, marginVertical: 2 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: '#F5F5F5', marginRight: 6, borderWidth: 1, borderColor: '#E5E5E5' },
  chipSelected: { backgroundColor: '#000', borderColor: '#000' },
  chipText: { fontSize: 11, color: '#555' },
  chipTextSelected: { color: '#FFF', fontWeight: 'bold' },

  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#000' },
  cardAuthor: { fontSize: 11, color: '#666', marginTop: 2 },
  tagContainer: { alignItems: 'flex-end', gap: 3 },
  tag: { fontSize: 8, fontWeight: '600', backgroundColor: '#F0F0F0', color: '#000', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, textTransform: 'uppercase' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 13 },

  fab: { 
    position: 'absolute', 
    right: 20, 
    bottom: Platform.OS === 'android' ? 30 : 20, 
    backgroundColor: '#000', 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    justify: 'center', 
    alignItems: 'center', 
    elevation: 6 
  },
  fabText: { 
    fontSize: 32, 
    color: '#FFF', 
    fontWeight: '300', 
    textAlign: 'center',
    lineHeight: 34,
    includeFontPadding: false
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
  drawerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  drawerLogo: { width: 24, height: 24 },
  drawerTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
  drawerItem: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 6, marginBottom: 4 },
  drawerItemActive: { backgroundColor: '#F5F5F5' },
  drawerItemText: { fontSize: 13, fontWeight: '600', color: '#000' },

  readerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F8F8', padding: 6, borderRadius: 6, marginVertical: 6 },
  smallBtn: { backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },

  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { fontSize: 20, fontWeight: '800', color: '#000' },
  detailAuthor: { fontSize: 13, color: '#666' },
  inputLabel: { fontSize: 9, fontWeight: '700', color: '#888', marginTop: 10, marginBottom: 3, letterSpacing: 1.2 },
  input: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, backgroundColor: '#FAFAFA' },
  textArea: { height: 100, textAlignVertical: 'top' },
  customInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },

  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E5E5' },
  btnSave: { backgroundColor: '#000' },
  btnCancelText: { color: '#000', fontWeight: '600', fontSize: 12 },
  btnSaveText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  screenTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
  screenSub: { fontSize: 11, color: '#666', marginBottom: 12 },
  dictCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 6, padding: 12, marginBottom: 8 },
  dictTitle: { fontSize: 14, fontWeight: '700', color: '#000' },
  dictNotes: { fontSize: 11, fontWeight: '600', color: '#444', marginBottom: 2 },
  dictDesc: { fontSize: 11, color: '#666' },

  settingItem: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 6, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingTitle: { fontSize: 13, fontWeight: '700', color: '#000' },
  settingDesc: { fontSize: 10, color: '#666' },

  lyricsBox: { flex: 1, backgroundColor: '#FAFAFA', borderRadius: 6, padding: 12, borderWidth: 1, borderColor: '#E5E5E5', marginTop: 4 },
  chordText: { fontSize: 12, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  lyricsText: { fontSize: 13, lineHeight: 20, color: '#222' },
});
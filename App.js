import React, { useState, useEffect, useRef } from 'react';
import { Alert, Animated, Dimensions, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  createAudioPlayer,
} from 'expo-audio';

import {
  DEFAULT_STYLES,
  DEFAULT_SCALES,
  STYLE_DICTIONARY_INITIAL,
  STORAGE_KEY,
  CUSTOM_STYLES_KEY,
  CUSTOM_SCALES_KEY,
  STYLE_DICT_KEY,
  DARK_MODE_KEY,
} from './src/constants';
import { getTheme } from './src/theme';
import { migrateSongToInline } from './src/chordParser';

// --- REMOVED CURLY BRACES FROM COMPONENT IMPORTS ---
import {Header} from './src/Header';
import {SidebarDrawer} from './src/SidebarDrawer';
import {SongsScreen} from './src/SongsScreen';
import {ScaleDictScreen} from './src/ScaleDictScreen';
import {SettingsScreen} from './src/SettingsScreen';
import {SetlistsScreen} from './src/SetlistsScreen';
import {SongEditModal} from './src/SongEditModal';
import {SongDetailModal} from './src/SongDetailModal';

const SETLISTS_KEY = '@songbook_setlists';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

export default function App() {
  const [songs, setSongs] = useState([]);
  const [setlists, setSetlists] = useState([]);
  const [styles, setStyles] = useState(DEFAULT_STYLES);
  const [scales, setScales] = useState(DEFAULT_SCALES);
  const [styleDict, setStyleDict] = useState(STYLE_DICTIONARY_INITIAL);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [currentScreen, setCurrentScreen] = useState('songs');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

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

  const theme = getTheme(isDarkMode);

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
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    return () => backHandler.remove();
  }, [songDetailModal, modalVisible, sidebarOpen, currentScreen]);

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
      const savedSetlists = await AsyncStorage.getItem(SETLISTS_KEY);
      const savedStyles = await AsyncStorage.getItem(CUSTOM_STYLES_KEY);
      const savedScales = await AsyncStorage.getItem(CUSTOM_SCALES_KEY);
      const savedStyleDict = await AsyncStorage.getItem(STYLE_DICT_KEY);
      const savedDarkMode = await AsyncStorage.getItem(DARK_MODE_KEY);

      if (savedSongs) {
        const rawSongs = JSON.parse(savedSongs);
        setSongs(
          rawSongs.map((s) => ({ ...s, content: migrateSongToInline(s) }))
        );
      }
      if (savedSetlists) setSetlists(JSON.parse(savedSetlists));
      if (savedStyles) setStyles(JSON.parse(savedStyles));
      if (savedScales) setScales(JSON.parse(savedScales));
      if (savedStyleDict) setStyleDict(JSON.parse(savedStyleDict));
      if (savedDarkMode !== null) setIsDarkMode(JSON.parse(savedDarkMode));
    } catch (e) {
      console.error('Data load error', e);
    }
  };

  // Save/Delete handler functions for setlists
  const handleSaveSetlist = async (updatedSetlist) => {
    const index = setlists.findIndex((s) => s.id === updatedSetlist.id);
    let updated = [];
    if (index >= 0) {
      updated = setlists.map((s) =>
        s.id === updatedSetlist.id ? updatedSetlist : s
      );
    } else {
      updated = [updatedSetlist, ...setlists];
    }
    setSetlists(updated);
    await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(updated));
  };

  const handleDeleteSetlist = async (id) => {
    const updated = setlists.filter((s) => s.id !== id);
    setSetlists(updated);
    await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(updated));
  };

  const startRecording = async (styleTargetName = null) => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted)
        return Alert.alert(
          'Permission required',
          'Microphone access is needed to record audio.'
        );
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
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
      const updatedDict = styleDict.map((s) =>
        s.name === recordingStyleName ? { ...s, audioUri: uri } : s
      );
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
    setContent(
      song.content !== undefined ? song.content : migrateSongToInline(song)
    );
    setAudioUri(song.audioUri || null);
    setSongDetailModal(null);
    setModalVisible(true);
  };

  const handleDeleteSong = (songId) => {
    Alert.alert('Delete Song', 'Are you sure you want to delete this song?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedSongs = songs.filter((s) => s.id !== songId);
          setSongs(updatedSongs);
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updatedSongs)
          );
          if (songDetailModal?.id === songId) {
            setSongDetailModal(null);
          }
        },
      },
    ]);
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

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <Header theme={theme} onOpenSidebar={() => toggleSidebar(true)} />

        {currentScreen === 'songs' && (
          <SongsScreen
            songs={songs}
            styles={styles}
            scales={scales}
            onSelectSong={(song) => {
              setSongDetailModal(song);
              setTransposeKey(0);
            }}
            onOpenNewSongModal={() => setModalVisible(true)}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        )}

        {currentScreen === 'setlists' && (
          <SetlistsScreen
            setlists={setlists}
            songs={songs}
            onSaveSetlist={handleSaveSetlist}
            onDeleteSetlist={handleDeleteSetlist}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        )}

        {currentScreen === 'dictionary' && <ScaleDictScreen theme={theme} />}

        {currentScreen === 'settings' && (
          <SettingsScreen
            songs={songs}
            setSongs={setSongs}
            styles={styles}
            setStyles={setStyles}
            scales={scales}
            setScales={setScales}
            styleDict={styleDict}
            setStyleDict={setStyleDict}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            theme={theme}
          />
        )}

        <SidebarDrawer
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          slideAnim={slideAnim}
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          theme={theme}
          isDarkMode={isDarkMode}
          drawerWidth={DRAWER_WIDTH}
        />

        <SongEditModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          editingSongId={editingSongId}
          setEditingSongId={setEditingSongId}
          title={title}
          setTitle={setTitle}
          author={author}
          setAuthor={setAuthor}
          style={style}
          setStyle={setStyle}
          styles={styles}
          scale={scale}
          setScale={setScale}
          scales={scales}
          content={content}
          setContent={setContent}
          audioUri={audioUri}
          setAudioUri={setAudioUri}
          recorderState={recorderState}
          recordingStyleName={recordingStyleName}
          startRecording={startRecording}
          stopRecording={stopRecording}
          handleSaveSong={handleSaveSong}
          theme={theme}
          isDarkMode={isDarkMode}
        />

        <SongDetailModal
          songDetailModal={songDetailModal}
          setSongDetailModal={setSongDetailModal}
          transposeKey={transposeKey}
          setTransposeKey={setTransposeKey}
          showChords={showChords}
          setShowChords={setShowChords}
          isAutoScrolling={isAutoScrolling}
          setIsAutoScrolling={setIsAutoScrolling}
          scrollRef={scrollRef}
          playSound={playSound}
          handleEditSong={handleEditSong}
          handleDeleteSong={handleDeleteSong}
          theme={theme}
          isDarkMode={isDarkMode}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
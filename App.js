import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Alert,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  BackHandler,
  Platform,
  Linking,
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

import {
  DEFAULT_STYLES,
  DEFAULT_SCALES,
  STORAGE_KEY,
  CUSTOM_STYLES_KEY,
  CUSTOM_SCALES_KEY,
  DARK_MODE_KEY,
} from './src/constants';
import { getTheme } from './src/theme';
import { migrateSongToInline } from './src/chordParser';

import { Header } from './src/Header';
import { DashboardScreen } from './src/DashboardScreen';
import { SongsScreen } from './src/SongsScreen';
import { SetlistsScreen } from './src/SetlistsScreen';
import { ProfileScreen } from './src/ProfileScreen';
import { ScaleDictScreen } from './src/ScaleDictScreen';
import { SettingsScreen } from './src/SettingsScreen';
import { AlbumsScreen } from './src/AlbumsScreen';
import { ArtistsScreen } from './src/ArtistsScreen';
import { SongEditModal } from './src/SongEditModal';
import { SongDetailModal } from './src/SongDetailModal';
import { BottomNavBar } from './src/BottomNavBar';

const SETLISTS_KEY = '@songbook_setlists';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SCREEN_ORDER = {
  dashboard: 0,
  songs: 1,
  albums: 2,
  artists: 3,
  setlists: 4,
  dictionary: 5,
  profile: 6,
  settings: 7,
};

export default function App() {
  const [songs, setSongs] = useState([]);
  const [setlists, setSetlists] = useState([]);
  const [styles, setStyles] = useState(DEFAULT_STYLES);
  const [scales, setScales] = useState(DEFAULT_SCALES);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [outgoingScreen, setOutgoingScreen] = useState(null);
  const [isSlidingRight, setIsSlidingRight] = useState(true);

  const transitionProgress = useRef(new Animated.Value(1)).current;

  const [modalVisible, setModalVisible] = useState(false);
  const [songDetailModal, setSongDetailModal] = useState(null);

  const [transposeKey, setTransposeKey] = useState(0);
  const [showChords, setShowChords] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [album, setAlbum] = useState('');
  const [style, setStyle] = useState('Uncategorized');
  const [scale, setScale] = useState('Uncategorized');
  const [content, setContent] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [editingSongId, setEditingSongId] = useState(null);

  const currentPlayerRef = useRef(null);

  // ----------------------------------------------------
  // DUAL-SCREEN DIRECTIONAL SLIDE TRANSITION LOGIC
  // ----------------------------------------------------
  const navigateToScreen = (targetScreen) => {
    if (targetScreen === currentScreen) return;

    const prevIndex = SCREEN_ORDER[currentScreen] ?? 0;
    const nextIndex = SCREEN_ORDER[targetScreen] ?? 0;

    const slidingRight = nextIndex > prevIndex;

    setOutgoingScreen(currentScreen);
    setCurrentScreen(targetScreen);
    setIsSlidingRight(slidingRight);

    transitionProgress.setValue(0);

    Animated.timing(transitionProgress, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setOutgoingScreen(null);
      }
    });
  };

  // ----------------------------------------------------
  // INITIALIZATION & PERSISTENCE
  // ----------------------------------------------------
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(DARK_MODE_KEY);
      if (storedTheme !== null) {
        setIsDarkMode(JSON.parse(storedTheme));
      }

      const storedStyles = await AsyncStorage.getItem(CUSTOM_STYLES_KEY);
      if (storedStyles) {
        setStyles(JSON.parse(storedStyles));
      }

      const storedScales = await AsyncStorage.getItem(CUSTOM_SCALES_KEY);
      if (storedScales) {
        setScales(JSON.parse(storedScales));
      }

      const storedSongs = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedSongs) {
        const parsedSongs = JSON.parse(storedSongs);
        const migratedSongs = parsedSongs.map((s) => ({
          ...s,
          content: migrateSongToInline(s.content || ''),
        }));
        setSongs(migratedSongs);
      }

      const storedSetlists = await AsyncStorage.getItem(SETLISTS_KEY);
      if (storedSetlists) {
        setSetlists(JSON.parse(storedSetlists));
      }
    } catch (e) {
      console.error('Error loading initial data', e);
    }
  };

  // Save dark mode setting whenever changed
  useEffect(() => {
    AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(isDarkMode)).catch(console.error);
  }, [isDarkMode]);

  // Clean up audio player on unmount
  useEffect(() => {
    return () => {
      if (currentPlayerRef.current) {
        try {
          currentPlayerRef.current.remove();
        } catch (e) {}
      }
    };
  }, []);

  const theme = getTheme(isDarkMode);

  // Play audio url (YouTube / Spotify / direct mp3)
  const playSound = async (url) => {
    if (!url) {
      Alert.alert('No Link', 'No audio link available for this song.');
      return;
    }

    try {
      const isWebUrl = url.startsWith('http://') || url.startsWith('https://');
      if (isWebUrl) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open link: ' + url);
        }
      } else {
        if (currentPlayerRef.current) {
          try {
            currentPlayerRef.current.remove();
          } catch (e) {}
        }
        const player = createAudioPlayer({ source: { uri: url } });
        currentPlayerRef.current = player;
        player.play();
      }
    } catch (error) {
      console.error('Audio playback error', error);
      Alert.alert('Playback Error', 'Unable to play media link.');
    }
  };

  // ----------------------------------------------------
  // SETLIST MANAGEMENT
  // ----------------------------------------------------
  const handleSaveSetlist = async (updatedSetlist) => {
    try {
      const exists = setlists.some((s) => s.id === updatedSetlist.id);
      let newSetlists = [];
      if (exists) {
        newSetlists = setlists.map((s) => (s.id === updatedSetlist.id ? updatedSetlist : s));
      } else {
        newSetlists = [updatedSetlist, ...setlists];
      }
      setSetlists(newSetlists);
      await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(newSetlists));
    } catch (e) {
      console.error('Error saving setlist', e);
    }
  };

  const handleDeleteSetlist = async (setlistId) => {
    try {
      const newSetlists = setlists.filter((s) => s.id !== setlistId);
      setSetlists(newSetlists);
      await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(newSetlists));
    } catch (e) {
      console.error('Error deleting setlist', e);
    }
  };

  const handleClearImportedSetlists = async () => {
    try {
      setSetlists([]);
      await AsyncStorage.removeItem(SETLISTS_KEY);
    } catch (e) {
      console.error('Error clearing setlists', e);
    }
  };

  // Batch save multiple songs at once
  const handleSaveSongsBatch = async (newSongs) => {
    try {
      const existingIds = new Set(songs.map((s) => s.id));
      const filteredNewSongs = newSongs.filter((s) => !existingIds.has(s.id));
      const updatedSongs = [...filteredNewSongs, ...songs];
      setSongs(updatedSongs);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSongs));
    } catch (e) {
      console.error('Error saving songs batch', e);
    }
  };

  // ----------------------------------------------------
  // SONG MANAGEMENT (EDIT, DELETE, CLEAR, EXPORT, IMPORT)
  // ----------------------------------------------------
  const handleEditSong = (song) => {
    setSongDetailModal(null);
    setEditingSongId(song.id);
    setTitle(song.title || '');
    setAuthor(song.author || '');
    setAlbum(song.album || '');
    setStyle(song.style || 'Uncategorized');
    setScale(song.scale || 'Uncategorized');
    setContent(song.content || '');
    setAudioUrl(song.audioUrl || '');
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
            const updated = songs.filter((s) => s.id !== songId);
            setSongs(updated);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setSongDetailModal(null);
          },
        },
      ]
    );
  };

  const handleClearImportedSongs = async () => {
    try {
      setSongs([]);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing songs', e);
    }
  };

  const handleClearAllImportedData = async () => {
    try {
      setSongs([]);
      setSetlists([]);
      setStyles(DEFAULT_STYLES);
      setScales(DEFAULT_SCALES);
      await AsyncStorage.multiRemove([
        STORAGE_KEY,
        SETLISTS_KEY,
        CUSTOM_STYLES_KEY,
        CUSTOM_SCALES_KEY,
      ]);
    } catch (e) {
      console.error('Error clearing all data', e);
    }
  };

  const handleExportSongs = async () => {
    try {
      const dataString = JSON.stringify({ songs, setlists, styles, scales }, null, 2);
      const fileUri = `${FileSystem.documentDirectory}selah_kignit_backup.json`;
      await FileSystem.writeAsStringAsync(fileUri, dataString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Export Complete', `File saved to: ${fileUri}`);
      }
    } catch (e) {
      console.error('Export error', e);
      Alert.alert('Export Error', 'Failed to export data.');
    }
  };

  const handleImportSongs = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        const importedData = JSON.parse(fileContent);

        if (Array.isArray(importedData)) {
          const migrated = importedData.map((s) => ({
            ...s,
            content: migrateSongToInline(s.content || ''),
          }));
          handleSaveSongsBatch(migrated);
        } else if (typeof importedData === 'object') {
          if (importedData.songs && Array.isArray(importedData.songs)) {
            const migrated = importedData.songs.map((s) => ({
              ...s,
              content: migrateSongToInline(s.content || ''),
            }));
            handleSaveSongsBatch(migrated);
          }
          if (importedData.setlists && Array.isArray(importedData.setlists)) {
            const newSetlists = [...importedData.setlists, ...setlists];
            setSetlists(newSetlists);
            await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(newSetlists));
          }
        }
        Alert.alert('Import Successful', 'Data has been successfully imported!');
      }
    } catch (e) {
      console.error('Import error', e);
      Alert.alert('Import Error', 'Failed to parse or import data file.');
    }
  };

  const handleSaveSong = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a song title.');
      return;
    }

    let updated = [];
    if (editingSongId) {
      updated = songs.map((s) =>
        s.id === editingSongId
          ? { ...s, title, author, album, style, scale, content, audioUrl: audioUrl.trim() }
          : s
      );
    } else {
      const newSong = {
        id: Date.now().toString(),
        title,
        author,
        album,
        style,
        scale,
        content,
        audioUrl: audioUrl.trim(),
      };
      updated = [newSong, ...songs];
    }

    setSongs(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

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

  // Render individual screen by key
  const renderScreenContent = (screenName) => {
    switch (screenName) {
      case 'dashboard':
        return (
          <DashboardScreen
            songs={songs}
            setlists={setlists}
            scales={scales}
            styles={styles}
            onSelectSong={(song) => {
              setSongDetailModal(song);
              setTransposeKey(0);
            }}
            onOpenNewSongModal={() => setModalVisible(true)}
            onNavigateToScreen={navigateToScreen}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        );
      case 'songs':
        return (
          <SongsScreen
            songs={songs}
            styles={styles}
            scales={scales}
            onSelectSong={(song) => {
              setSongDetailModal(song);
              setTransposeKey(0);
            }}
            onOpenNewSongModal={() => setModalVisible(true)}
            onClearImportedSongs={handleClearImportedSongs}
            onDeleteSong={handleDeleteSong}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        );
      case 'setlists':
        return (
          <SetlistsScreen
            setlists={setlists}
            songs={songs}
            onSaveSetlist={handleSaveSetlist}
            onDeleteSetlist={handleDeleteSetlist}
            onClearImportedSetlists={handleClearImportedSetlists}
            onSaveSongsBatch={handleSaveSongsBatch}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            songs={songs}
            setlists={setlists}
            styles={styles}
            scales={scales}
            setSongs={setSongs}
            setStyles={setStyles}
            setScales={setScales}
            onSelectSong={(song) => {
              setSongDetailModal(song);
              setTransposeKey(0);
            }}
            onOpenNewSongModal={() => setModalVisible(true)}
            onClearImportedSongs={handleClearImportedSongs}
            onClearImportedSetlists={handleClearImportedSetlists}
            onClearAllImportedData={handleClearAllImportedData}
            onDeleteSong={handleDeleteSong}
            handleExportSongs={handleExportSongs}
            handleImportSongs={handleImportSongs}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            theme={theme}
          />
        );
      case 'dictionary':
        return <ScaleDictScreen theme={theme} />;
      case 'albums':
        return (
          <AlbumsScreen
            songs={songs}
            onSelectSong={(song) => {
              setSongDetailModal(song);
              setTransposeKey(0);
            }}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        );
      case 'artists':
        return (
          <ArtistsScreen
            songs={songs}
            onSelectSong={(song) => {
              setSongDetailModal(song);
              setTransposeKey(0);
            }}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            songs={songs}
            setSongs={setSongs}
            setlists={setlists}
            styles={styles}
            setStyles={setStyles}
            scales={scales}
            setScales={setScales}
            handleExportSongs={handleExportSongs}
            handleImportSongs={handleImportSongs}
            handleClearImportedSetlists={handleClearImportedSetlists}
            handleClearImportedSongs={handleClearImportedSongs}
            handleClearAllImportedData={handleClearAllImportedData}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            theme={theme}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <Header theme={theme} onNavigateToProfile={() => navigateToScreen('profile')} />

        {/* Dual-Screen Directional Slide Transition Container */}
        <View style={{ flex: 1, overflow: 'hidden' }}>
          {/* Outgoing Screen (sliding out) */}
          {outgoingScreen && (
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  transform: [
                    {
                      translateX: transitionProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, isSlidingRight ? -SCREEN_WIDTH * 0.3 : SCREEN_WIDTH * 0.3],
                      }),
                    },
                  ],
                  opacity: transitionProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.3],
                  }),
                },
              ]}>
              {renderScreenContent(outgoingScreen)}
            </Animated.View>
          )}

          {/* Active Incoming Screen (sliding in) */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [
                  {
                    translateX: transitionProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [isSlidingRight ? SCREEN_WIDTH : -SCREEN_WIDTH, 0],
                    }),
                  },
                ],
              },
            ]}>
            {renderScreenContent(currentScreen)}
          </Animated.View>
        </View>

        {/* Bottom Navigation Bar */}
        <BottomNavBar
          currentTab={currentScreen}
          onSelectTab={navigateToScreen}
          theme={theme}
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
          album={album}
          setAlbum={setAlbum}
          style={style}
          setStyle={setStyle}
          styles={styles}
          scale={scale}
          setScale={setScale}
          scales={scales}
          content={content}
          setContent={setContent}
          audioUrl={audioUrl}
          setAudioUrl={setAudioUrl}
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
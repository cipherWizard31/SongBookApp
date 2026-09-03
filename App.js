import React, { useState, useEffect, useRef } from 'react';
import { View, Alert, Animated, Dimensions, BackHandler, Platform, Linking } from 'react-native';
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

// --- REMOVED CURLY BRACES FROM COMPONENT IMPORTS ---
import {Header} from './src/Header';
import {DashboardScreen} from './src/DashboardScreen';
import {SongsScreen} from './src/SongsScreen';
import {SetlistsScreen} from './src/SetlistsScreen';
import {ProfileScreen} from './src/ProfileScreen';
import {ScaleDictScreen} from './src/ScaleDictScreen';
import {SettingsScreen} from './src/SettingsScreen';
import {AlbumsScreen} from './src/AlbumsScreen';
import {ArtistsScreen} from './src/ArtistsScreen';
import {SongEditModal} from './src/SongEditModal';
import {SongDetailModal} from './src/SongDetailModal';
import {BottomNavBar} from './src/BottomNavBar';

const SETLISTS_KEY = '@songbook_setlists';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

export default function App() {
  const [songs, setSongs] = useState([]);
  const [setlists, setSetlists] = useState([]);
  const [styles, setStyles] = useState(DEFAULT_STYLES);
  const [scales, setScales] = useState(DEFAULT_SCALES);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

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
    const handleBackPress = () => {
      if (songDetailModal) {
        setSongDetailModal(null);
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
      const savedDarkMode = await AsyncStorage.getItem(DARK_MODE_KEY);

      if (savedSongs) {
        const rawSongs = JSON.parse(savedSongs);
        setSongs(
          rawSongs.map((s) => ({ ...s, content: migrateSongToInline(s) }))
        );
      }
      if (savedSetlists) setSetlists(JSON.parse(savedSetlists));
      if (savedStyles) {
        const parsed = JSON.parse(savedStyles);
        const filtered = parsed.filter((st) => st !== 'Uncategorized');
        filtered.push('Uncategorized');
        setStyles(filtered);
      }
      if (savedScales) {
        const parsed = JSON.parse(savedScales);
        const filtered = parsed.filter((sc) => sc !== 'Uncategorized');
        filtered.push('Uncategorized');
        setScales(filtered);
      }
      if (savedDarkMode !== null) setIsDarkMode(JSON.parse(savedDarkMode));
    } catch (e) {
      console.error('Data load error', e);
    }
  };

  // Export Full Backup Handler
  const handleExportSongs = async () => {
    try {
      const backupData = {
        version: 1,
        exportDate: new Date().toISOString(),
        songs,
        setlists,
        styles,
        scales,
      };
      const jsonString = JSON.stringify(backupData, null, 2);

      if (Platform.OS === 'web') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `selah_kignit_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert('Export Successful', 'Backup file downloaded successfully.');
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}selah_kignit_backup.json`;
      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Backup Data',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Export Saved', `Backup saved to ${fileUri}`);
      }
    } catch (error) {
      console.error('Export Error:', error);
      Alert.alert('Export Failed', error.message || 'An error occurred while exporting data.');
    }
  };

  // Import Full Backup Handler
  const handleImportSongs = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const fileUri = result.assets[0].uri;
      let jsonContent = '';

      if (Platform.OS === 'web') {
        const response = await fetch(fileUri);
        jsonContent = await response.text();
      } else {
        jsonContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      const backupData = JSON.parse(jsonContent);

      if (!backupData || (!backupData.songs && !Array.isArray(backupData))) {
        Alert.alert('Invalid Backup', 'The selected file is not a valid Selah Kignit backup JSON.');
        return;
      }

      const importedSongs = Array.isArray(backupData) ? backupData : (backupData.songs || []);
      const importedSetlists = backupData.setlists || [];
      const importedStyles = backupData.styles || [];
      const importedScales = backupData.scales || [];

      Alert.alert(
        'Confirm Import',
        `This backup contains ${importedSongs.length} song(s) and ${importedSetlists.length} setlist(s). Do you want to restore this data?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import & Restore',
            style: 'destructive',
            onPress: async () => {
              if (importedSongs.length > 0) {
                const migrated = importedSongs.map((s) => ({
                  ...s,
                  isImported: true,
                  content: migrateSongToInline(s),
                }));
                setSongs(migrated);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
              }

              if (importedSetlists.length > 0) {
                const taggedSetlists = importedSetlists.map((st) => ({
                  ...st,
                  isImported: true,
                }));
                setSetlists(taggedSetlists);
                await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(taggedSetlists));
              }

              if (importedStyles.length > 0) {
                const filtered = importedStyles.filter((st) => st !== 'Uncategorized');
                filtered.push('Uncategorized');
                setStyles(filtered);
                await AsyncStorage.setItem(CUSTOM_STYLES_KEY, JSON.stringify(filtered));
              }

              if (importedScales.length > 0) {
                const filtered = importedScales.filter((sc) => sc !== 'Uncategorized');
                filtered.push('Uncategorized');
                setScales(filtered);
                await AsyncStorage.setItem(CUSTOM_SCALES_KEY, JSON.stringify(filtered));
              }

              Alert.alert('Import Successful', 'Your data has been successfully restored!');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Import Error:', error);
      Alert.alert('Import Failed', 'Failed to parse or import the backup file. ' + error.message);
    }
  };

  // Batch Save Songs Handler (for Setlist Song imports)
  const handleSaveSongsBatch = async (newSongs) => {
    const existingIds = new Set(songs.map((s) => s.id));
    const uniqueNewSongs = newSongs.filter((s) => !existingIds.has(s.id));
    if (uniqueNewSongs.length > 0) {
      const updated = [...uniqueNewSongs, ...songs];
      setSongs(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  // Handlers to Clear Imported Data
  const handleClearImportedSetlists = async () => {
    Alert.alert(
      'Remove Imported Setlists',
      'Are you sure you want to delete all imported setlists?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const remaining = setlists.filter(
              (s) => !s.isImported && !s.title?.includes('(Imported)')
            );
            setSetlists(remaining);
            await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(remaining));
            Alert.alert('Success', 'All imported setlists have been removed.');
          },
        },
      ]
    );
  };

  const handleClearImportedSongs = async () => {
    Alert.alert(
      'Remove Imported Songs',
      'Are you sure you want to delete all imported songs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const remaining = songs.filter(
              (s) => !s.isImported && !s.title?.includes('(Imported)')
            );
            setSongs(remaining);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
            Alert.alert('Success', 'All imported songs have been removed.');
          },
        },
      ]
    );
  };

  const handleClearAllImportedData = async () => {
    Alert.alert(
      'Clear All Imported Data',
      'Are you sure you want to delete all imported songs and setlists?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All Imported',
          style: 'destructive',
          onPress: async () => {
            const remSetlists = setlists.filter(
              (s) => !s.isImported && !s.title?.includes('(Imported)')
            );
            const remSongs = songs.filter(
              (s) => !s.isImported && !s.title?.includes('(Imported)')
            );
            setSetlists(remSetlists);
            setSongs(remSongs);
            await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(remSetlists));
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remSongs));
            Alert.alert('Success', 'All imported songs and setlists have been removed.');
          },
        },
      ]
    );
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

  const startRecording = async () => {
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
    setAudioUri(uri);
  };

  const playSound = async (uri) => {
    if (!uri) return;
    const isWebOrAppUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|open\.spotify\.com|spotify\.link|soundcloud\.com)/i.test(uri);
    const isDirectAudio = /\.(mp3|m4a|wav|aac|flac|ogg)(\?.*)?$/i.test(uri) || uri.startsWith('file://');

    if (isWebOrAppUrl || !isDirectAudio) {
      Linking.openURL(uri).catch(() => {
        Alert.alert('Unable to open link', uri);
      });
      return;
    }

    try {
      if (currentPlayerRef.current) {
        currentPlayerRef.current.release();
        currentPlayerRef.current = null;
      }
      const player = createAudioPlayer({ uri });
      currentPlayerRef.current = player;
      player.play();
    } catch (err) {
      Linking.openURL(uri).catch(() => {
        Alert.alert('Playback failed', err.message);
      });
    }
  };

  const handleEditSong = (song) => {
    if (!song) return;
    setEditingSongId(song.id);
    setTitle(song.title || '');
    setAuthor(song.author || '');
    setAlbum(song.album || '');
    setStyle(song.style || 'Uncategorized');
    setScale(song.scale || 'Uncategorized');
    setContent(
      song.content !== undefined ? song.content : migrateSongToInline(song)
    );
    setAudioUrl(song.audioUrl || song.audioUri || '');
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

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <Header theme={theme} onOpenNewSongModal={() => setModalVisible(true)} />

        <View style={{ flex: 1 }}>
          {currentScreen === 'dashboard' && (
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
              onNavigateToScreen={(scr) => setCurrentScreen(scr)}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          )}

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
              onClearImportedSongs={handleClearImportedSongs}
              onDeleteSong={handleDeleteSong}
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
              onClearImportedSetlists={handleClearImportedSetlists}
              onSaveSongsBatch={handleSaveSongsBatch}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          )}

          {currentScreen === 'profile' && (
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
          )}

          {currentScreen === 'dictionary' && <ScaleDictScreen theme={theme} />}

          {currentScreen === 'albums' && (
            <AlbumsScreen
              songs={songs}
              onSelectSong={(song) => {
                setSongDetailModal(song);
                setTransposeKey(0);
              }}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          )}

          {currentScreen === 'artists' && (
            <ArtistsScreen
              songs={songs}
              onSelectSong={(song) => {
                setSongDetailModal(song);
                setTransposeKey(0);
              }}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          )}

          {currentScreen === 'settings' && (
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
          )}
        </View>

        {/* Bottom Navigation Bar */}
        <BottomNavBar
          currentTab={currentScreen}
          onSelectTab={(tab) => setCurrentScreen(tab)}
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
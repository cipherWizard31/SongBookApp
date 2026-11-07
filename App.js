import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Alert,
  BackHandler,
  Platform,
  Linking,
  PanResponder,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { createAudioPlayer } from 'expo-audio';

import {
  DEFAULT_STYLES,
  DEFAULT_SCALES,
  STORAGE_KEY,
  CUSTOM_STYLES_KEY,
  CUSTOM_SCALES_KEY,
  DARK_MODE_KEY,
  PROFILE_KEY,
  DEFAULT_PROFILE,
} from './src/constants';
import { getTheme } from './src/theme';
import { migrateSongToInline } from './src/chordParser';
import {
  buildEnvelope,
  parseEnvelope,
  validateSongPayload,
  validateSetlistPayload,
  validateBackupPayload,
} from './src/shareEnvelope';
import { saveJsonToFile, shareJsonToApp, readFileTextAsync } from './src/exportUtils';

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
import { QRScannerModal } from './src/QRScannerModal';
import { ExportOptionsModal } from './src/ExportOptionsModal';

const SETLISTS_KEY = '@songbook_setlists';

export default function App() {
  const [fontsLoaded] = useFonts({
    'AnthropicSansDisplay-Bold': require('./assets/fonts/Sans-Display-Bold-Static.otf'),
    'AnthropicSerifText-Medium': require('./assets/fonts/Serif-Text-Medium-Static.otf'),
  });

  const [songs, setSongs] = useState([]);
  const [setlists, setSetlists] = useState([]);
  const [styles, setStyles] = useState(DEFAULT_STYLES);
  const [scales, setScales] = useState(DEFAULT_SCALES);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [performanceSetlistId, setPerformanceSetlistId] = useState(null);
  const [initialSetlistId, setInitialSetlistId] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [songDetailModal, setSongDetailModal] = useState(null);
  const [qrScannerVisible, setQrScannerVisible] = useState(false);

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
  // SCREEN SWITCHING (INSTANT)
  // ----------------------------------------------------
  const MAIN_TABS = ['dashboard', 'songs', 'setlists', 'profile'];
  const currentScreenRef = useRef(currentScreen);
  currentScreenRef.current = currentScreen;

  const navigateToScreen = (targetScreen, setlistId = null) => {
    if (targetScreen !== 'setlists') {
      setPerformanceSetlistId(null);
    }
    if (setlistId) {
      setInitialSetlistId(setlistId);
    }
    if (targetScreen === currentScreen) {
      return;
    }
    setCurrentScreen(targetScreen);
  };

  // Ref so PanResponder (created once at mount) always calls the latest navigate
  const navigateRef = useRef(navigateToScreen);
  navigateRef.current = navigateToScreen;

  const mainPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        const cur = currentScreenRef.current;
        if (cur === 'profile') return false;
        // On songs, only block left-swipe over filter chips
        if (cur === 'songs' && gestureState.dx < 0) {
          const touchY = evt.nativeEvent.pageY;
          if (touchY > 140 && touchY < 250) return false;
        }
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
        return isHorizontal && Math.abs(gestureState.dx) > 10;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const cur = currentScreenRef.current;
        if (cur === 'profile') return false;
        if (cur === 'songs' && gestureState.dx < 0) {
          const touchY = evt.nativeEvent.pageY;
          if (touchY > 140 && touchY < 250) return false;
        }
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
        return isHorizontal && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (evt, gestureState) => {
        const cur = currentScreenRef.current;
        const tabs = ['dashboard', 'songs', 'setlists', 'profile'];
        const idx = tabs.indexOf(cur);
        const isLeft = gestureState.dx < -25 || (gestureState.dx < -10 && gestureState.vx < -0.15);
        const isRight = gestureState.dx > 25 || (gestureState.dx > 10 && gestureState.vx > 0.15);
        if (isLeft && idx >= 0 && idx < tabs.length - 1) {
          navigateRef.current(tabs[idx + 1]);
        } else if (isRight && idx > 0) {
          navigateRef.current(tabs[idx - 1]);
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {
        const cur = currentScreenRef.current;
        const tabs = ['dashboard', 'songs', 'setlists', 'profile'];
        const idx = tabs.indexOf(cur);
        const isLeft = gestureState.dx < -25 || (gestureState.dx < -10 && gestureState.vx < -0.15);
        const isRight = gestureState.dx > 25 || (gestureState.dx > 10 && gestureState.vx > 0.15);
        if (isLeft && idx >= 0 && idx < tabs.length - 1) {
          navigateRef.current(tabs[idx + 1]);
        } else if (isRight && idx > 0) {
          navigateRef.current(tabs[idx - 1]);
        }
      },
    })
  ).current;

  // Navigate to setlist from dashboard banner without forcing performance mode
  const handleStartWorshipService = (setlist) => {
    if (setlist) {
      setPerformanceSetlistId(setlist.id);
    }
    navigateToScreen('setlists');
  };

  // Android hardware back button / system edge back swipe support
  useEffect(() => {
    const onBackPress = () => {
      if (qrScannerVisible) {
        setQrScannerVisible(false);
        return true;
      }
      if (songDetailModal) {
        setSongDetailModal(null);
        return true;
      }
      if (modalVisible) {
        setModalVisible(false);
        return true;
      }
      if (currentScreen !== 'dashboard') {
        navigateToScreen('dashboard');
        return true;
      }
      return false;
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSubscription.remove();
  }, [currentScreen, songDetailModal, modalVisible, qrScannerVisible]);

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
          content: s.content !== undefined ? s.content : migrateSongToInline(s),
        }));
        setSongs(migratedSongs);
      }

      const storedSetlists = await AsyncStorage.getItem(SETLISTS_KEY);
      if (storedSetlists) {
        setSetlists(JSON.parse(storedSetlists));
      }

      const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
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

  const handleToggleFavorite = async (songId) => {
    try {
      const updated = songs.map((s) =>
        s.id === songId ? { ...s, isFavorite: !s.isFavorite } : s
      );
      setSongs(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (songDetailModal && songDetailModal.id === songId) {
        setSongDetailModal((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
      }
    } catch (e) {
      console.error('Error toggling favorite', e);
    }
  };

  const handleSaveProfile = async (updatedProfile) => {
    try {
      setProfile(updatedProfile);
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
    } catch (e) {
      console.error('Error saving profile', e);
    }
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

  const [exportOptionsVisible, setExportOptionsVisible] = useState(false);

  const handleExportSongs = () => {
    setExportOptionsVisible(true);
  };

  const getBackupEnvelopeString = () => {
    return JSON.stringify(
      buildEnvelope('backup', {
        songs,
        setlists,
        styles,
        scales,
      }),
      null,
      2
    );
  };

  const handleSaveBackupToFile = async () => {
    const fileName = `selah_kignit_backup_${new Date().toISOString().slice(0, 10)}.json`;
    await saveJsonToFile({
      data: getBackupEnvelopeString(),
      fileName,
      dialogTitle: 'Save Backup',
      successAlertTitle: 'Backup Saved',
      successMessage: 'Successfully saved backup to selected folder:',
    });
  };

  const handleShareBackupToApp = async () => {
    const fileName = `selah_kignit_backup_${new Date().toISOString().slice(0, 10)}.json`;
    await shareJsonToApp({
      data: getBackupEnvelopeString(),
      fileName,
      dialogTitle: 'Share Backup to App',
    });
  };

  // Helper to import song with conflict/content check
  const importSingleSongInternal = async (payload) => {
    const songErr = validateSongPayload(payload);
    if (songErr) {
      Alert.alert('Invalid Song Data', songErr);
      return;
    }

    const songData = {
      ...payload,
      id: payload.id || Date.now().toString(),
      title: payload.title.trim(),
      content: payload.content !== undefined ? payload.content : migrateSongToInline(payload),
    };

    // Skip silently if title + author already match (import dedup)
    const duplicate = songs.find(
      (s) =>
        s.title.trim().toLowerCase() === songData.title.trim().toLowerCase() &&
        (s.author || '').trim().toLowerCase() === (songData.author || '').trim().toLowerCase()
    );
    if (duplicate) {
      return; // silently skip — already in library
    }

    const sameTitleDiffContent = songs.some((s) => s.title === songData.title);
    const finalSong = {
      ...songData,
      id: Date.now().toString(),
      title: sameTitleDiffContent ? `${songData.title} (Copy)` : songData.title,
    };

    const updated = [finalSong, ...songs];
    setSongs(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    Alert.alert('Song Imported', `"${finalSong.title}" has been saved to your songs.`, [
      {
        text: 'View Song',
        onPress: () => {
          setSongDetailModal(finalSong);
          setTransposeKey(0);
        },
      },
      { text: 'OK' },
    ]);
  };

  // Helper to import setlist with smart song merging
  const importSetlistInternal = async (payload) => {
    const err = validateSetlistPayload(payload);
    if (err) {
      Alert.alert('Invalid Setlist Data', err);
      return;
    }

    const { setlist: incomingSetlist, songs: incomingSongs = [] } = payload;
    let addedCount = 0;
    let skippedCount = 0;
    const finalSongIds = [];
    const songsToAdd = [];

    for (const rawSong of incomingSongs) {
      const songContent = rawSong.content !== undefined ? rawSong.content : migrateSongToInline(rawSong);
      // Match by title + author (case-insensitive) — same logic as manual create
      const existingMatch = songs.find(
        (s) =>
          s.title.trim().toLowerCase() === (rawSong.title || '').trim().toLowerCase() &&
          (s.author || '').trim().toLowerCase() === (rawSong.author || '').trim().toLowerCase()
      );

      if (existingMatch) {
        // Same title + author already in library — skip silently, reuse its ID
        skippedCount++;
        finalSongIds.push(existingMatch.id);
      } else {
        // Brand new song
        addedCount++;
        const newId = rawSong.id || Date.now().toString() + Math.random().toString(36).slice(2, 6);
        const newSong = {
          ...rawSong,
          id: newId,
          content: songContent,
        };
        songsToAdd.push(newSong);
        finalSongIds.push(newId);
      }
    }

    if (songsToAdd.length > 0) {
      const updatedSongs = [...songsToAdd, ...songs];
      setSongs(updatedSongs);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSongs));
    }

    const newSetlist = {
      id: Date.now().toString(),
      title: incomingSetlist.title || 'Imported Setlist',
      description: incomingSetlist.description || 'Imported Setlist',
      songIds: finalSongIds,
    };

    const updatedSetlists = [newSetlist, ...setlists];
    setSetlists(updatedSetlists);
    await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(updatedSetlists));

    Alert.alert(
      'Setlist Imported',
      `"${newSetlist.title}" imported!\n\nSongs: ${addedCount} added, ${skippedCount} skipped (already in library).`,
      [
        {
          text: 'Open Setlist',
          onPress: () => navigateToScreen('setlists', newSetlist.id),
        },
        { text: 'OK' },
      ]
    );
  };

  // Helper to restore backup (Replace or Merge with rollback safeguard)
  const restoreBackupInternal = (payload) => {
    const err = validateBackupPayload(payload);
    if (err) {
      Alert.alert('Invalid Backup Data', err);
      return;
    }

    Alert.alert(
      'Restore Backup',
      `This backup contains ${payload.songs?.length || 0} songs and ${payload.setlists?.length || 0} setlists.\n\nChoose how you want to restore:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Merge',
          onPress: async () => {
            try {
              let addedSongs = 0;
              let skippedSongs = 0;
              const mergedSongs = [...songs];

              for (const bSong of payload.songs || []) {
                const bContent = bSong.content !== undefined ? bSong.content : migrateSongToInline(bSong);
                const bTitle = (bSong.title || '').trim().toLowerCase();
                const bAuthor = (bSong.author || '').trim().toLowerCase();

                // Dedup rule: match by title + author (case-insensitive)
                const existing = mergedSongs.find(
                  (s) =>
                    s.title.trim().toLowerCase() === bTitle &&
                    (s.author || '').trim().toLowerCase() === bAuthor
                );

                if (existing) {
                  // Duplicate song found during import — silently skip
                  skippedSongs++;
                } else {
                  addedSongs++;
                  mergedSongs.push({
                    ...bSong,
                    id: bSong.id || Date.now().toString() + Math.random().toString(36).slice(2, 6),
                    content: bContent,
                  });
                }
              }

              // Merge setlists (skip if same title and same song count)
              const mergedSetlists = [...setlists];
              let addedSetlists = 0;
              for (const bSetlist of payload.setlists || []) {
                const exists = mergedSetlists.some(
                  (sl) => sl.title === bSetlist.title && (sl.songIds || []).length === (bSetlist.songIds || []).length
                );
                if (!exists) {
                  addedSetlists++;
                  mergedSetlists.push({
                    ...bSetlist,
                    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
                  });
                }
              }

              setSongs(mergedSongs);
              setSetlists(mergedSetlists);
              if (payload.styles) setStyles(payload.styles);
              if (payload.scales) setScales(payload.scales);

              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedSongs));
              await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(mergedSetlists));

              Alert.alert(
                'Merge Complete',
                `Songs: ${addedSongs} added, ${skippedSongs} skipped.\nSetlists: ${addedSetlists} added.`
              );
            } catch (mergeErr) {
              console.error('Merge error', mergeErr);
              Alert.alert('Restore Failed', 'An error occurred during merge.');
            }
          },
        },
        {
          text: 'Replace Everything',
          style: 'destructive',
          onPress: async () => {
            const ROLLBACK_BACKUP_KEY = '@selah_rollback_backup_temp';
            const snapshot = { songs, setlists, styles, scales };
            try {
              // 1. Save temporary rollback point
              await AsyncStorage.setItem(ROLLBACK_BACKUP_KEY, JSON.stringify(snapshot));

              // 2. Perform replacement
              const preparedSongs = (payload.songs || []).map((s) => ({
                ...s,
                content: s.content !== undefined ? s.content : migrateSongToInline(s),
              }));

              setSongs(preparedSongs);
              setSetlists(payload.setlists || []);
              if (payload.styles) setStyles(payload.styles);
              if (payload.scales) setScales(payload.scales);

              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preparedSongs));
              await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(payload.setlists || []));
              if (payload.styles) await AsyncStorage.setItem(CUSTOM_STYLES_KEY, JSON.stringify(payload.styles));
              if (payload.scales) await AsyncStorage.setItem(CUSTOM_SCALES_KEY, JSON.stringify(payload.scales));

              // 3. Clear temporary rollback after success
              await AsyncStorage.removeItem(ROLLBACK_BACKUP_KEY);

              Alert.alert('Backup Restored', 'All songs and setlists have been replaced successfully.');
            } catch (replaceErr) {
              console.error('Replace error, rolling back', replaceErr);
              // Rollback to prior state
              try {
                const rbStr = await AsyncStorage.getItem(ROLLBACK_BACKUP_KEY);
                if (rbStr) {
                  const rb = JSON.parse(rbStr);
                  setSongs(rb.songs || []);
                  setSetlists(rb.setlists || []);
                  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rb.songs || []));
                  await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(rb.setlists || []));
                }
              } catch (rbErr) {
                console.error('Rollback failed', rbErr);
              }
              Alert.alert('Restore Error', 'Failed to restore backup. State has been rolled back.');
            }
          },
        },
      ]
    );
  };

  // Main file import handler (from Header folder-open button)
  const handleImportFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/*', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await readFileTextAsync(fileUri);

      const envelopeResult = parseEnvelope(fileContent);
      if (!envelopeResult.ok) {
        Alert.alert(
          'Invalid File',
          envelopeResult.error || 'This is not a valid Selah Kignit file or the file is corrupted.'
        );
        return;
      }

      const { type, payload } = envelopeResult;

      switch (type) {
        case 'song':
          await importSingleSongInternal(payload);
          break;
        case 'setlist':
          await importSetlistInternal(payload);
          break;
        case 'backup':
          restoreBackupInternal(payload);
          break;
        default:
          Alert.alert('Unsupported Type', `Unknown file type "${type}".`);
          break;
      }
    } catch (e) {
      console.error('File import error:', e);
      Alert.alert('Import Failed', e?.message ? `Could not read file: ${e.message}` : 'Could not open or parse the selected file.');
    }
  };

  const handleImportSongs = handleImportFile;

  // Handle direct in-app import from scanned QR code (SONG ONLY)
  const handleInAppQRImport = async (type, payload) => {
    try {
      if (type !== 'song') {
        Alert.alert(
          'Unsupported QR',
          'QR sharing only supports single songs. Setlists and backups must be shared via files.'
        );
        return;
      }
      await importSingleSongInternal(payload);
    } catch (err) {
      console.error('QR import error:', err);
      Alert.alert('Import Failed', 'Could not save the scanned song.');
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
      // Duplicate guard: same title + author (case-insensitive) → reject
      const duplicate = songs.find(
        (s) =>
          s.title.trim().toLowerCase() === title.trim().toLowerCase() &&
          (s.author || '').trim().toLowerCase() === (author || '').trim().toLowerCase()
      );
      if (duplicate) {
        Alert.alert('Song Already Exists', `A song titled "${title.trim()}" by "${author.trim() || 'Unknown'}" already exists in your library.`);
        return;
      }

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
            onStartWorshipService={handleStartWorshipService}
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
            onToggleFavorite={handleToggleFavorite}
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
            autoStartPerformanceSetlistId={performanceSetlistId}
            onClearAutoStartPerformance={() => setPerformanceSetlistId(null)}
            initialSetlistId={initialSetlistId}
            onClearInitialSetlistId={() => setInitialSetlistId(null)}
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
            profile={profile}
            handleSaveProfile={handleSaveProfile}
            onSelectSong={(song) => {
              setSongDetailModal(song);
              setTransposeKey(0);
            }}
            onToggleFavorite={handleToggleFavorite}
            onNavigateToScreen={navigateToScreen}
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
            profile={profile}
            handleSaveProfile={handleSaveProfile}
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
      case 'favourites':
        return (
          <ProfileScreen
            songs={songs}
            setlists={setlists}
            styles={styles}
            scales={scales}
            setSongs={setSongs}
            setStyles={setStyles}
            setScales={setScales}
            profile={profile}
            handleSaveProfile={handleSaveProfile}
            onSelectSong={(song) => {
              setSongDetailModal(song);
              setTransposeKey(0);
            }}
            onToggleFavorite={handleToggleFavorite}
            onNavigateToScreen={navigateToScreen}
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
      default:
        return null;
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top', 'bottom', 'left', 'right']}>
        <Header
          theme={theme}
          onNavigateToProfile={() => navigateToScreen('profile')}
          onOpenQRScanner={() => setQrScannerVisible(true)}
          onImportFile={handleImportFile}
        />

        {/* Screen Content */}
        <View style={{ flex: 1 }} {...mainPanResponder.panHandlers}>
          {renderScreenContent(currentScreen)}
        </View>

        {/* Bottom Navigation Bar */}
        <BottomNavBar
          currentTab={currentScreen}
          onSelectTab={navigateToScreen}
          theme={theme}
        />
      </SafeAreaView>

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
          handleToggleFavorite={handleToggleFavorite}
          theme={theme}
          isDarkMode={isDarkMode}
        />

        {/* Direct In-App QR Scanner */}
        <QRScannerModal
          visible={qrScannerVisible}
          onClose={() => setQrScannerVisible(false)}
          onImportData={handleInAppQRImport}
          theme={theme}
        />

        {/* Export Backup Options Modal */}
        <ExportOptionsModal
          visible={exportOptionsVisible}
          onClose={() => setExportOptionsVisible(false)}
          title="Export Backup"
          subtitle="Choose how you want to handle your exported backup"
          itemCountText={`${songs.length} songs · ${setlists.length} setlists`}
          onSaveToFile={handleSaveBackupToFile}
          onShareToApp={handleShareBackupToApp}
          theme={theme}
        />
    </SafeAreaProvider>
  );
}
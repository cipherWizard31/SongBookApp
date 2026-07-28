import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Custom Default Styles & Scales
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

// Scale Dictionary Reference
const SCALE_DICTIONARY = [
  {
    name: '1st (C Major/Tizeta)',
    notes: 'C - D - E - G - A',
    description: 'Pentatonic scale widely used for traditional, nostalgic, and joyful melodies.',
  },
  {
    name: '2nd (D Minor/Natural)',
    notes: 'D - E - F - G - A - Bb - C',
    description: 'Standard minor diatonic scale used for solemn and worshipful progressions.',
  },
  {
    name: '5th (C Major/Ambassel)',
    notes: 'C - Db - F - G - Ab',
    description: 'Pentatonic scale featuring a distinct flat second, ideal for prayerful worship.',
  },
  {
    name: '6th (D Minor/Bati)',
    notes: 'D - F - G - A - C',
    description: 'Minor pentatonic scale frequently used in expressive worship ballads.',
  },
  {
    name: 'C Minor (Anchihoye)',
    notes: 'C - Db - F - Gb - Bb',
    description: 'Unique pentatonic scale with diminished notes evoking deep reverence.',
  },
  {
    name: 'C Minor (Tizeta)',
    notes: 'C - D - Eb - G - Ab',
    description: 'Minor variant of Tizeta commonly used in reflective worship.',
  },
  {
    name: 'C Minor (Ambassel)',
    notes: 'C - Eb - F - Ab - Bb',
    description: 'Deep minor Ambassel variation for intense spiritual songs.',
  },
  {
    name: 'C Minor (Blues)',
    notes: 'C - Eb - F - F# - G - Bb',
    description: 'Hexatonic blues scale used in contemporary Christian worship arrangements.',
  },
];

const STORAGE_KEY = '@songbook_songs';
const CUSTOM_STYLES_KEY = '@songbook_custom_styles';
const CUSTOM_SCALES_KEY = '@songbook_custom_scales';

export default function App() {
  const [songs, setSongs] = useState([]);
  const [styles, setStyles] = useState(DEFAULT_STYLES);
  const [scales, setScales] = useState(DEFAULT_SCALES);

  const [currentScreen, setCurrentScreen] = useState('songs');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedScale, setSelectedScale] = useState('All');

  const [modalVisible, setModalVisible] = useState(false);
  const [songDetailModal, setSongDetailModal] = useState(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [style, setStyle] = useState('Ballad (4/4)');
  const [scale, setScale] = useState('1st (C Major/Tizeta)');
  const [lyrics, setLyrics] = useState('');

  const [newCustomStyle, setNewCustomStyle] = useState('');
  const [newCustomScale, setNewCustomScale] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedSongs = await AsyncStorage.getItem(STORAGE_KEY);
      const savedStyles = await AsyncStorage.getItem(CUSTOM_STYLES_KEY);
      const savedScales = await AsyncStorage.getItem(CUSTOM_SCALES_KEY);

      if (savedSongs) setSongs(JSON.parse(savedSongs));
      if (savedStyles) setStyles(JSON.parse(savedStyles));
      if (savedScales) setScales(JSON.parse(savedScales));
    } catch (e) {
      console.error('Failed to load data from storage', e);
    }
  };

  const handleAddCustomStyle = async () => {
    if (!newCustomStyle.trim()) return;
    const updated = [...styles, newCustomStyle.trim()];
    setStyles(updated);
    setStyle(newCustomStyle.trim());
    setNewCustomStyle('');
    await AsyncStorage.setItem(CUSTOM_STYLES_KEY, JSON.stringify(updated));
  };

  const handleAddCustomScale = async () => {
    if (!newCustomScale.trim()) return;
    const updated = [...scales, newCustomScale.trim()];
    setScales(updated);
    setScale(newCustomScale.trim());
    setNewCustomScale('');
    await AsyncStorage.setItem(CUSTOM_SCALES_KEY, JSON.stringify(updated));
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
      lyrics,
    };

    const updatedSongs = [newSong, ...songs];
    setSongs(updatedSongs);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSongs));

    setTitle('');
    setAuthor('');
    setLyrics('');
    setModalVisible(false);
  };

  const handleExportSongs = async () => {
    if (songs.length === 0) {
      Alert.alert('Export Empty', 'No songs available to export.');
      return;
    }

    try {
      const jsonContent = JSON.stringify(songs, null, 2);
      const fileUri = `${FileSystem.documentDirectory}SelahKignit_Backup.json`;

      await FileSystem.writeAsStringAsync(fileUri, jsonContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Export Saved', `Saved locally to: ${fileUri}`);
      }
    } catch (error) {
      Alert.alert('Export Error', 'Could not export songs.');
      console.error(error);
    }
  };

  const filteredSongs = songs.filter((s) => {
    const styleMatch = selectedStyle === 'All' || s.style === selectedStyle;
    const scaleMatch = selectedScale === 'All' || s.scale === selectedScale;
    return styleMatch && scaleMatch;
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={stylesContainer.container}>
        {/* HEADER */}
        <View style={stylesContainer.header}>
          <TouchableOpacity
            style={stylesContainer.hamburgerBtn}
            onPress={() => setSidebarOpen(true)}>
            <Text style={stylesContainer.hamburgerIcon}>☰</Text>
          </TouchableOpacity>

          <View style={stylesContainer.titleRow}>
            <Image
              source={require('./assets/music-note.png')}
              style={stylesContainer.appLogo}
              resizeMode="contain"
            />
            <Text style={stylesContainer.headerTitle}>SELAH KIGNIT</Text>
          </View>

          <View style={{ width: 24 }} />
        </View>

        {/* SONGS SCREEN */}
        {currentScreen === 'songs' && (
          <View style={{ flex: 1 }}>
            <View style={stylesContainer.filterContainer}>
              <Text style={stylesContainer.filterLabel}>STYLE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={stylesContainer.chipRow}>
                {styles.map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      stylesContainer.chip,
                      selectedStyle === st && stylesContainer.chipSelected,
                    ]}
                    onPress={() => setSelectedStyle(st)}>
                    <Text
                      style={[
                        stylesContainer.chipText,
                        selectedStyle === st && stylesContainer.chipTextSelected,
                      ]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={stylesContainer.filterLabel}>SCALE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={stylesContainer.chipRow}>
                {scales.map((sc) => (
                  <TouchableOpacity
                    key={sc}
                    style={[
                      stylesContainer.chip,
                      selectedScale === sc && stylesContainer.chipSelected,
                    ]}
                    onPress={() => setSelectedScale(sc)}>
                    <Text
                      style={[
                        stylesContainer.chipText,
                        selectedScale === sc && stylesContainer.chipTextSelected,
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
              contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
              ListEmptyComponent={
                <Text style={stylesContainer.emptyText}>No songs found in this view.</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={stylesContainer.card}
                  activeOpacity={0.7}
                  onPress={() => setSongDetailModal(item)}>
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

            <TouchableOpacity
              style={stylesContainer.fab}
              activeOpacity={0.8}
              onPress={() => setModalVisible(true)}>
              <Text style={stylesContainer.fabText}>+</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SCALE DICTIONARY SCREEN */}
        {currentScreen === 'dictionary' && (
          <ScrollView style={{ flex: 1, padding: 20 }}>
            <Text style={stylesContainer.screenTitle}>Scale Dictionary (Qenet)</Text>
            <Text style={stylesContainer.screenSub}>
              Reference guide for traditional scale intervals and characteristics.
            </Text>

            {SCALE_DICTIONARY.map((scaleItem) => (
              <View key={scaleItem.name} style={stylesContainer.dictCard}>
                <Text style={stylesContainer.dictTitle}>{scaleItem.name}</Text>
                <Text style={stylesContainer.dictNotes}>{scaleItem.notes}</Text>
                <Text style={stylesContainer.dictDesc}>{scaleItem.description}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* SETTINGS SCREEN */}
        {currentScreen === 'settings' && (
          <View style={{ flex: 1, padding: 20 }}>
            <Text style={stylesContainer.screenTitle}>Settings</Text>
            <Text style={stylesContainer.screenSub}>Manage your application data and backups.</Text>

            <TouchableOpacity
              style={stylesContainer.settingItem}
              onPress={handleExportSongs}>
              <View>
                <Text style={stylesContainer.settingTitle}>Export Songs Data</Text>
                <Text style={stylesContainer.settingDesc}>
                  Save a local JSON backup file of all your songs.
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: '#000' }}>➔</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SIDEBAR MENU MODAL */}
        <Modal visible={sidebarOpen} animationType="fade" transparent={true}>
          <View style={stylesContainer.drawerOverlay}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setSidebarOpen(false)}
            />
            <View style={stylesContainer.drawerContainer}>
              <View style={stylesContainer.drawerHeader}>
                <Image
                  source={require('./assets/music-note.png')}
                  style={stylesContainer.drawerLogo}
                  resizeMode="contain"
                />
                <Text style={stylesContainer.drawerTitle}>Selah Kignit</Text>
              </View>

              <TouchableOpacity
                style={[
                  stylesContainer.drawerItem,
                  currentScreen === 'songs' && stylesContainer.drawerItemActive,
                ]}
                onPress={() => {
                  setCurrentScreen('songs');
                  setSidebarOpen(false);
                }}>
                <Text style={stylesContainer.drawerItemText}>🎵 Songs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  stylesContainer.drawerItem,
                  currentScreen === 'dictionary' && stylesContainer.drawerItemActive,
                ]}
                onPress={() => {
                  setCurrentScreen('dictionary');
                  setSidebarOpen(false);
                }}>
                <Text style={stylesContainer.drawerItemText}>📖 Scale Dictionary</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  stylesContainer.drawerItem,
                  currentScreen === 'settings' && stylesContainer.drawerItemActive,
                ]}
                onPress={() => {
                  setCurrentScreen('settings');
                  setSidebarOpen(false);
                }}>
                <Text style={stylesContainer.drawerItemText}>⚙️ Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ADD SONG MODAL */}
        <Modal visible={modalVisible} animationType="fade" transparent={false}>
          <SafeAreaView style={stylesContainer.modalContainer}>
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
              <Text style={stylesContainer.modalHeader}>New Song</Text>

              <Text style={stylesContainer.inputLabel}>TITLE *</Text>
              <TextInput
                style={stylesContainer.input}
                placeholder="Song Title"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={stylesContainer.inputLabel}>AUTHOR *</Text>
              <TextInput
                style={stylesContainer.input}
                placeholder="Artist or Composer"
                placeholderTextColor="#999"
                value={author}
                onChangeText={setAuthor}
              />

              <Text style={stylesContainer.inputLabel}>STYLE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={stylesContainer.chipRow}>
                {styles.filter((s) => s !== 'All').map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[stylesContainer.chip, style === st && stylesContainer.chipSelected]}
                    onPress={() => setStyle(st)}>
                    <Text style={[stylesContainer.chipText, style === st && stylesContainer.chipTextSelected]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={stylesContainer.customInputRow}>
                <TextInput
                  style={[stylesContainer.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Custom style..."
                  placeholderTextColor="#999"
                  value={newCustomStyle}
                  onChangeText={setNewCustomStyle}
                />
                <TouchableOpacity style={stylesContainer.addSmallBtn} onPress={handleAddCustomStyle}>
                  <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>Add</Text>
                </TouchableOpacity>
              </View>

              <Text style={stylesContainer.inputLabel}>SCALE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={stylesContainer.chipRow}>
                {scales.filter((s) => s !== 'All').map((sc) => (
                  <TouchableOpacity
                    key={sc}
                    style={[stylesContainer.chip, scale === sc && stylesContainer.chipSelected]}
                    onPress={() => setScale(sc)}>
                    <Text style={[stylesContainer.chipText, scale === sc && stylesContainer.chipTextSelected]}>
                      {sc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={stylesContainer.customInputRow}>
                <TextInput
                  style={[stylesContainer.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Custom scale..."
                  placeholderTextColor="#999"
                  value={newCustomScale}
                  onChangeText={setNewCustomScale}
                />
                <TouchableOpacity style={stylesContainer.addSmallBtn} onPress={handleAddCustomScale}>
                  <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>Add</Text>
                </TouchableOpacity>
              </View>

              <Text style={stylesContainer.inputLabel}>LYRICS</Text>
              <TextInput
                style={[stylesContainer.input, stylesContainer.textArea]}
                placeholder="Write lyrics or notes..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                value={lyrics}
                onChangeText={setLyrics}
              />

              <View style={stylesContainer.buttonRow}>
                <TouchableOpacity
                  style={[stylesContainer.btn, stylesContainer.btnCancel]}
                  onPress={() => setModalVisible(false)}>
                  <Text style={stylesContainer.btnCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[stylesContainer.btn, stylesContainer.btnSave]}
                  onPress={handleSaveSong}>
                  <Text style={stylesContainer.btnSaveText}>Save Song</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* SONG DETAIL MODAL */}
        <Modal visible={!!songDetailModal} animationType="fade">
          <SafeAreaView style={stylesContainer.modalContainer}>
            <View style={{ padding: 24, flex: 1 }}>
              <Text style={stylesContainer.modalHeader}>{songDetailModal?.title}</Text>
              <Text style={stylesContainer.detailAuthor}>{songDetailModal?.author}</Text>

              <View style={stylesContainer.detailTagRow}>
                <Text style={stylesContainer.tag}>{songDetailModal?.style}</Text>
                <Text style={stylesContainer.tag}>{songDetailModal?.scale}</Text>
              </View>

              <Text style={[stylesContainer.inputLabel, { marginTop: 24 }]}>LYRICS</Text>
              <ScrollView style={stylesContainer.lyricsBox} showsVerticalScrollIndicator={false}>
                <Text style={stylesContainer.lyricsText}>
                  {songDetailModal?.lyrics || 'No lyrics provided.'}
                </Text>
              </ScrollView>

              <TouchableOpacity
                style={[stylesContainer.btn, stylesContainer.btnCancel, { marginTop: 20 }]}
                onPress={() => setSongDetailModal(null)}>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
  },
  hamburgerBtn: {
    padding: 4,
  },
  hamburgerIcon: {
    fontSize: 22,
    color: '#000000',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appLogo: {
    width: 22,
    height: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 2,
  },

  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
  },
  drawerContainer: {
    width: '75%',
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 50,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  drawerLogo: {
    width: 28,
    height: 28,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
  },
  drawerItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  drawerItemActive: {
    backgroundColor: '#F5F5F5',
  },
  drawerItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },

  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  screenSub: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 20,
  },

  dictCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  dictTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  dictNotes: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 8,
  },
  dictDesc: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },

  settingItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: '#666666',
  },

  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888888',
    marginLeft: 20,
    marginTop: 6,
    letterSpacing: 1.5,
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  chipSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  chipText: {
    fontSize: 12,
    color: '#555555',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  cardAuthor: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  tagContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  tag: {
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: '#F0F0F0',
    color: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    marginTop: 60,
    fontSize: 14,
  },

  fab: {
    position: 'absolute',
    right: 24,
    bottom: Platform.OS === 'android' ? 44 : 32,
    backgroundColor: '#000000',
    width: 56,
    height: 56,
    borderRadius: 28,
    justify: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
    color: '#000000',
  },
  detailAuthor: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 12,
  },
  detailTagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888888',
    marginTop: 18,
    marginBottom: 6,
    letterSpacing: 1.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
    color: '#000000',
  },
  textArea: {
    height: 140,
    textAlignVertical: 'top',
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  addSmallBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },

  buttonRow: {
    flexDirection: 'row',
    justify: 'space-between',
    marginTop: 28,
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  btnSave: {
    backgroundColor: '#000000',
  },
  btnCancelText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  lyricsBox: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  lyricsText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#222222',
  },
});
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
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_STYLES = ['All', 'Waltz (3/4)', 'Ballad (4/4)', 'Wollo (6/8)', 'Reggae (2/4)', 'Chikchika (6/8)', 'Disco (4/4)', 'Swing(4/4)'];
const DEFAULT_SCALES = ['All', '1st (C Major/Tizeta)', '2nd (D Minor/Natural)', '5th (C Major/Ambassel)', '6th (D Minor/Bati)', 'C Minor (Anchihoye)', 'C Minor (Tizeta)', 'C Minor (Ambassel)', 'C Minor (Blues)'];

const STORAGE_KEY = '@songbook_songs';
const CUSTOM_STYLES_KEY = '@songbook_custom_styles';
const CUSTOM_SCALES_KEY = '@songbook_custom_scales';

export default function App() {
  // State
  const [songs, setSongs] = useState([]);
  const [styles, setStyles] = useState(DEFAULT_STYLES);
  const [scales, setScales] = useState(DEFAULT_SCALES);

  // Active Filters
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedScale, setSelectedScale] = useState('All');

  // Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [songDetailModal, setSongDetailModal] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [style, setStyle] = useState('Reggae');
  const [scale, setScale] = useState('1st Position');
  const [lyrics, setLyrics] = useState('');

  // New Custom Options State
  const [newCustomStyle, setNewCustomStyle] = useState('');
  const [newCustomScale, setNewCustomScale] = useState('');

  // Load Initial Data
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

  // Add Custom Style
  const handleAddCustomStyle = async () => {
    if (!newCustomStyle.trim()) return;
    const updated = [...styles, newCustomStyle.trim()];
    setStyles(updated);
    setStyle(newCustomStyle.trim());
    setNewCustomStyle('');
    await AsyncStorage.setItem(CUSTOM_STYLES_KEY, JSON.stringify(updated));
  };

  // Add Custom Scale
  const handleAddCustomScale = async () => {
    if (!newCustomScale.trim()) return;
    const updated = [...scales, newCustomScale.trim()];
    setScales(updated);
    setScale(newCustomScale.trim());
    setNewCustomScale('');
    await AsyncStorage.setItem(CUSTOM_SCALES_KEY, JSON.stringify(updated));
  };

  // Save New Song
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

    // Reset & Close Modal
    setTitle('');
    setAuthor('');
    setLyrics('');
    setModalVisible(false);
  };

  // Filter Logic
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
          <Text style={stylesContainer.headerTitle}>SONGS</Text>
        </View>

        {/* FILTER SLIDERS */}
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

        {/* SONG FEED */}
        <FlatList
          data={filteredSongs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
          ListEmptyComponent={
            <Text style={stylesContainer.emptyText}>No songs in this view.</Text>
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

        {/* FLOATING ACTION BUTTON */}
        <TouchableOpacity
          style={stylesContainer.fab}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}>
          <Text style={stylesContainer.fabText}>+</Text>
        </TouchableOpacity>

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

              {/* STYLE SELECTION */}
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

              {/* SCALE SELECTION */}
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

              {/* LYRICS */}
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

              {/* MODAL ACTIONS */}
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

        {/* SONG DETAIL / LYRICS MODAL */}
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

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 2,
  },

  // Filter Section
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

  // Song Feed Card
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
    letterSpacing: 0.3,
  },
  cardAuthor: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
    fontWeight: '400',
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
    letterSpacing: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    marginTop: 60,
    fontSize: 14,
    letterSpacing: 0.5,
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    right: 24,
    bottom: Platform.OS === 'android' ? 44 : 32,
    backgroundColor: '#000000',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },

  // Modals
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
    color: '#000000',
    letterSpacing: 0.5,
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

  // Buttons
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
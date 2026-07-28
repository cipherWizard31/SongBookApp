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

const DEFAULT_STYLES = ['All', 'Reggae', 'Rock', 'Jazz', 'Pop', 'Acoustic'];
const DEFAULT_SCALES = ['All', '1st Position', '2nd Position', 'Major', 'Minor'];

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
          <Text style={stylesContainer.headerTitle}>🎵 Song Library</Text>
        </View>

        {/* FILTER SLIDERS */}
        <View style={stylesContainer.filterContainer}>
          <Text style={stylesContainer.filterLabel}>Style:</Text>
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

          <Text style={stylesContainer.filterLabel}>Scale:</Text>
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
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={stylesContainer.emptyText}>No songs found. Add your first song!</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={stylesContainer.card}
              onPress={() => setSongDetailModal(item)}>
              <View style={{ flex: 1 }}>
                <Text style={stylesContainer.cardTitle}>{item.title}</Text>
                <Text style={stylesContainer.cardAuthor}>by {item.author}</Text>
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
          onPress={() => setModalVisible(true)}>
          <Text style={stylesContainer.fabText}>+</Text>
        </TouchableOpacity>

        {/* ADD SONG MODAL */}
        <Modal visible={modalVisible} animationType="slide" transparent={false}>
          <SafeAreaView style={stylesContainer.modalContainer}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
              <Text style={stylesContainer.modalHeader}>Add New Song</Text>

              <Text style={stylesContainer.inputLabel}>Song Title *</Text>
              <TextInput
                style={stylesContainer.input}
                placeholder="e.g. Three Little Birds"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={stylesContainer.inputLabel}>Author / Artist *</Text>
              <TextInput
                style={stylesContainer.input}
                placeholder="e.g. Bob Marley"
                value={author}
                onChangeText={setAuthor}
              />

              {/* STYLE SELECTION */}
              <Text style={stylesContainer.inputLabel}>Style</Text>
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
                  placeholder="Or create custom style..."
                  value={newCustomStyle}
                  onChangeText={setNewCustomStyle}
                />
                <TouchableOpacity style={stylesContainer.addSmallBtn} onPress={handleAddCustomStyle}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* SCALE SELECTION */}
              <Text style={stylesContainer.inputLabel}>Scale</Text>
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
                  placeholder="Or create custom scale..."
                  value={newCustomScale}
                  onChangeText={setNewCustomScale}
                />
                <TouchableOpacity style={stylesContainer.addSmallBtn} onPress={handleAddCustomScale}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* LYRICS */}
              <Text style={stylesContainer.inputLabel}>Lyrics</Text>
              <TextInput
                style={[stylesContainer.input, stylesContainer.textArea]}
                placeholder="Enter lyrics here..."
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
                  <Text style={stylesContainer.btnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[stylesContainer.btn, stylesContainer.btnSave]}
                  onPress={handleSaveSong}>
                  <Text style={stylesContainer.btnText}>Save Song</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* SONG DETAIL / LYRICS MODAL */}
        <Modal visible={!!songDetailModal} animationType="slide">
          <SafeAreaView style={stylesContainer.modalContainer}>
            <View style={{ padding: 20, flex: 1 }}>
              <Text style={stylesContainer.modalHeader}>{songDetailModal?.title}</Text>
              <Text style={stylesContainer.cardAuthor}>By {songDetailModal?.author}</Text>

              <View style={[stylesContainer.tagContainer, { marginVertical: 12, alignItems: 'flex-start' }]}>
                <Text style={stylesContainer.tag}>Style: {songDetailModal?.style}</Text>
                <Text style={stylesContainer.tag}>Scale: {songDetailModal?.scale}</Text>
              </View>

              <Text style={stylesContainer.inputLabel}>Lyrics:</Text>
              <ScrollView style={stylesContainer.lyricsBox}>
                <Text style={stylesContainer.lyricsText}>
                  {songDetailModal?.lyrics || 'No lyrics provided.'}
                </Text>
              </ScrollView>

              <TouchableOpacity
                style={[stylesContainer.btn, stylesContainer.btnCancel, { marginTop: 15 }]}
                onPress={() => setSongDetailModal(null)}>
                <Text style={stylesContainer.btnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const stylesContainer = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 16, backgroundColor: '#1DB954', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },

  filterContainer: { backgroundColor: '#FFF', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#666', marginLeft: 16, marginTop: 4 },
  chipRow: { flexDirection: 'row', paddingHorizontal: 12, marginVertical: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#E9ECEF', marginRight: 8 },
  chipSelected: { backgroundColor: '#1DB954' },
  chipText: { fontSize: 13, color: '#333' },
  chipTextSelected: { color: '#FFF', fontWeight: 'bold' },

  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  cardAuthor: { fontSize: 14, color: '#666', marginTop: 2 },
  tagContainer: { alignItems: 'flex-end' },
  tag: { fontSize: 11, backgroundColor: '#E8F5E9', color: '#2E7D32', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 3 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 15 },

  // Updated FAB with safer bottom margin for Android home bar
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'android' ? 40 : 30,
    backgroundColor: '#1DB954',
    width: 58,
    height: 58,
    borderRadius: 29,
    justify: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: { fontSize: 32, color: '#FFF', marginTop: -3 },

  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#111' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#444', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, fontSize: 15, backgroundColor: '#FAFAFA' },
  textArea: { height: 120, textAlignVertical: 'top' },
  customInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  addSmallBtn: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },

  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnCancel: { backgroundColor: '#888' },
  btnSave: { backgroundColor: '#1DB954' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  lyricsBox: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#EEE' },
  lyricsText: { fontSize: 15, lineHeight: 22, color: '#333' },
});
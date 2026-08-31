import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export const SongsScreen = ({
  songs,
  styles,
  scales,
  onSelectSong,
  onOpenNewSongModal,
  onClearImportedSongs,
  onDeleteSong,
  theme,
  isDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedScale, setSelectedScale] = useState('All');

  const hasImportedSongs = songs.some((s) => s.isImported || s.title?.includes('(Imported)'));

  const filteredSongs = songs.filter((s) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = (s.title || '').toLowerCase().includes(query);
    const authorMatch = (s.author || '').toLowerCase().includes(query);
    const albumMatch = (s.album || '').toLowerCase().includes(query);
    const contentMatch = (s.content || s.lyrics || '').toLowerCase().includes(query);
    const searchMatch = titleMatch || authorMatch || albumMatch || contentMatch;

    const songStyle = s.style || 'Uncategorized';
    const songScale = s.scale || 'Uncategorized';

    const styleMatch = selectedStyle === 'All' || songStyle === selectedStyle;
    const scaleMatch = selectedScale === 'All' || songScale === selectedScale;

    return searchMatch && styleMatch && scaleMatch;
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={stylesContainer.searchBox}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            style={[stylesContainer.searchInput, { flex: 1, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
            placeholder="Search title, artist, album or lyrics..."
            placeholderTextColor={theme.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
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
        renderItem={({ item }) => {
          const isImported = item.isImported || item.title?.includes('(Imported)');
          return (
            <TouchableOpacity
              style={[stylesContainer.card, { backgroundColor: theme.cardBg, borderColor: isImported ? '#FF950066' : theme.border }]}
              activeOpacity={0.7}
              onPress={() => onSelectSong(item)}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[stylesContainer.cardTitle, { color: theme.text }]}>{item.title}</Text>
                  {isImported ? (
                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#FF9500', backgroundColor: '#FF950022', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 }}>
                      📥 IMPORTED
                    </Text>
                  ) : null}
                </View>
                <Text style={[stylesContainer.cardAuthor, { color: theme.subText }]}>
                  {item.author}{item.album ? ` • ${item.album}` : ''}
                </Text>
              </View>
              <View style={stylesContainer.tagContainer}>
                <Text style={[stylesContainer.tag, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0', color: theme.text }]}>{item.style}</Text>
                <Text style={[stylesContainer.tag, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0', color: theme.text }]}>{item.scale}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={[stylesContainer.fab, { backgroundColor: theme.fabBg }]} activeOpacity={0.8} onPress={onOpenNewSongModal}>
        <Text style={[stylesContainer.fabText, { color: theme.fabText }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const stylesContainer = StyleSheet.create({
  searchBox: { paddingHorizontal: 16, paddingTop: 10 },
  searchInput: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, borderWidth: 1 },
  filterContainer: { paddingVertical: 4 },
  filterLabel: { fontSize: 11, fontWeight: '700', marginLeft: 16, marginTop: 4, letterSpacing: 1.1 },
  chipRow: { flexDirection: 'row', paddingHorizontal: 12, marginVertical: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, marginRight: 6, borderWidth: 1 },
  chipText: { fontSize: 13 },
  card: { padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardAuthor: { fontSize: 13, marginTop: 3 },
  tagContainer: { alignItems: 'flex-end', gap: 4 },
  tag: { fontSize: 10, fontWeight: '600', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, textTransform: 'uppercase' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 15 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'android' ? 30 : 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  fabText: { fontSize: 34, fontWeight: '300', textAlign: 'center', lineHeight: 56, includeFontPadding: false },
});
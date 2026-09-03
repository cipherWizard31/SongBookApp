import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, FlatList,
  TouchableOpacity, StyleSheet, Platform,
} from 'react-native';

export const SongsScreen = ({
  songs,
  styles: rhythmStyles,
  scales,
  onSelectSong,
  onOpenNewSongModal,
  onClearImportedSongs,
  onDeleteSong,
  theme,
  isDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState('All');
  const [selectedScaleFilter, setSelectedScaleFilter] = useState('All');

  // Filter logic
  const filteredSongs = songs.filter((song) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      song.title?.toLowerCase().includes(q) ||
      song.author?.toLowerCase().includes(q) ||
      song.content?.toLowerCase().includes(q);

    const matchesStyle =
      selectedStyleFilter === 'All' || song.style === selectedStyleFilter;

    const matchesScale =
      selectedScaleFilter === 'All' || song.scale === selectedScaleFilter;

    return matchesSearch && matchesStyle && matchesScale;
  });

  const importedCount = songs.filter(
    (s) => s.isImported || s.title?.includes('(Imported)')
  ).length;

  return (
    <View style={[st.root, { backgroundColor: theme.bg }]}>

      {/* ── Search Bar ── */}
      <View style={[st.searchWrap, { borderBottomColor: theme.divider }]}>
        <View style={[st.searchBar, { backgroundColor: theme.cardBg }]}>
          <Text style={[st.searchGlyph, { color: theme.subText }]}>⌕</Text>
          <TextInput
            style={[st.searchInput, { color: theme.text }]}
            placeholder="Search songs, artists, or lyrics…"
            placeholderTextColor={theme.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
          />
          {searchQuery.length > 0 && Platform.OS !== 'ios' ? (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[st.clearBtn, { color: theme.subText }]}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ── Separate Filter Rows ── */}
      <View style={[st.filtersBlock, { borderBottomColor: theme.divider }]}>
        {/* Row 1: Rhythm / Style Filters */}
        <View style={st.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={st.chipScroll}>
            {rhythmStyles.map((style) => {
              const active = selectedStyleFilter === style;
              return (
                <TouchableOpacity
                  key={`style-${style}`}
                  style={[
                    st.chip,
                    {
                      backgroundColor: active ? theme.chipSelectedBg : theme.chipBg,
                      borderColor: active ? theme.chipSelectedBg : theme.chipBorder
                    },
                  ]}
                  onPress={() => setSelectedStyleFilter(style)}>
                  <Text style={[
                    st.chipText,
                    { color: active ? theme.chipSelectedText : theme.chipText },
                    active && st.chipTextActive,
                  ]}>
                    {style === 'All' ? 'All' : style}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Row 2: Kignit / Scale Filters */}
        <View style={[st.filterRow, { marginTop: 6 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={st.chipScroll}>
            {scales.map((scale) => {
              const active = selectedScaleFilter === scale;
              return (
                <TouchableOpacity
                  key={`scale-${scale}`}
                  style={[
                    st.chip,
                    {
                      backgroundColor: active ? theme.chipSelectedBg : theme.chipBg,
                      borderColor: active ? theme.chipSelectedBg : theme.chipBorder
                    },
                  ]}
                  onPress={() => setSelectedScaleFilter(scale)}>
                  <Text style={[
                    st.chipText,
                    { color: active ? theme.chipSelectedText : theme.chipText },
                    active && st.chipTextActive,
                  ]}>
                    {scale === 'All' ? 'All' : scale}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* ── Imported Songs Clear Banner ── */}
      {importedCount > 0 && onClearImportedSongs ? (
        <TouchableOpacity
          style={[st.importedBanner, { borderBottomColor: theme.divider }]}
          onPress={onClearImportedSongs}>
          <Text style={[st.importedBannerText, { color: theme.subText }]} numberOfLines={1}>
            {importedCount} imported {importedCount === 1 ? 'song' : 'songs'} in library · Tap to remove
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* ── Songs List ── */}
      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={st.listContent}
        ItemSeparatorComponent={() => (
          <View style={[st.sep, { backgroundColor: theme.divider, marginLeft: 16 }]} />
        )}
        ListEmptyComponent={
          <View style={st.empty}>
            <Text style={[st.emptyTitle, { color: theme.subText }]}>No songs found</Text>
            <Text style={[st.emptyHint, { color: theme.subText }]}>
              {searchQuery
                ? `No results for "${searchQuery}"`
                : 'Tap + to add your first song to Selah Kignit'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const author = item.author?.trim();
          const subtitle = [author, item.style].filter(Boolean).join(' · ');
          const isImported = item.isImported || item.title?.includes('(Imported)');

          return (
            <TouchableOpacity
              style={[st.row, { backgroundColor: theme.bg }]}
              activeOpacity={0.55}
              onPress={() => onSelectSong(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, ${subtitle || 'song'}`}>
              <View style={st.rowText}>
                <View style={st.titleLine}>
                  <Text style={[st.songTitle, { color: theme.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {isImported ? (
                    <Text style={[st.importedBadge, { color: theme.subText }]}>imported</Text>
                  ) : null}
                </View>
                {subtitle ? (
                  <Text style={[st.songSub, { color: theme.subText }]} numberOfLines={1}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>

              {/* Scale / Key badge */}
              {item.scale && item.scale !== 'Uncategorized' ? (
                <View style={[st.scaleBadge, { backgroundColor: theme.secondaryBg }]}>
                  <Text style={[st.scaleText, { color: theme.subText }]}>
                    {item.scale}
                  </Text>
                </View>
              ) : null}

              {/* Chevron */}
              <Text style={[st.chevron, { color: theme.subText }]}>›</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ── Floating Action Button (New Song) ── */}
      <TouchableOpacity
        style={[st.fab, { backgroundColor: theme.fabBg }]}
        activeOpacity={0.8}
        onPress={onOpenNewSongModal}
        accessibilityRole="button"
        accessibilityLabel="Add new song">
        <Text style={[st.fabGlyph, { color: theme.fabText }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const st = StyleSheet.create({
  root: { flex: 1 },

  // Search
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchGlyph: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 17, padding: 0 },
  clearBtn: { fontSize: 14, paddingLeft: 8 },

  // Dual filter rows block
  filtersBlock: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterRow: {},
  chipScroll: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: { fontSize: 13 },
  chipTextActive: { fontWeight: '600' },

  // Imported banner
  importedBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  importedBannerText: { fontSize: 13, textAlign: 'center' },

  // List
  listContent: { paddingBottom: 88 },
  sep: { height: StyleSheet.hairlineWidth },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 60,
  },
  rowText: { flex: 1, paddingRight: 12 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  songTitle: { fontSize: 17, fontWeight: '400', flexShrink: 1 },
  importedBadge: { fontSize: 11, fontWeight: '400' },
  songSub: { fontSize: 15, marginTop: 2 },
  scaleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  scaleText: { fontSize: 12, fontWeight: '400' },
  chevron: { fontSize: 20, fontWeight: '300' },

  // Empty state
  empty: { paddingTop: 64, paddingHorizontal: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '500', marginBottom: 6 },
  emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // FAB
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabGlyph: { fontSize: 28, fontWeight: '300', marginTop: -2 },
});

export default SongsScreen;
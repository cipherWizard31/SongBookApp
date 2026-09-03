import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const SongsScreen = ({
  songs = [],
  styles: rhythmStyles = [],
  scales = [],
  onSelectSong,
  onOpenNewSongModal,
  onClearImportedSongs,
  onDeleteSong,
  theme,
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
      song.album?.toLowerCase().includes(q) ||
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

  const isFiltered =
    searchQuery.trim().length > 0 ||
    selectedStyleFilter !== 'All' ||
    selectedScaleFilter !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStyleFilter('All');
    setSelectedScaleFilter('All');
  };

  return (
    <View style={[st.root, { backgroundColor: theme.bg }]}>

      {/* ── Search Bar ── */}
      <View style={[st.searchWrap, { borderBottomColor: theme.divider }]}>
        <View style={[st.searchBar, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.subText} style={st.searchIcon} />
          <TextInput
            style={[st.searchInput, { color: theme.text }]}
            placeholder="Search title, artist, album, or lyrics…"
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
              <Ionicons name="close-circle" size={18} color={theme.subText} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ── Dual Filter Rows ── */}
      <View style={[st.filtersBlock, { borderBottomColor: theme.divider, backgroundColor: theme.bg }]}>
        {/* Row 1: Rhythm / Style Filters */}
        <View style={st.filterRowContainer}>
          <Text style={[st.filterLabel, { color: theme.subText }]}>RHYTHM</Text>
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
                      borderColor: active ? theme.chipSelectedBg : theme.chipBorder,
                    },
                  ]}
                  onPress={() => setSelectedStyleFilter(style)}>
                  <Text
                    style={[
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
        <View style={[st.filterRowContainer, { marginTop: 6 }]}>
          <Text style={[st.filterLabel, { color: theme.subText }]}>SCALE</Text>
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
                      borderColor: active ? theme.chipSelectedBg : theme.chipBorder,
                    },
                  ]}
                  onPress={() => setSelectedScaleFilter(scale)}>
                  <Text
                    style={[
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

      {/* ── Status & Filter Summary Bar ── */}
      <View style={[st.summaryBar, { borderBottomColor: theme.divider }]}>
        <Text style={[st.summaryText, { color: theme.subText }]}>
          {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
        </Text>
        {isFiltered && (
          <TouchableOpacity onPress={resetFilters} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[st.resetText, { color: theme.tint }]}>Reset filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Imported Songs Banner ── */}
      {importedCount > 0 && onClearImportedSongs ? (
        <TouchableOpacity
          style={[st.importedBanner, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
          onPress={onClearImportedSongs}
          activeOpacity={0.7}>
          <Ionicons name="cloud-download-outline" size={16} color={theme.tint} style={{ marginRight: 8 }} />
          <Text style={[st.importedBannerText, { color: theme.text }]} numberOfLines={1}>
            {importedCount} imported {importedCount === 1 ? 'song' : 'songs'} in library
          </Text>
          <Text style={[st.importedBannerAction, { color: theme.tint }]}>Remove</Text>
        </TouchableOpacity>
      ) : null}

      {/* ── Songs List ── */}
      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={st.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={st.empty}>
            <View style={[st.emptyIconWrap, { backgroundColor: theme.cardBg }]}>
              <Ionicons name="musical-notes-outline" size={32} color={theme.subText} />
            </View>
            <Text style={[st.emptyTitle, { color: theme.text }]}>No songs found</Text>
            <Text style={[st.emptyHint, { color: theme.subText }]}>
              {searchQuery
                ? `No songs match "${searchQuery}" with active filters.`
                : 'No songs available for the selected filters.'}
            </Text>
            {isFiltered && (
              <TouchableOpacity
                style={[st.emptyResetBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                onPress={resetFilters}>
                <Text style={[st.emptyResetBtnText, { color: theme.text }]}>Clear all filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const author = item.author?.trim();
          const album = item.album?.trim();
          const isImported = item.isImported || item.title?.includes('(Imported)');
          const hasAudio = Boolean(item.audioUrl || item.audioUri);
          const hasScale = item.scale && item.scale !== 'Uncategorized';
          const hasStyle = item.style && item.style !== 'Uncategorized';

          return (
            <TouchableOpacity
              style={[
                st.card,
                {
                  backgroundColor: theme.secondaryBg,
                  borderColor: theme.divider,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => onSelectSong(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}${author ? ` by ${author}` : ''}`}>

              {/* Left Avatar Tile */}
              <View style={[st.avatarTile, { backgroundColor: theme.cardBg }]}>
                <Ionicons name="musical-notes" size={20} color={theme.tint} />
              </View>

              {/* Center Info Area */}
              <View style={st.cardContent}>
                {/* Title line */}
                <View style={st.titleRow}>
                  <Text style={[st.songTitle, { color: theme.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {isImported && (
                    <View style={[st.badgePill, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                      <Text style={[st.badgeText, { color: theme.subText }]}>Imported</Text>
                    </View>
                  )}
                  {hasAudio && (
                    <View style={[st.audioBadge, { backgroundColor: theme.tint + '1A' }]}>
                      <Ionicons name="volume-medium" size={12} color={theme.tint} />
                    </View>
                  )}
                </View>

                {/* Artist & Album lines */}
                {(author || album) ? (
                  <View style={st.metaBlock}>
                    {author ? (
                      <View style={st.metaItem}>
                        <Ionicons name="person-outline" size={12} color={theme.subText} style={{ marginRight: 4 }} />
                        <Text style={[st.metaText, { color: theme.subText }]} numberOfLines={1}>
                          {author}
                        </Text>
                      </View>
                    ) : null}
                    {album ? (
                      <View style={st.metaItem}>
                        <Ionicons name="disc-outline" size={12} color={theme.subText} style={{ marginRight: 4 }} />
                        <Text style={[st.metaText, { color: theme.subText }]} numberOfLines={1}>
                          {album}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {/* Musical Tags line (Scale & Rhythm) */}
                {(hasScale || hasStyle) ? (
                  <View style={st.tagsRow}>
                    {hasScale ? (
                      <View style={[st.tagPill, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                        <Ionicons name="key-outline" size={10} color={theme.subText} style={{ marginRight: 3 }} />
                        <Text style={[st.tagText, { color: theme.text }]} numberOfLines={1}>
                          {item.scale}
                        </Text>
                      </View>
                    ) : null}
                    {hasStyle ? (
                      <View style={[st.tagPill, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                        <Ionicons name="pulse-outline" size={10} color={theme.subText} style={{ marginRight: 3 }} />
                        <Text style={[st.tagText, { color: theme.subText }]} numberOfLines={1}>
                          {item.style}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>

              {/* Right Chevron */}
              <Ionicons name="chevron-forward" size={18} color={theme.subText} style={st.chevronIcon} />
            </TouchableOpacity>
          );
        }}
      />

      {/* ── Floating Action Button (New Song) ── */}
      <TouchableOpacity
        style={[st.fab, { backgroundColor: theme.fabBg }]}
        activeOpacity={0.85}
        onPress={onOpenNewSongModal}
        accessibilityRole="button"
        accessibilityLabel="Add new song">
        <Ionicons name="add" size={28} color={theme.fabText} />
      </TouchableOpacity>
    </View>
  );
};

const st = StyleSheet.create({
  root: { flex: 1 },

  // Search
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, padding: 0 },

  // Dual filter rows block
  filtersBlock: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    width: 68,
    paddingLeft: 16,
  },
  chipScroll: {
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: { fontSize: 12.5 },
  chipTextActive: { fontWeight: '600' },

  // Summary bar
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  summaryText: { fontSize: 12, fontWeight: '500' },
  resetText: { fontSize: 12, fontWeight: '600' },

  // Imported banner
  importedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  importedBannerText: { flex: 1, fontSize: 13, fontWeight: '500' },
  importedBannerAction: { fontSize: 13, fontWeight: '600' },

  // List
  listContent: {
    paddingTop: 8,
    paddingBottom: 110,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  avatarTile: {
    width: 44,
    height: 44,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
    letterSpacing: -0.2,
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeText: { fontSize: 10, fontWeight: '500' },
  audioBadge: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaBlock: {
    marginTop: 3,
    gap: 3,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '400',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  chevronIcon: {
    marginLeft: 8,
  },

  // Empty state
  empty: {
    paddingTop: 64,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyResetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyResetBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 88,
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
});

export default SongsScreen;
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AMBER = '#E5A93C';
const BURG = '#862633';

export const FavouritesScreen = ({
  songs = [],
  onSelectSong,
  onToggleFavorite,
  theme,
  isDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter only favorited songs
  const favouriteSongs = songs.filter((s) => s.isFavorite);

  // Apply search query
  const filteredFavourites = favouriteSongs.filter((song) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      song.title?.toLowerCase().includes(q) ||
      song.author?.toLowerCase().includes(q) ||
      song.album?.toLowerCase().includes(q) ||
      song.scale?.toLowerCase().includes(q) ||
      song.style?.toLowerCase().includes(q) ||
      song.content?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={[st.root, { backgroundColor: theme.bg }]}>
      {/* ── Search Bar ── */}
      <View style={[st.searchWrap, { borderBottomColor: theme.divider }]}>
        <View style={[st.searchBar, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.subText} style={st.searchIcon} />
          <TextInput
            style={[st.searchInput, { color: theme.text }]}
            placeholder="Search favourites by title, artist, scale…"
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

      {/* ── Summary Bar ── */}
      {favouriteSongs.length > 0 && (
        <View style={[st.summaryBar, { borderBottomColor: theme.divider }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="star" size={13} color={AMBER} />
            <Text style={[st.summaryText, { color: theme.subText }]}>
              {searchQuery
                ? `Showing ${filteredFavourites.length} of ${favouriteSongs.length} favourites`
                : `${favouriteSongs.length} favourite ${favouriteSongs.length === 1 ? 'song' : 'songs'}`}
            </Text>
          </View>
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[st.resetText, { color: theme.tint }]}>Clear search ✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Favourites List ── */}
      <FlatList
        data={filteredFavourites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={st.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={st.empty}>
            <View style={[st.emptyIconWrap, { backgroundColor: `${AMBER}15`, borderColor: `${AMBER}35` }]}>
              <Ionicons
                name={searchQuery ? 'search-outline' : 'star-outline'}
                size={34}
                color={AMBER}
              />
            </View>
            <Text style={[st.emptyTitle, { color: theme.text }]}>
              {searchQuery ? 'No Matching Favourites' : 'No Favourites Yet'}
            </Text>
            <Text style={[st.emptyHint, { color: theme.subText }]}>
              {searchQuery
                ? `No favourite songs match "${searchQuery}".`
                : 'Star songs from your library to keep your most-performed songs readily accessible here.'}
            </Text>
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={[st.emptyResetBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                onPress={() => setSearchQuery('')}>
                <Text style={[st.emptyResetBtnText, { color: theme.text }]}>Clear search</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const author = item.author?.trim();
          const album = item.album?.trim();
          const hasScale = item.scale && item.scale !== 'Uncategorized';
          const hasStyle = item.style && item.style !== 'Uncategorized';
          const hasAudio = Boolean(item.audioUrl || item.audioUri);

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
                  {hasAudio && (
                    <View style={[st.audioBadge, { backgroundColor: `${AMBER}20` }]}>
                      <Ionicons name="volume-medium" size={12} color={theme.tint} />
                    </View>
                  )}
                </View>

                {/* Artist & Album */}
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

                {/* Scale & Rhythm Tags */}
                {(hasScale || hasStyle) ? (
                  <View style={st.tagsRow}>
                    {hasScale && (
                      <View style={[st.tagPill, { backgroundColor: theme.cardBg, borderColor: `${AMBER}35` }]}>
                        <Ionicons name="key-outline" size={10} color={AMBER} style={{ marginRight: 3 }} />
                        <Text style={[st.tagText, { color: AMBER }]} numberOfLines={1}>
                          {item.scale}
                        </Text>
                      </View>
                    )}
                    {hasStyle && (
                      <View style={[st.tagPill, { backgroundColor: theme.cardBg, borderColor: `${BURG}40` }]}>
                        <Ionicons name="pulse-outline" size={10} color={theme.subText} style={{ marginRight: 3 }} />
                        <Text style={[st.tagText, { color: theme.subText }]} numberOfLines={1}>
                          {item.style}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : null}
              </View>

              {/* Right Action: Star Toggle Button */}
              <TouchableOpacity
                style={st.starActionBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => onToggleFavorite && onToggleFavorite(item.id)}
                accessibilityRole="button"
                accessibilityLabel="Remove from favourites">
                <Ionicons name="star" size={20} color={AMBER} />
              </TouchableOpacity>

              {/* Right Chevron */}
              <Ionicons name="chevron-forward" size={18} color={theme.subText} style={st.chevronIcon} />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export const FavoritesScreen = FavouritesScreen;

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
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, padding: 0, fontWeight: '500' },

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

  // List
  listContent: {
    paddingTop: 8,
    paddingBottom: 48,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatarTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    fontWeight: '700',
    flexShrink: 1,
    letterSpacing: -0.2,
  },
  audioBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaBlock: {
    marginTop: 4,
    gap: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  metaText: {
    fontSize: 12.5,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  starActionBtn: {
    padding: 6,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronIcon: {
    marginLeft: 4,
  },

  // Empty state
  empty: {
    paddingTop: 64,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
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
});

export default FavouritesScreen;


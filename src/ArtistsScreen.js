import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export const ArtistsScreen = ({ songs, onSelectSong, theme, isDarkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);

  const artistMap = {};
  songs.forEach((song) => {
    const name = song.author?.trim() || 'Unknown Artist';
    if (!artistMap[name]) artistMap[name] = [];
    artistMap[name].push(song);
  });

  const artistsList = Object.keys(artistMap)
    .map((name) => ({
      name,
      songs: artistMap[name],
      albums: [...new Set(artistMap[name].map((s) => s.album).filter(Boolean))],
    }))
    .filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  // ── Artist detail view ──
  if (selectedArtist) {
    const artistObj = artistsList.find((a) => a.name === selectedArtist) || {
      name: selectedArtist,
      songs: artistMap[selectedArtist] || [],
      albums: [],
    };

    return (
      <View style={[st.root, { backgroundColor: theme.bg }]}>
        {/* Back navigation */}
        <TouchableOpacity
          style={[st.backRow, { borderBottomColor: theme.divider }]}
          onPress={() => setSelectedArtist(null)}
          accessibilityRole="button"
          accessibilityLabel="Back to artists">
          <Text style={[st.backLabel, { color: theme.text }]}>‹ Artists</Text>
        </TouchableOpacity>

        {/* Artist header */}
        <View style={[st.artistHeader, { borderBottomColor: theme.divider }]}>
          <View style={[st.avatarCircle, { backgroundColor: theme.cardBg }]}>
            <Text style={[st.avatarInitial, { color: theme.text }]}>
              {artistObj.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[st.artistName, { color: theme.text }]}>{artistObj.name}</Text>
          <Text style={[st.artistMeta, { color: theme.subText }]}>
            {artistObj.songs.length} {artistObj.songs.length === 1 ? 'song' : 'songs'}
            {artistObj.albums.length > 0
              ? ` · ${artistObj.albums.length} ${artistObj.albums.length === 1 ? 'album' : 'albums'}`
              : ''}
          </Text>
        </View>

        {/* Discography list */}
        <FlatList
          data={artistObj.songs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 48 }}
          ItemSeparatorComponent={() => (
            <View style={[st.sep, { backgroundColor: theme.divider, marginLeft: 52 }]} />
          )}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[st.trackRow, { backgroundColor: theme.bg }]}
              activeOpacity={0.55}
              onPress={() => onSelectSong(item)}>
              <Text style={[st.trackNum, { color: theme.subText }]}>{index + 1}</Text>
              <View style={st.trackText}>
                <Text style={[st.trackTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[st.trackSub, { color: theme.subText }]} numberOfLines={1}>
                  {item.album ? `Album: ${item.album}` : item.style || 'Uncategorized'}
                </Text>
              </View>
              <Text style={[st.chevron, { color: theme.subText }]}>›</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // ── Artists list ──
  return (
    <View style={[st.root, { backgroundColor: theme.bg }]}>
      {/* Search */}
      <View style={[st.searchWrap, { borderBottomColor: theme.divider }]}>
        <View style={[st.searchBar, { backgroundColor: theme.cardBg }]}>
          <Text style={[st.searchGlyph, { color: theme.subText }]}>⌕</Text>
          <TextInput
            style={[st.searchInput, { color: theme.text }]}
            placeholder="Search artists…"
            placeholderTextColor={theme.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
          />
        </View>
      </View>

      <FlatList
        data={artistsList}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingBottom: 48 }}
        ListEmptyComponent={
          <View style={st.empty}>
            <Text style={[st.emptyTitle, { color: theme.subText }]}>No artists</Text>
            <Text style={[st.emptyHint, { color: theme.subText }]}>
              Add an artist name to your songs to see them here
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View style={[st.sep, { backgroundColor: theme.divider, marginLeft: 68 }]} />
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[st.artistRow, { backgroundColor: theme.bg }]}
            activeOpacity={0.55}
            onPress={() => setSelectedArtist(item.name)}>
            <View style={[st.artistAvatar, { backgroundColor: theme.cardBg }]}>
              <Text style={[st.artistInitial, { color: theme.text }]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={st.artistText}>
              <Text style={[st.artistTitle, { color: theme.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[st.artistSub, { color: theme.subText }]} numberOfLines={1}>
                {item.songs.length} {item.songs.length === 1 ? 'song' : 'songs'}
                {item.albums.length > 0 ? ` · ${item.albums.slice(0, 2).join(', ')}` : ''}
              </Text>
            </View>
            <Text style={[st.chevron, { color: theme.subText }]}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const st = StyleSheet.create({
  root: { flex: 1 },

  // Search
  searchWrap: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, paddingHorizontal: 12, height: 44,
  },
  searchGlyph: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, padding: 0 },

  // Artist list rows
  sep: { height: StyleSheet.hairlineWidth },
  artistRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, minHeight: 64,
  },
  artistAvatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  artistInitial: { fontSize: 18, fontWeight: '600' },
  artistText: { flex: 1, paddingRight: 8 },
  artistTitle: { fontSize: 15, fontWeight: '500' },
  artistSub: { fontSize: 13, marginTop: 2 },
  chevron: { fontSize: 22, fontWeight: '300' },

  // Empty
  empty: { paddingTop: 64, paddingHorizontal: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '500', marginBottom: 6 },
  emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Artist detail
  backRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, height: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backLabel: { fontSize: 15, fontWeight: '400' },

  artistHeader: {
    alignItems: 'center', paddingVertical: 24,
    paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarInitial: { fontSize: 28, fontWeight: '600' },
  artistName: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  artistMeta: { fontSize: 13 },

  // Track rows
  trackRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, minHeight: 56,
  },
  trackNum: {
    width: 28, fontSize: 14, fontWeight: '400', textAlign: 'center',
  },
  trackText: { flex: 1, paddingHorizontal: 8 },
  trackTitle: { fontSize: 15, fontWeight: '500' },
  trackSub: { fontSize: 13, marginTop: 2 },
});

export default ArtistsScreen;

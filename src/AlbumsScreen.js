import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export const AlbumsScreen = ({ songs, onSelectSong, theme, isDarkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const albumMap = {};
  songs.forEach((song) => {
    const name = song.album?.trim() || 'No Album';
    if (!albumMap[name]) albumMap[name] = [];
    albumMap[name].push(song);
  });

  const albumsList = Object.keys(albumMap)
    .map((name) => ({
      name,
      songs: albumMap[name],
      artists: [...new Set(albumMap[name].map((s) => s.author).filter(Boolean))],
    }))
    .filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  // ── Album detail view ──
  if (selectedAlbum) {
    const albumObj = albumsList.find((a) => a.name === selectedAlbum) || {
      name: selectedAlbum,
      songs: albumMap[selectedAlbum] || [],
    };

    return (
      <View style={[st.root, { backgroundColor: theme.bg }]}>
        {/* Back row */}
        <TouchableOpacity
          style={[st.backRow, { borderBottomColor: theme.divider }]}
          onPress={() => setSelectedAlbum(null)}
          accessibilityRole="button"
          accessibilityLabel="Back to albums">
          <Text style={[st.backLabel, { color: theme.text }]}>‹ Albums</Text>
        </TouchableOpacity>

        {/* Album header */}
        <View style={[st.albumHeader, { borderBottomColor: theme.divider }]}>
          <View style={[st.albumArt, { backgroundColor: theme.cardBg }]}>
            <Text style={st.albumArtGlyph}>♪</Text>
          </View>
          <Text style={[st.albumName, { color: theme.text }]}>{albumObj.name}</Text>
          <Text style={[st.albumMeta, { color: theme.subText }]}>
            {albumObj.songs.length} {albumObj.songs.length === 1 ? 'song' : 'songs'}
          </Text>
        </View>

        {/* Track list */}
        <FlatList
          data={albumObj.songs}
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
                {item.author ? (
                  <Text style={[st.trackSub, { color: theme.subText }]} numberOfLines={1}>
                    {item.author}
                  </Text>
                ) : null}
              </View>
              <Text style={[st.chevron, { color: theme.subText }]}>›</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // ── Album grid / list ──
  return (
    <View style={[st.root, { backgroundColor: theme.bg }]}>
      {/* Search */}
      <View style={[st.searchWrap, { borderBottomColor: theme.divider }]}>
        <View style={[st.searchBar, { backgroundColor: theme.cardBg }]}>
          <Text style={[st.searchGlyph, { color: theme.subText }]}>⌕</Text>
          <TextInput
            style={[st.searchInput, { color: theme.text }]}
            placeholder="Search albums…"
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
        data={albumsList}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingBottom: 48 }}
        ListEmptyComponent={
          <View style={st.empty}>
            <Text style={[st.emptyTitle, { color: theme.subText }]}>No albums</Text>
            <Text style={[st.emptyHint, { color: theme.subText }]}>
              Add an album name to your songs to see them here
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View style={[st.sep, { backgroundColor: theme.divider, marginLeft: 68 }]} />
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[st.albumRow, { backgroundColor: theme.bg }]}
            activeOpacity={0.55}
            onPress={() => setSelectedAlbum(item.name)}>
            {/* Album art placeholder */}
            <View style={[st.albumThumb, { backgroundColor: theme.cardBg }]}>
              <Text style={st.albumThumbGlyph}>♪</Text>
            </View>
            <View style={st.albumText}>
              <Text style={[st.albumTitle, { color: theme.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[st.albumSub, { color: theme.subText }]} numberOfLines={1}>
                {item.songs.length} {item.songs.length === 1 ? 'song' : 'songs'}
                {item.artists.length > 0 ? ` · ${item.artists.slice(0, 2).join(', ')}` : ''}
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

  // Album list rows
  sep: { height: StyleSheet.hairlineWidth },
  albumRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, minHeight: 64,
  },
  albumThumb: {
    width: 44, height: 44, borderRadius: 6,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  albumThumbGlyph: { fontSize: 20, color: '#999' },
  albumText: { flex: 1, paddingRight: 8 },
  albumTitle: { fontSize: 15, fontWeight: '500' },
  albumSub: { fontSize: 13, marginTop: 2 },
  chevron: { fontSize: 22, fontWeight: '300' },

  // Empty
  empty: { paddingTop: 64, paddingHorizontal: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '500', marginBottom: 6 },
  emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Album detail
  backRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, height: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backLabel: { fontSize: 15, fontWeight: '400' },

  albumHeader: {
    alignItems: 'center', paddingVertical: 24,
    paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  albumArt: {
    width: 80, height: 80, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  albumArtGlyph: { fontSize: 36, color: '#999' },
  albumName: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  albumMeta: { fontSize: 13 },

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

export default AlbumsScreen;

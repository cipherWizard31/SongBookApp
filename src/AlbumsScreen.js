import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export const AlbumsScreen = ({ songs, onSelectSong, theme, isDarkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // Group songs by album
  const albumMap = {};
  songs.forEach((song) => {
    const albumName = song.album?.trim() || 'Uncategorized Albums';
    if (!albumMap[albumName]) {
      albumMap[albumName] = [];
    }
    albumMap[albumName].push(song);
  });

  const albumsList = Object.keys(albumMap)
    .map((name) => ({
      name,
      songs: albumMap[name],
      artists: Array.from(new Set(albumMap[name].map((s) => s.author).filter(Boolean))),
    }))
    .filter((album) => album.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Selected Album Song List View
  if (selectedAlbum) {
    const albumObj = albumsList.find((a) => a.name === selectedAlbum) || {
      name: selectedAlbum,
      songs: albumMap[selectedAlbum] || [],
    };

    return (
      <View style={{ flex: 1, padding: 16 }}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
          onPress={() => setSelectedAlbum(null)}>
          <Text style={{ color: theme.text, fontWeight: '600', fontSize: 13 }}>← Back to Albums</Text>
        </TouchableOpacity>

        <View style={[styles.albumHeaderCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>💿</Text>
          <Text style={[styles.albumHeaderTitle, { color: theme.text }]}>{albumObj.name}</Text>
          <Text style={[styles.albumHeaderSub, { color: theme.subText }]}>
            {albumObj.songs.length} {albumObj.songs.length === 1 ? 'Song' : 'Songs'}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.subText }]}>TRACKS</Text>
        <FlatList
          data={albumObj.songs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.songCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              activeOpacity={0.7}
              onPress={() => onSelectSong(item)}>
              <Text style={[styles.trackIndex, { color: theme.subText }]}>{index + 1}</Text>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.songTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.songSub, { color: theme.subText }]}>{item.author}</Text>
              </View>
              <Text style={[styles.tag, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0', color: theme.text }]}>
                {item.style}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchBox}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
          placeholder="Search albums..."
          placeholderTextColor={theme.subText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={albumsList}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.subText }]}>No albums found.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.albumCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            activeOpacity={0.7}
            onPress={() => setSelectedAlbum(item.name)}>
            <View style={[styles.albumCover, { backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F5FF' }]}>
              <Text style={{ fontSize: 24 }}>💿</Text>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 12 }}>
              <Text style={[styles.albumTitle, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.albumSub, { color: theme.subText }]}>
                {item.songs.length} {item.songs.length === 1 ? 'song' : 'songs'}
                {item.artists.length > 0 ? ` • ${item.artists.slice(0, 2).join(', ')}` : ''}
              </Text>
            </View>
            <Text style={{ color: theme.subText, fontSize: 16 }}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 },
  searchInput: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, borderWidth: 1 },
  albumCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  albumCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumTitle: { fontSize: 16, fontWeight: '700' },
  albumSub: { fontSize: 13, marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 15 },
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  albumHeaderCard: {
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  albumHeaderTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  albumHeaderSub: { fontSize: 13, marginTop: 4 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.1, marginBottom: 8 },
  songCard: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  trackIndex: { fontSize: 13, fontWeight: '700', width: 24 },
  songTitle: { fontSize: 15, fontWeight: '700' },
  songSub: { fontSize: 12, marginTop: 2 },
  tag: { fontSize: 10, fontWeight: '600', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, textTransform: 'uppercase' },
});

export default AlbumsScreen;

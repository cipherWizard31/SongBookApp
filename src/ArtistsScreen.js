import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export const ArtistsScreen = ({ songs, onSelectSong, theme, isDarkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);

  // Group songs by artist / author
  const artistMap = {};
  songs.forEach((song) => {
    const artistName = song.author?.trim() || 'Unknown Artist';
    if (!artistMap[artistName]) {
      artistMap[artistName] = [];
    }
    artistMap[artistName].push(song);
  });

  const artistsList = Object.keys(artistMap)
    .map((name) => ({
      name,
      songs: artistMap[name],
      albums: Array.from(new Set(artistMap[name].map((s) => s.album).filter(Boolean))),
    }))
    .filter((artist) => artist.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Selected Artist Song List View
  if (selectedArtist) {
    const artistObj = artistsList.find((a) => a.name === selectedArtist) || {
      name: selectedArtist,
      songs: artistMap[selectedArtist] || [],
      albums: [],
    };

    return (
      <View style={{ flex: 1, padding: 16 }}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
          onPress={() => setSelectedArtist(null)}>
          <Text style={{ color: theme.text, fontWeight: '600', fontSize: 13 }}>← Back to Artists</Text>
        </TouchableOpacity>

        <View style={[styles.artistHeaderCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: isDarkMode ? '#2C2C2C' : '#E8EEFF' }]}>
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
          <Text style={[styles.artistHeaderTitle, { color: theme.text }]}>{artistObj.name}</Text>
          <Text style={[styles.artistHeaderSub, { color: theme.subText }]}>
            {artistObj.songs.length} {artistObj.songs.length === 1 ? 'Song' : 'Songs'}
            {artistObj.albums.length > 0 ? ` • ${artistObj.albums.length} ${artistObj.albums.length === 1 ? 'Album' : 'Albums'}` : ''}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.subText }]}>DISCOGRAPHY</Text>
        <FlatList
          data={artistObj.songs}
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
                <Text style={[styles.songSub, { color: theme.subText }]}>
                  {item.album ? `Album: ${item.album}` : item.style}
                </Text>
              </View>
              <Text style={[styles.tag, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0', color: theme.text }]}>
                {item.scale}
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
          placeholder="Search artists..."
          placeholderTextColor={theme.subText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={artistsList}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.subText }]}>No artists found.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.artistCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            activeOpacity={0.7}
            onPress={() => setSelectedArtist(item.name)}>
            <View style={[styles.artistAvatar, { backgroundColor: isDarkMode ? '#2C2C2C' : '#E8EEFF' }]}>
              <Text style={{ fontSize: 22 }}>👤</Text>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 12 }}>
              <Text style={[styles.artistTitle, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.artistSub, { color: theme.subText }]}>
                {item.songs.length} {item.songs.length === 1 ? 'song' : 'songs'}
                {item.albums.length > 0 ? ` • ${item.albums.slice(0, 2).join(', ')}` : ''}
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
  artistCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  artistAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistTitle: { fontSize: 16, fontWeight: '700' },
  artistSub: { fontSize: 13, marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 15 },
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  artistHeaderCard: {
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  artistHeaderTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  artistHeaderSub: { fontSize: 13, marginTop: 4 },
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

export default ArtistsScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AlbumsScreen } from './AlbumsScreen';
import { ArtistsScreen } from './ArtistsScreen';
import { SettingsScreen } from './SettingsScreen';
import { SongsScreen } from './SongsScreen';

export const ProfileScreen = ({
  songs = [],
  setlists = [],
  styles: rhythmStyles = [],
  scales = [],
  setSongs,
  setStyles,
  setScales,
  onSelectSong,
  onOpenNewSongModal,
  onClearImportedSongs,
  onClearImportedSetlists,
  onClearAllImportedData,
  onDeleteSong,
  handleExportSongs,
  handleImportSongs,
  isDarkMode,
  setIsDarkMode,
  theme,
}) => {
  const [activeSubTab, setActiveSubTab] = useState('songs');

  // Count unique albums and artists
  const uniqueAlbums = Array.from(new Set(songs.map((s) => s.album).filter(Boolean)));
  const uniqueArtists = Array.from(new Set(songs.map((s) => s.author).filter(Boolean)));

  return (
    <View style={[st.container, { backgroundColor: theme.bg }]}>

      {/* ── PROFILE HEADER BANNER ── */}
      <View style={[st.profileHeader, { backgroundColor: theme.secondaryBg, borderBottomColor: theme.border }]}>
        <View style={st.profileInfoRow}>
          <View style={[st.avatarTile, { backgroundColor: theme.cardBg, borderColor: theme.tint }]}>
            <Ionicons name="person" size={28} color={theme.tint} />
          </View>

          <View style={st.profileTextWrap}>
            <Text style={[st.profileName, { color: theme.text }]}>Worship Musician</Text>
            <Text style={[st.profileRole, { color: theme.subText }]}>
              Sanctuary Director • Selah Kignit
            </Text>
          </View>
        </View>

        {/* Quick Library Counter Pills */}
        <View style={st.statsRow}>
          <TouchableOpacity
            style={[st.statPill, activeSubTab === 'songs' && { borderColor: theme.tint, backgroundColor: theme.cardBg }]}
            onPress={() => setActiveSubTab('songs')}>
            <Text style={[st.statValue, { color: theme.text }]}>{songs.length}</Text>
            <Text style={[st.statLabel, { color: theme.subText }]}>Songs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[st.statPill, activeSubTab === 'albums' && { borderColor: theme.tint, backgroundColor: theme.cardBg }]}
            onPress={() => setActiveSubTab('albums')}>
            <Text style={[st.statValue, { color: theme.text }]}>{uniqueAlbums.length}</Text>
            <Text style={[st.statLabel, { color: theme.subText }]}>Albums</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[st.statPill, activeSubTab === 'artists' && { borderColor: theme.tint, backgroundColor: theme.cardBg }]}
            onPress={() => setActiveSubTab('artists')}>
            <Text style={[st.statValue, { color: theme.text }]}>{uniqueArtists.length}</Text>
            <Text style={[st.statLabel, { color: theme.subText }]}>Artists</Text>
          </TouchableOpacity>
        </View>

        {/* Segmented Sub-Tab Switcher */}
        <View style={[st.subTabSegment, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[st.subTabBtn, activeSubTab === 'songs' && { backgroundColor: theme.tint }]}
            onPress={() => setActiveSubTab('songs')}>
            <Text style={[st.subTabBtnText, { color: activeSubTab === 'songs' ? (theme.fabText || '#101319') : theme.subText }]}>
              Songs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[st.subTabBtn, activeSubTab === 'albums' && { backgroundColor: theme.tint }]}
            onPress={() => setActiveSubTab('albums')}>
            <Text style={[st.subTabBtnText, { color: activeSubTab === 'albums' ? (theme.fabText || '#101319') : theme.subText }]}>
              Albums
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[st.subTabBtn, activeSubTab === 'artists' && { backgroundColor: theme.tint }]}
            onPress={() => setActiveSubTab('artists')}>
            <Text style={[st.subTabBtnText, { color: activeSubTab === 'artists' ? (theme.fabText || '#101319') : theme.subText }]}>
              Artists
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[st.subTabBtn, activeSubTab === 'settings' && { backgroundColor: theme.tint }]}
            onPress={() => setActiveSubTab('settings')}>
            <Text style={[st.subTabBtnText, { color: activeSubTab === 'settings' ? (theme.fabText || '#101319') : theme.subText }]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── TAB CONTENT ── */}
      <View style={st.contentArea}>
        {activeSubTab === 'songs' && (
          <SongsScreen
            songs={songs}
            styles={rhythmStyles}
            scales={scales}
            onSelectSong={onSelectSong}
            onOpenNewSongModal={onOpenNewSongModal}
            onClearImportedSongs={onClearImportedSongs}
            onDeleteSong={onDeleteSong}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        )}

        {activeSubTab === 'albums' && (
          <AlbumsScreen
            songs={songs}
            onSelectSong={onSelectSong}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        )}

        {activeSubTab === 'artists' && (
          <ArtistsScreen
            songs={songs}
            onSelectSong={onSelectSong}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        )}

        {activeSubTab === 'settings' && (
          <SettingsScreen
            songs={songs}
            setSongs={setSongs}
            setlists={setlists}
            styles={rhythmStyles}
            setStyles={setStyles}
            scales={scales}
            setScales={setScales}
            handleExportSongs={handleExportSongs}
            handleImportSongs={handleImportSongs}
            handleClearImportedSetlists={handleClearImportedSetlists}
            handleClearImportedSongs={onClearImportedSongs}
            handleClearAllImportedData={onClearAllImportedData}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            theme={theme}
          />
        )}
      </View>
    </View>
  );
};

const st = StyleSheet.create({
  container: { flex: 1 },

  profileHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 14,
  },
  avatarTile: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTextWrap: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  profileRole: {
    fontSize: 13,
    marginTop: 2,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statPill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 1,
  },

  // Sub Tab Segment
  subTabSegment: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTabBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },

  contentArea: {
    flex: 1,
  },
});

export default ProfileScreen;

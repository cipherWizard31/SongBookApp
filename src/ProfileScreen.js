import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AlbumsScreen } from './AlbumsScreen';
import { ArtistsScreen } from './ArtistsScreen';
import { SettingsScreen } from './SettingsScreen';
import { FavouritesScreen } from './FavouritesScreen';

const AMBER = '#E5A93C';
const CYAN = '#38BDF8';

export const ProfileScreen = ({
  songs = [],
  setlists = [],
  styles: rhythmStyles = [],
  scales = [],
  setSongs,
  setStyles,
  setScales,
  onSelectSong,
  onToggleFavorite,
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
  const [activeSubTab, setActiveSubTab] = useState('favourites');

  // Compute unique metrics
  const favouriteSongs = songs.filter((s) => s.isFavorite);
  const uniqueAlbums = Array.from(new Set(songs.map((s) => s.album).filter(Boolean)));
  const uniqueArtists = Array.from(new Set(songs.map((s) => s.author).filter(Boolean)));

  const subTabs = [
    { id: 'favourites', label: 'Favourites', icon: 'star' },
    { id: 'albums', label: 'Albums', icon: 'albums' },
    { id: 'artists', label: 'Artists', icon: 'people' },
    { id: 'settings', label: 'Settings', icon: 'settings-sharp' },
  ];

  return (
    <View style={[st.container, { backgroundColor: theme.bg }]}>

      {/* ── PROFILE HERO HEADER ── */}
      <View style={[st.profileHeader, { backgroundColor: theme.cardBg, borderBottomColor: theme.divider }]}>
        <View style={st.profileInfoRow}>
          <View style={[st.avatarRing, { borderColor: AMBER, backgroundColor: `${AMBER}15` }]}>
            <Ionicons name="person-circle-sharp" size={48} color={AMBER} />
          </View>

          <View style={st.profileTextWrap}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[st.profileName, { color: theme.text }]}>Worship Musician</Text>
              <Ionicons name="checkmark-circle" size={16} color={AMBER} />
            </View>
            <Text style={[st.profileRole, { color: theme.subText }]}>
              Sanctuary Director • Selah Kignit
            </Text>
          </View>
        </View>

        {/* ── STATS OVERVIEW CARDS ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.statsGrid}
          style={{ marginBottom: 16 }}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              st.statCard,
              { backgroundColor: theme.secondaryBg, borderColor: activeSubTab === 'favourites' ? AMBER : theme.border },
            ]}
            onPress={() => setActiveSubTab('favourites')}>
            <Ionicons name="star" size={16} color={AMBER} style={{ marginBottom: 4 }} />
            <Text style={[st.statValue, { color: theme.text }]}>{favouriteSongs.length}</Text>
            <Text style={[st.statLabel, { color: theme.subText }]} numberOfLines={1}>Favourites</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              st.statCard,
              { backgroundColor: theme.secondaryBg, borderColor: activeSubTab === 'albums' ? AMBER : theme.border },
            ]}
            onPress={() => setActiveSubTab('albums')}>
            <Ionicons name="albums-outline" size={16} color={CYAN} style={{ marginBottom: 4 }} />
            <Text style={[st.statValue, { color: theme.text }]}>{uniqueAlbums.length}</Text>
            <Text style={[st.statLabel, { color: theme.subText }]} numberOfLines={1}>Albums</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              st.statCard,
              { backgroundColor: theme.secondaryBg, borderColor: activeSubTab === 'artists' ? AMBER : theme.border },
            ]}
            onPress={() => setActiveSubTab('artists')}>
            <Ionicons name="people-outline" size={16} color="#A855F7" style={{ marginBottom: 4 }} />
            <Text style={[st.statValue, { color: theme.text }]}>{uniqueArtists.length}</Text>
            <Text style={[st.statLabel, { color: theme.subText }]} numberOfLines={1}>Artists</Text>
          </TouchableOpacity>

          <View style={[st.statCard, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
            <Ionicons name="musical-notes-outline" size={16} color="#60A5FA" style={{ marginBottom: 4 }} />
            <Text style={[st.statValue, { color: theme.text }]}>{songs.length}</Text>
            <Text style={[st.statLabel, { color: theme.subText }]} numberOfLines={1}>Songs</Text>
          </View>

          <View style={[st.statCard, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
            <Ionicons name="list-outline" size={16} color="#34D399" style={{ marginBottom: 4 }} />
            <Text style={[st.statValue, { color: theme.text }]}>{setlists.length}</Text>
            <Text style={[st.statLabel, { color: theme.subText }]} numberOfLines={1}>Setlists</Text>
          </View>
        </ScrollView>

        {/* ── SEGMENTED TAB SWITCHER ── */}
        <View style={[st.subTabSegment, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.8}
                style={[
                  st.subTabBtn,
                  isActive && { backgroundColor: AMBER },
                ]}
                onPress={() => setActiveSubTab(tab.id)}>
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={isActive ? '#1E1909' : theme.subText}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    st.subTabBtnText,
                    { color: isActive ? '#1E1909' : theme.subText, fontWeight: isActive ? '700' : '500' },
                  ]}
                  numberOfLines={1}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── TAB CONTENT ── */}
      <View style={st.contentArea}>
        {activeSubTab === 'favourites' && (
          <FavouritesScreen
            songs={songs}
            onSelectSong={onSelectSong}
            onToggleFavorite={onToggleFavorite}
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
            handleClearImportedSetlists={onClearImportedSetlists}
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
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTextWrap: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  profileRole: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '400',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  statCard: {
    minWidth: 74,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },

  // Sub Tab Segment
  subTabSegment: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  subTabBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTabBtnText: {
    fontSize: 11.5,
  },

  contentArea: {
    flex: 1,
  },
});

export default ProfileScreen;

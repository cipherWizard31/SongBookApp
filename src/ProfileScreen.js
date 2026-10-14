import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  BackHandler,
  TextInput,
  Switch,
  Modal,
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
  profile,
  handleSaveProfile,
  onSelectSong,
  onToggleFavorite,
  onNavigateToScreen,
  onClearImportedSongs,
  onClearImportedSetlists,
  onClearAllImportedData,
  handleExportSongs,
  handleImportSongs,
  isDarkMode,
  setIsDarkMode,
  theme,
}) => {
  // activeSubView: null (shows Profile Hub) | 'favourites' | 'albums' | 'artists' | 'settings'
  const [activeSubView, setActiveSubView] = useState(null);

  // Profile Edit State within Profile Hub
  const [profileName, setProfileName] = useState(profile?.name || 'Worship Musician');
  const [profileRole, setProfileRole] = useState(profile?.role || 'Sanctuary Director • Selah Kignit');
  const [isSaved, setIsSaved] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.name) setProfileName(profile.name);
      if (profile.role) setProfileRole(profile.role);
    }
  }, [profile]);

  // Handle hardware back button inside Profile sub-views
  useEffect(() => {
    const onBackPress = () => {
      if (activeSubView) {
        setActiveSubView(null);
        return true;
      }
      return false;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSub.remove();
  }, [activeSubView]);

  const onSaveProfilePress = () => {
    const updated = {
      name: profileName.trim() || 'Worship Musician',
      role: profileRole.trim() || 'Sanctuary Director • Selah Kignit',
    };
    if (handleSaveProfile) {
      handleSaveProfile(updated);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Compute metrics
  const favouriteSongs = songs.filter((s) => s.isFavorite);
  const uniqueAlbums = Array.from(new Set(songs.map((s) => s.album).filter(Boolean)));
  const uniqueArtists = Array.from(new Set(songs.map((s) => s.author).filter(Boolean)));

  // If a subview (Favourites, Albums, Artists, Settings) is opened:
  if (activeSubView) {
    const subViewTitles = {
      favourites: 'Favourites',
      albums: 'Albums',
      artists: 'Artists',
      settings: 'Settings',
    };

    return (
      <View style={[st.container, { backgroundColor: theme.bg }]}>
        {/* Subview Navigation Header */}
        <View style={[st.subviewHeader, { backgroundColor: theme.cardBg, borderBottomColor: theme.divider }]}>
          <TouchableOpacity
            style={st.subviewBackBtn}
            onPress={() => setActiveSubView(null)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to Profile">
            <Ionicons name="arrow-back" size={22} color={theme.text} />
            <Text style={[st.subviewBackText, { color: theme.text }]}>Profile</Text>
          </TouchableOpacity>
          <Text style={[st.subviewHeaderTitle, { color: theme.text }]}>
            {subViewTitles[activeSubView] || ''}
          </Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={st.contentArea}>
          {activeSubView === 'favourites' && (
            <FavouritesScreen
              songs={songs}
              onSelectSong={onSelectSong}
              onToggleFavorite={onToggleFavorite}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          )}

          {activeSubView === 'albums' && (
            <AlbumsScreen
              songs={songs}
              onSelectSong={onSelectSong}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          )}

          {activeSubView === 'artists' && (
            <ArtistsScreen
              songs={songs}
              onSelectSong={onSelectSong}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          )}

          {activeSubView === 'settings' && (
            <SettingsScreen
              songs={songs}
              setSongs={setSongs}
              setlists={setlists}
              styles={rhythmStyles}
              setStyles={setStyles}
              scales={scales}
              setScales={setScales}
              profile={profile}
              handleSaveProfile={handleSaveProfile}
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
  }

  // ── DEFAULT VIEW: PROFILE HUB ──
  return (
    <ScrollView
      style={[st.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={st.hubScrollContent}
      showsVerticalScrollIndicator={false}>

      {/* ── PROFILE HERO HEADER ── */}
      <View style={[st.heroCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={st.profileInfoRow}>
          <View style={[st.avatarRing, { borderColor: AMBER, backgroundColor: `${AMBER}15` }]}>
            <Ionicons name="person-circle-sharp" size={54} color={AMBER} />
          </View>

          <View style={st.profileTextWrap}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[st.profileName, { color: theme.text }]}>
                {profile?.name || 'Worship Musician'}
              </Text>
              <Ionicons name="checkmark-circle" size={16} color={AMBER} />
            </View>
            <Text style={[st.profileRole, { color: theme.subText }]}>
              {profile?.role || 'Sanctuary Director • Selah Kignit'}
            </Text>
          </View>
        </View>

        {/* ── STATS COUNTER STRIP ── */}
        <View style={[st.statsStrip, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
          <View style={st.statItem}>
            <Text style={[st.statVal, { color: theme.text }]}>{songs.length}</Text>
            <Text style={[st.statLbl, { color: theme.subText }]}>Songs</Text>
          </View>
          <View style={[st.statDivider, { backgroundColor: theme.divider }]} />
          <View style={st.statItem}>
            <Text style={[st.statVal, { color: theme.text }]}>{setlists.length}</Text>
            <Text style={[st.statLbl, { color: theme.subText }]}>Setlists</Text>
          </View>
          <View style={[st.statDivider, { backgroundColor: theme.divider }]} />
          <View style={st.statItem}>
            <Text style={[st.statVal, { color: theme.text }]}>{favouriteSongs.length}</Text>
            <Text style={[st.statLbl, { color: theme.subText }]}>Favourites</Text>
          </View>
        </View>
      </View>

      {/* ── SECTION: LIBRARY HUBS / BUTTONS ── */}
      <Text style={[st.sectionHeaderLabel, { color: theme.subText }]}>LIBRARY & COLLECTIONS</Text>
      <View style={[st.menuCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        {/* Favourites Button */}
        <TouchableOpacity
          style={st.menuRow}
          activeOpacity={0.7}
          onPress={() => setActiveSubView('favourites')}>
          <View style={[st.menuIconTile, { backgroundColor: `${AMBER}18` }]}>
            <Ionicons name="star" size={20} color={AMBER} />
          </View>
          <View style={st.menuTextCol}>
            <Text style={[st.menuTitle, { color: theme.text }]}>Favourites</Text>
            <Text style={[st.menuSubtitle, { color: theme.subText }]}>
              {favouriteSongs.length} {favouriteSongs.length === 1 ? 'starred song' : 'starred songs'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.subText} />
        </TouchableOpacity>

        <View style={[st.rowSeparator, { backgroundColor: theme.divider }]} />

        {/* Albums Button */}
        <TouchableOpacity
          style={st.menuRow}
          activeOpacity={0.7}
          onPress={() => setActiveSubView('albums')}>
          <View style={[st.menuIconTile, { backgroundColor: `${CYAN}18` }]}>
            <Ionicons name="albums" size={20} color={CYAN} />
          </View>
          <View style={st.menuTextCol}>
            <Text style={[st.menuTitle, { color: theme.text }]}>Albums</Text>
            <Text style={[st.menuSubtitle, { color: theme.subText }]}>
              {uniqueAlbums.length} {uniqueAlbums.length === 1 ? 'collection' : 'collections'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.subText} />
        </TouchableOpacity>

        <View style={[st.rowSeparator, { backgroundColor: theme.divider }]} />

        {/* Artists Button */}
        <TouchableOpacity
          style={st.menuRow}
          activeOpacity={0.7}
          onPress={() => setActiveSubView('artists')}>
          <View style={[st.menuIconTile, { backgroundColor: 'rgba(168, 85, 247, 0.18)' }]}>
            <Ionicons name="people" size={20} color="#A855F7" />
          </View>
          <View style={st.menuTextCol}>
            <Text style={[st.menuTitle, { color: theme.text }]}>Artists</Text>
            <Text style={[st.menuSubtitle, { color: theme.subText }]}>
              {uniqueArtists.length} {uniqueArtists.length === 1 ? 'author & artist' : 'authors & artists'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.subText} />
        </TouchableOpacity>
      </View>

      {/* ── SECTION: APP SETTINGS BUTTON ── */}
      <Text style={[st.sectionHeaderLabel, { color: theme.subText }]}>APP PREFERENCES</Text>
      <View style={[st.menuCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <TouchableOpacity
          style={st.menuRow}
          activeOpacity={0.7}
          onPress={() => setActiveSubView('settings')}>
          <View style={[st.menuIconTile, { backgroundColor: 'rgba(96, 165, 250, 0.18)' }]}>
            <Ionicons name="settings-sharp" size={20} color="#60A5FA" />
          </View>
          <View style={st.menuTextCol}>
            <Text style={[st.menuTitle, { color: theme.text }]}>Settings & Data</Text>
            <Text style={[st.menuSubtitle, { color: theme.subText }]}>
              Theme, Backup/Export, Import, and Database
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.subText} />
        </TouchableOpacity>
      </View>

      {/* ── SECTION: EDIT PROFILE DETAILS ── */}
      <Text style={[st.sectionHeaderLabel, { color: theme.subText }]}>EDIT MUSICIAN IDENTITY</Text>
      <View style={[st.menuCard, { backgroundColor: theme.cardBg, borderColor: theme.border, padding: 16 }]}>
        <View style={st.inputWrap}>
          <Text style={[st.inputLabel, { color: theme.subText }]}>Display Name</Text>
          <TextInput
            style={[st.inputField, { color: theme.text, backgroundColor: theme.secondaryBg, borderColor: theme.border }]}
            value={profileName}
            onChangeText={setProfileName}
            placeholder="e.g. Worship Musician"
            placeholderTextColor={theme.subText}
          />
        </View>

        <View style={[st.inputWrap, { marginTop: 12 }]}>
          <Text style={[st.inputLabel, { color: theme.subText }]}>Ministry Role & Title</Text>
          <TextInput
            style={[st.inputField, { color: theme.text, backgroundColor: theme.secondaryBg, borderColor: theme.border }]}
            value={profileRole}
            onChangeText={setProfileRole}
            placeholder="e.g. Sanctuary Director • Selah Kignit"
            placeholderTextColor={theme.subText}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[st.saveProfileBtn, { backgroundColor: isSaved ? '#10B981' : AMBER }]}
          onPress={onSaveProfilePress}>
          <Ionicons
            name={isSaved ? 'checkmark-circle' : 'save-outline'}
            size={16}
            color="#1E1909"
            style={{ marginRight: 6 }}
          />
          <Text style={st.saveProfileBtnText}>
            {isSaved ? 'Profile Saved Locally!' : 'Save Profile Changes'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const st = StyleSheet.create({
  container: { flex: 1 },

  // Subview Header
  subviewHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subviewBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 10,
    gap: 4,
  },
  subviewBackText: {
    fontSize: 15,
    fontWeight: '600',
  },
  subviewHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  contentArea: {
    flex: 1,
  },

  // Profile Hub Scroll Content
  hubScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 72,
  },

  // Hero Card
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
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

  // Stats Strip
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLbl: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
  },

  // Section Headers
  sectionHeaderLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Menu List Cards
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 70,
  },

  // Edit Profile Form
  inputWrap: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  saveProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    marginTop: 14,
  },
  saveProfileBtnText: {
    color: '#1E1909',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ProfileScreen;

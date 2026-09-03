import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const DashboardScreen = ({
  songs = [],
  setlists = [],
  scales = [],
  styles: rhythmStyles = [],
  onSelectSong,
  onOpenNewSongModal,
  onNavigateToScreen,
  theme,
  isDarkMode,
}) => {
  // Recent songs (top 5)
  const recentSongs = songs.slice(0, 5);

  // Recent setlists (top 4)
  const recentSetlists = setlists.slice(0, 4);

  // Active setlist (first available setlist)
  const activeSetlist = setlists.length > 0 ? setlists[0] : null;

  // Resolve actual song objects inside active setlist
  let activeSetlistSongs = [];
  if (activeSetlist) {
    if (activeSetlist.songs && Array.isArray(activeSetlist.songs)) {
      activeSetlistSongs = activeSetlist.songs;
    } else if (activeSetlist.songIds && Array.isArray(activeSetlist.songIds)) {
      activeSetlistSongs = activeSetlist.songIds
        .map((id) => songs.find((s) => s.id === id))
        .filter(Boolean);
    }
  }

  // Time-aware greeting generator
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { main: 'መልካም ጧት', sub: 'Good Morning ☀️' };
    if (hour < 17) return { main: 'መልካም ቀን', sub: 'Good Afternoon 🌤️' };
    return { main: 'መልካም ምሽት', sub: 'Good Evening 🌙' };
  };
  const greeting = getGreeting();

  return (
    <ScrollView
      style={[st.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={st.contentPadding}
      showsVerticalScrollIndicator={false}>

      {/* ── TOP GREETING HEADER ── */}
      <View style={st.greetingHeader}>
        <View>
          <Text style={[st.greetingSub, { color: theme.subText }]}>
            {greeting.main} • {greeting.sub}
          </Text>
          <Text style={[st.greetingTitle, { color: theme.text }]}>
            Selah Kignit
          </Text>
        </View>
        <TouchableOpacity
          style={[st.quickAddHeaderBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
          onPress={onOpenNewSongModal}
          activeOpacity={0.7}>
          <Ionicons name="add" size={22} color={theme.tint} />
        </TouchableOpacity>
      </View>

      {/* ── HERO BANNER: Active Setlist OR Empty Banner State ── */}
      {activeSetlist ? (
        /* Active Setlist Banner */
        <View style={[st.heroCard, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
          <View style={st.heroHeaderRow}>
            <View style={st.heroBadgePill}>
              <View style={st.pulsingDot} />
              <Text style={st.heroBadgeText}>ACTIVE SETLIST</Text>
            </View>
            <Text style={[st.heroDateText, { color: theme.subText }]}>
              {activeSetlist.description || 'Sunday Worship'}
            </Text>
          </View>

          <Text style={[st.heroTitle, { color: theme.text }]} numberOfLines={1}>
            {activeSetlist.title}
          </Text>
          <Text style={[st.heroSubtitle, { color: theme.subText }]} numberOfLines={1}>
            {activeSetlistSongs.length > 0
              ? `${activeSetlistSongs.length} Songs • Prepared for Worship`
              : 'Sanctuary Team A • Main Worship'}
          </Text>

          {/* Songs Preview List */}
          {activeSetlistSongs.length > 0 && (
            <View style={[st.heroSongPreviewBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              {activeSetlistSongs.slice(0, 3).map((song, idx) => (
                <TouchableOpacity
                  key={song.id || `setlist-s-${idx}`}
                  style={[
                    st.heroSongRow,
                    idx === Math.min(activeSetlistSongs.length, 3) - 1 && { borderBottomWidth: 0 },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => onSelectSong(song)}>
                  <Text style={[st.heroSongNum, { color: theme.tint }]}>0{idx + 1}</Text>
                  <Text style={[st.heroSongTitle, { color: theme.text }]} numberOfLines={1}>
                    {song.title}
                  </Text>
                  {song.scale && song.scale !== 'Uncategorized' ? (
                    <View style={[st.heroScaleBadge, { borderColor: theme.border }]}>
                      <Text style={[st.heroScaleText, { color: theme.tint }]}>{song.scale}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              ))}
              {activeSetlistSongs.length > 3 && (
                <Text style={[st.moreSongsText, { color: theme.subText }]}>
                  + {activeSetlistSongs.length - 3} more songs in setlist
                </Text>
              )}
            </View>
          )}

          {/* Start Service Button */}
          <TouchableOpacity
            style={[st.startServiceBtn, { backgroundColor: theme.tint }]}
            onPress={() => onNavigateToScreen('setlists')}
            activeOpacity={0.85}>
            <Ionicons name="play" size={18} color={theme.fabText || '#101319'} />
            <Text style={[st.startServiceBtnText, { color: theme.fabText || '#101319' }]}>
              Start Worship Service
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Empty Setlist Banner State */
        <View style={[st.heroCard, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
          <View style={st.heroHeaderRow}>
            <View style={[st.heroBadgePill, { backgroundColor: 'rgba(148, 163, 184, 0.15)' }]}>
              <Ionicons name="calendar-outline" size={12} color={theme.subText} style={{ marginRight: 4 }} />
              <Text style={[st.heroBadgeText, { color: theme.subText }]}>NO UPCOMING SETLIST</Text>
            </View>
            <Text style={[st.heroDateText, { color: theme.subText }]}>Worship Schedule</Text>
          </View>

          <View style={st.emptyBannerContent}>
            <View style={[st.emptyIconCircle, { backgroundColor: theme.cardBg }]}>
              <Ionicons name="list-outline" size={28} color={theme.tint} />
            </View>
            <Text style={[st.emptyHeroTitle, { color: theme.text }]}>
              No Setlist Scheduled
            </Text>
            <Text style={[st.emptyHeroSub, { color: theme.subText }]}>
              Create your first setlist for upcoming worship services to organize songs and chords.
            </Text>

            <TouchableOpacity
              style={[st.startServiceBtn, { backgroundColor: theme.tint }]}
              onPress={() => onNavigateToScreen('setlists')}
              activeOpacity={0.85}>
              <Ionicons name="add" size={20} color={theme.fabText || '#101319'} />
              <Text style={[st.startServiceBtnText, { color: theme.fabText || '#101319' }]}>
                Create New Setlist
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── QUICK ACTION SHORTCUTS ── */}
      <View style={st.quickActionsRow}>
        <TouchableOpacity
          style={[st.actionBtnOutline, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
          onPress={() => onNavigateToScreen('songs')}
          activeOpacity={0.7}>
          <Ionicons name="library-outline" size={18} color={theme.text} />
          <Text style={[st.actionBtnOutlineText, { color: theme.text }]}>Song Library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[st.actionBtnOutline, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
          onPress={() => onNavigateToScreen('dictionary')}
          activeOpacity={0.7}>
          <Ionicons name="book-outline" size={18} color={theme.text} />
          <Text style={[st.actionBtnOutlineText, { color: theme.text }]}>Kignit Scales</Text>
        </TouchableOpacity>
      </View>

      {/* ── RECENT SONGS LIST ── */}
      <View style={st.sectionBlock}>
        <View style={st.sectionHeader}>
          <Text style={[st.sectionTitle, { color: theme.text }]}>Recent Songs</Text>
          <TouchableOpacity onPress={() => onNavigateToScreen('songs')}>
            <Text style={[st.seeAllLink, { color: theme.tint }]}>View All ({songs.length}) →</Text>
          </TouchableOpacity>
        </View>

        {recentSongs.length === 0 ? (
          <View style={[st.emptyBox, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
            <Ionicons name="musical-notes-outline" size={24} color={theme.subText} />
            <Text style={[st.emptyText, { color: theme.subText }]}>No songs in library yet.</Text>
          </View>
        ) : (
          recentSongs.map((item) => {
            const author = item.author?.trim();
            const album = item.album?.trim();
            const hasScale = item.scale && item.scale !== 'Uncategorized';
            const hasStyle = item.style && item.style !== 'Uncategorized';

            return (
              <TouchableOpacity
                key={item.id}
                style={[st.recentSongCard, { backgroundColor: theme.secondaryBg, borderColor: theme.divider }]}
                activeOpacity={0.7}
                onPress={() => onSelectSong(item)}>

                {/* Left Avatar Tile */}
                <View style={[st.songAvatarTile, { backgroundColor: theme.cardBg }]}>
                  <Ionicons name="musical-notes" size={18} color={theme.tint} />
                </View>

                {/* Main Song Metadata */}
                <View style={st.songMainInfo}>
                  <Text style={[st.recentTitle, { color: theme.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {(author || album) ? (
                    <Text style={[st.recentSubtitle, { color: theme.subText }]} numberOfLines={1}>
                      {[author, album].filter(Boolean).join('  •  ')}
                    </Text>
                  ) : null}

                  {/* Kignit Scale & Style Tags */}
                  {(hasScale || hasStyle) ? (
                    <View style={st.recentTagsRow}>
                      {hasScale && (
                        <View style={[st.recentTagPill, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                          <Text style={[st.recentTagText, { color: theme.chord || theme.tint }]}>
                            {item.scale}
                          </Text>
                        </View>
                      )}
                      {hasStyle && (
                        <View style={[st.recentTagPill, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                          <Text style={[st.recentTagText, { color: theme.subText }]}>
                            {item.style}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : null}
                </View>

                <Ionicons name="chevron-forward" size={18} color={theme.subText} />
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* ── RECENT SETLISTS LIST ── */}
      <View style={st.sectionBlock}>
        <View style={st.sectionHeader}>
          <Text style={[st.sectionTitle, { color: theme.text }]}>Recent Setlists</Text>
          <TouchableOpacity onPress={() => onNavigateToScreen('setlists')}>
            <Text style={[st.seeAllLink, { color: theme.tint }]}>View All ({setlists.length}) →</Text>
          </TouchableOpacity>
        </View>

        {recentSetlists.length === 0 ? (
          <View style={[st.emptyBox, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
            <Ionicons name="list-outline" size={24} color={theme.subText} />
            <Text style={[st.emptyText, { color: theme.subText }]}>No setlists created yet.</Text>
          </View>
        ) : (
          recentSetlists.map((setlist) => {
            const songCount = setlist.songs?.length || setlist.songIds?.length || 0;
            return (
              <TouchableOpacity
                key={setlist.id}
                style={[st.recentSongCard, { backgroundColor: theme.secondaryBg, borderColor: theme.divider }]}
                activeOpacity={0.7}
                onPress={() => onNavigateToScreen('setlists')}>

                {/* Left Icon Tile */}
                <View style={[st.songAvatarTile, { backgroundColor: theme.cardBg }]}>
                  <Ionicons name="list" size={18} color={theme.tint} />
                </View>

                {/* Setlist Info */}
                <View style={st.songMainInfo}>
                  <Text style={[st.recentTitle, { color: theme.text }]} numberOfLines={1}>
                    {setlist.title}
                  </Text>
                  <Text style={[st.recentSubtitle, { color: theme.subText }]} numberOfLines={1}>
                    {songCount} Songs • {setlist.description || 'Worship Setlist'}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color={theme.subText} />
              </TouchableOpacity>
            );
          })
        )}
      </View>

    </ScrollView>
  );
};

const st = StyleSheet.create({
  container: { flex: 1 },
  contentPadding: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96,
  },

  // Greeting Header
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greetingSub: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  quickAddHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero Worship Card
  heroCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    marginBottom: 16,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5A93C',
    marginRight: 6,
  },
  heroBadgeText: {
    color: '#E5A93C',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  heroDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 6,
  },

  // Empty Banner Content
  emptyBannerContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyHeroTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyHeroSub: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  // Hero Songs Preview Box
  heroSongPreviewBox: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
    marginBottom: 12,
  },
  heroSongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  heroSongNum: {
    fontSize: 11,
    fontWeight: '700',
    width: 22,
  },
  heroSongTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  heroScaleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    marginLeft: 8,
  },
  heroScaleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreSongsText: {
    fontSize: 11,
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Start Service CTA Button
  startServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 20,
    marginTop: 6,
    gap: 8,
    shadowColor: '#E5A93C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  startServiceBtnText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Quick Action Buttons
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  actionBtnOutline: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  actionBtnOutlineText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Section Layouts
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Recent Song Card
  recentSongCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
    gap: 12,
  },
  songAvatarTile: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songMainInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  recentSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  recentTagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  recentTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  recentTagText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Empty Box
  emptyBox: {
    padding: 24,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
  },
});

export default DashboardScreen;

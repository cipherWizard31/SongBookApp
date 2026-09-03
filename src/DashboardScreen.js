import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
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
  // Recent songs (first 4 or top songs)
  const recentSongs = songs.slice(0, 5);

  // Active setlist (first setlist or default)
  const activeSetlist = setlists.length > 0 ? setlists[0] : null;

  return (
    <ScrollView
      style={[st.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={st.contentPadding}
      showsVerticalScrollIndicator={false}>

      {/* ── HERO BANNER: Worship Service Roster Card ── */}
      <View style={[st.heroCard, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
        <View style={st.heroHeaderRow}>
          <View style={st.heroBadgePill}>
            <View style={st.pulsingDot} />
            <Text style={st.heroBadgeText}>LIVE SERVICE ROSTER</Text>
          </View>
          <Text style={[st.heroDateText, { color: theme.subText }]}>Sunday Worship</Text>
        </View>

        <Text style={[st.heroTitle, { color: theme.text }]}>የእሁድ ፕሮግራም</Text>
        <Text style={[st.heroSubtitle, { color: theme.subText }]}>
          Sanctuary Team A • Main Sanctuary Worship
        </Text>

        {/* Hero Quick Stats Row */}
        <View style={st.heroStatsRow}>
          <View style={[st.heroStatItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Ionicons name="musical-notes-outline" size={16} color={theme.tint} />
            <Text style={[st.heroStatVal, { color: theme.text }]}>{songs.length}</Text>
            <Text style={[st.heroStatLbl, { color: theme.subText }]}>Total Songs</Text>
          </View>

          <View style={[st.heroStatItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Ionicons name="list-outline" size={16} color={theme.tint} />
            <Text style={[st.heroStatVal, { color: theme.text }]}>{setlists.length}</Text>
            <Text style={[st.heroStatLbl, { color: theme.subText }]}>Setlists</Text>
          </View>

          <View style={[st.heroStatItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Ionicons name="key-outline" size={16} color={theme.tint} />
            <Text style={[st.heroStatVal, { color: theme.text }]}>{scales.length - 1}</Text>
            <Text style={[st.heroStatLbl, { color: theme.subText }]}>Kignit Scales</Text>
          </View>
        </View>
      </View>

      {/* ── QUICK ACTION SHORTCUTS ── */}
      <View style={st.quickActionsRow}>
        <TouchableOpacity
          style={[st.actionBtn, { backgroundColor: theme.tint }]}
          onPress={onOpenNewSongModal}
          activeOpacity={0.8}>
          <Ionicons name="add" size={20} color={theme.fabText || '#101319'} />
          <Text style={[st.actionBtnText, { color: theme.fabText || '#101319' }]}>New Song</Text>
        </TouchableOpacity>

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
          <Text style={[st.actionBtnOutlineText, { color: theme.text }]}>Scales</Text>
        </TouchableOpacity>
      </View>

      {/* ── UPCOMING SETLIST PREVIEW ── */}
      {activeSetlist && (
        <View style={st.sectionBlock}>
          <View style={st.sectionHeader}>
            <Text style={[st.sectionTitle, { color: theme.text }]}>Active Worship Setlist</Text>
            <TouchableOpacity onPress={() => onNavigateToScreen('setlists')}>
              <Text style={[st.seeAllLink, { color: theme.tint }]}>View Setlists →</Text>
            </TouchableOpacity>
          </View>

          <View style={[st.setlistCard, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
            <View style={st.setlistTopRow}>
              <View style={[st.setlistIconWrap, { backgroundColor: theme.cardBg }]}>
                <Ionicons name="list" size={20} color={theme.tint} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[st.setlistTitle, { color: theme.text }]} numberOfLines={1}>
                  {activeSetlist.title || 'Sunday Morning Setlist'}
                </Text>
                <Text style={[st.setlistMeta, { color: theme.subText }]}>
                  {activeSetlist.songIds?.length || 0} Songs • Prepared for Worship
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

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

      {/* ── ETHIOPIAN KIGNIT MODAL SCALES QUICK OVERVIEW ── */}
      <View style={st.sectionBlock}>
        <View style={st.sectionHeader}>
          <Text style={[st.sectionTitle, { color: theme.text }]}>Ethiopian Kignit Scales</Text>
          <TouchableOpacity onPress={() => onNavigateToScreen('dictionary')}>
            <Text style={[st.seeAllLink, { color: theme.tint }]}>Dictionary →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.kignitScroll}>
          {[
            { name: 'Tizita Major', desc: 'Pentatonic Major (1-2-3-5-6)' },
            { name: 'Tizita Minor', desc: 'Pentatonic Minor (1-b3-4-5-b7)' },
            { name: 'Bati', desc: 'Lydian Pentatonic (1-3-4#-5-7)' },
            { name: 'Ambassel', desc: 'Phrygian Pentatonic (1-b2-4-5-b6)' },
            { name: 'Anchihoye', desc: 'Diminished Pentatonic (1-b2-4-b5-6)' },
          ].map((k, i) => (
            <TouchableOpacity
              key={`kignit-card-${i}`}
              style={[st.kignitCard, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}
              onPress={() => onNavigateToScreen('dictionary')}>
              <View style={[st.kignitPill, { backgroundColor: theme.cardBg }]}>
                <Ionicons name="pulse" size={12} color={theme.tint} style={{ marginRight: 4 }} />
                <Text style={[st.kignitName, { color: theme.text }]}>{k.name}</Text>
              </View>
              <Text style={[st.kignitDesc, { color: theme.subText }]}>{k.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  heroStatItem: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  heroStatVal: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  heroStatLbl: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },

  // Quick Action Buttons
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
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

  // Active Setlist Card
  setlistCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  setlistTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  setlistIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setlistTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  setlistMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  // Recent Song Card
  recentSongCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
    gap: 12,
  },
  songAvatarTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songMainInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  recentSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  recentTagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
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

  emptyBox: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
  },

  // Kignit Scroll Cards
  kignitScroll: {
    gap: 10,
  },
  kignitCard: {
    width: 170,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  kignitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  kignitName: {
    fontSize: 12,
    fontWeight: '700',
  },
  kignitDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
});

export default DashboardScreen;

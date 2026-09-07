import React, { useState, useEffect } from 'react';
import {
  View, Text, Switch, TouchableOpacity, TextInput,
  StyleSheet, Modal, ScrollView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AMBER = '#E5A93C';
const CYAN = '#38BDF8';

export const SettingsScreen = ({
  theme, isDarkMode, setIsDarkMode, toggleDarkMode,
  handleExportSongs, handleImportSongs,
  handleClearImportedSetlists,
  handleClearImportedSongs,
  handleClearAllImportedData,
  profile = { name: 'Worship Musician', role: 'Sanctuary Director • Selah Kignit' },
  handleSaveProfile,
  songs = [],
  setlists = [],
}) => {
  const [statsVisible, setStatsVisible] = useState(false);
  const onToggle = toggleDarkMode || (() => setIsDarkMode && setIsDarkMode(!isDarkMode));

  const [profileName, setProfileName] = useState(profile?.name || 'Worship Musician');
  const [profileRole, setProfileRole] = useState(profile?.role || 'Sanctuary Director • Selah Kignit');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.name) setProfileName(profile.name);
      if (profile.role) setProfileRole(profile.role);
    }
  }, [profile]);

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

  // Stats
  const totalSongs    = songs.length;
  const totalSetlists = setlists.length;
  const audioLinks    = songs.filter((s) => s.audioUrl || s.audioUri).length;
  const uniqueArtists = new Set(songs.map((s) => s.author?.trim()).filter(Boolean)).size;
  const totalLines    = songs.reduce((n, s) => n + (s.content ? s.content.split('\n').length : 0), 0);

  const importedSongs     = songs.filter((s) => s.isImported || s.title?.includes('(Imported)')).length;
  const importedSetlists  = setlists.filter((s) => s.isImported || s.title?.includes('(Imported)')).length;

  const styleMap = {};
  songs.forEach((s) => { const k = s.style || 'Unspecified'; styleMap[k] = (styleMap[k] || 0) + 1; });
  const styleStats = Object.entries(styleMap).sort((a, b) => b[1] - a[1]);

  const scaleMap = {};
  songs.forEach((s) => { const k = s.scale || 'Unspecified'; scaleMap[k] = (scaleMap[k] || 0) + 1; });
  const scaleStats = Object.entries(scaleMap).sort((a, b) => b[1] - a[1]);

  return (
    <ScrollView
      style={[st.root, { backgroundColor: theme.bg }]}
      contentContainerStyle={st.content}>

      {/* ─── Section: Musician Profile ─── */}
      <Text style={[st.sectionLabel, { color: theme.subText }]}>MUSICIAN PROFILE</Text>
      <View style={[st.group, { backgroundColor: theme.cardBg, borderColor: theme.border, padding: 14 }]}>
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

        <View style={[st.inputWrap, { marginTop: 10 }]}>
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

      {/* ─── Section: Appearance ─── */}
      <Text style={[st.sectionLabel, { color: theme.subText, marginTop: 16 }]}>APPEARANCE</Text>
      <View style={[st.group, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={st.row}>
          <View style={[st.rowIconBox, { backgroundColor: `${AMBER}18` }]}>
            <Ionicons name="moon" size={18} color={AMBER} />
          </View>
          <View style={st.rowLeft}>
            <Text style={[st.rowTitle, { color: theme.text }]}>Dark Mode</Text>
            <Text style={[st.rowSub, { color: theme.subText }]}>Switch interface color theme</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={onToggle}
            trackColor={{ false: '#334155', true: AMBER }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* ─── Section: Library ─── */}
      <Text style={[st.sectionLabel, { color: theme.subText }]}>LIBRARY ANALYTICS</Text>
      <View style={[st.group, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={st.rowPressable}
          onPress={() => setStatsVisible(true)}>
          <View style={[st.rowIconBox, { backgroundColor: `${CYAN}18` }]}>
            <Ionicons name="bar-chart" size={18} color={CYAN} />
          </View>
          <View style={st.rowLeft}>
            <Text style={[st.rowTitle, { color: theme.text }]}>Song Statistics</Text>
            <Text style={[st.rowSub, { color: theme.subText }]}>
              {totalSongs} songs · {uniqueArtists} artists · {audioLinks} audio links
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.subText} />
        </TouchableOpacity>
      </View>

      {/* ─── Section: Backup & Restore ─── */}
      <Text style={[st.sectionLabel, { color: theme.subText }]}>BACKUP & RESTORE</Text>
      <View style={[st.group, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[st.rowPressable, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider }]}
          onPress={handleExportSongs}>
          <View style={[st.rowIconBox, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}>
            <Ionicons name="cloud-upload" size={18} color="#34D399" />
          </View>
          <View style={st.rowLeft}>
            <Text style={[st.rowTitle, { color: theme.text }]}>Export Backup</Text>
            <Text style={[st.rowSub, { color: theme.subText }]}>
              Export full catalog and setlists as JSON
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.subText} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={st.rowPressable}
          onPress={handleImportSongs}>
          <View style={[st.rowIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
            <Ionicons name="cloud-download" size={18} color="#A855F7" />
          </View>
          <View style={st.rowLeft}>
            <Text style={[st.rowTitle, { color: theme.text }]}>Import Backup</Text>
            <Text style={[st.rowSub, { color: theme.subText }]}>
              Restore full library from a backup JSON file
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.subText} />
        </TouchableOpacity>
      </View>

      {/* ─── Section: Imported content (conditional) ─── */}
      {(importedSongs > 0 || importedSetlists > 0) && (
        <>
          <Text style={[st.sectionLabel, { color: theme.subText }]}>IMPORTED DATA MANAGEMENT</Text>
          <Text style={[st.sectionFooter, { color: theme.subText }]}>
            {importedSongs} imported song{importedSongs !== 1 ? 's' : ''} and{' '}
            {importedSetlists} imported setlist{importedSetlists !== 1 ? 's' : ''}
          </Text>
          <View style={[st.group, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            {importedSetlists > 0 && handleClearImportedSetlists && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[st.rowPressable, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider }]}
                onPress={handleClearImportedSetlists}>
                <View style={[st.rowIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </View>
                <View style={st.rowLeft}>
                  <Text style={[st.rowTitle, { color: '#EF4444' }]}>
                    Remove Imported Setlists
                  </Text>
                  <Text style={[st.rowSub, { color: theme.subText }]}>
                    Delete setlists added via import
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {importedSongs > 0 && handleClearImportedSongs && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  st.rowPressable,
                  handleClearAllImportedData && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
                ]}
                onPress={handleClearImportedSongs}>
                <View style={[st.rowIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </View>
                <View style={st.rowLeft}>
                  <Text style={[st.rowTitle, { color: '#EF4444' }]}>
                    Remove Imported Songs
                  </Text>
                  <Text style={[st.rowSub, { color: theme.subText }]}>
                    Delete songs added via import
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {handleClearAllImportedData && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={st.rowPressable}
                onPress={handleClearAllImportedData}>
                <View style={[st.rowIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                  <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
                </View>
                <View style={st.rowLeft}>
                  <Text style={[st.rowTitle, { color: '#EF4444', fontWeight: '600' }]}>
                    Remove All Imported Content
                  </Text>
                  <Text style={[st.rowSub, { color: theme.subText }]}>
                    Deletes all imported songs and setlists at once
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {/* ─── Section: About App ─── */}
      <Text style={[st.sectionLabel, { color: theme.subText, marginTop: 16 }]}>ABOUT APP</Text>
      <View style={[st.group, { backgroundColor: theme.cardBg, borderColor: theme.border, padding: 16, alignItems: 'center' }]}>
        <Text style={[st.appTitle, { color: theme.text }]}>Selah Kignit (ሰላህ ቅኝት)</Text>
        <Text style={[st.appSub, { color: theme.subText, marginTop: 2 }]}>Version 1.0.0 • Sacred Worship Companion</Text>
        <Text style={[st.appDesc, { color: theme.subText, marginTop: 6, textAlign: 'center' }]}>
          Built for sanctuary directors & worship musicians to organize Ethiopian pentatonic chords, lyrics, and setlists.
        </Text>
      </View>

      {/* ─── Statistics Modal ─── */}
      <Modal
        visible={statsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setStatsVisible(false)}>
        <View style={st.sheetOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setStatsVisible(false)}
          />
          <View style={[st.sheetWrap, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={[st.handle, { backgroundColor: theme.border }]} />

            <View style={[st.sheetHeader, { borderBottomColor: theme.divider }]}>
              <Text style={[st.sheetTitle, { color: theme.text }]}>Song Statistics</Text>
              <TouchableOpacity
                style={[st.doneChipBtn, { backgroundColor: AMBER }]}
                onPress={() => setStatsVisible(false)}>
                <Text style={st.doneChipText}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={st.statsContent}>
              <View style={st.statGrid}>
                {[
                  { label: 'Songs', value: totalSongs, icon: 'musical-notes', color: AMBER },
                  { label: 'Setlists', value: totalSetlists, icon: 'list', color: CYAN },
                  { label: 'Artists', value: uniqueArtists, icon: 'people', color: '#A855F7' },
                  { label: 'Audio Links', value: audioLinks, icon: 'volume-high', color: '#34D399' },
                  { label: 'Lyric Lines', value: totalLines, icon: 'document-text', color: '#F43F5E' },
                ].map((item) => (
                  <View key={item.label} style={[st.statCell, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} style={{ marginBottom: 6 }} />
                    <Text style={[st.statValue, { color: theme.text }]}>{item.value}</Text>
                    <Text style={[st.statLabel, { color: theme.subText }]}>{item.label}</Text>
                  </View>
                ))}
              </View>

              {/* Style distribution */}
              {styleStats.length > 0 && (
                <>
                  <Text style={[st.distLabel, { color: theme.text }]}>Style Distribution</Text>
                  {styleStats.map(([name, count]) => {
                    const pct = totalSongs > 0 ? (count / totalSongs) * 100 : 0;
                    return (
                      <View key={name} style={st.barRow}>
                        <View style={st.barMeta}>
                          <Text style={[st.barName, { color: theme.text }]}>{name}</Text>
                          <Text style={[st.barCount, { color: theme.subText }]}>
                            {count} ({Math.round(pct)}%)
                          </Text>
                        </View>
                        <View style={[st.barTrack, { backgroundColor: theme.secondaryBg }]}>
                          <View
                            style={[
                              st.barFill,
                              { width: `${pct}%`, backgroundColor: AMBER },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </>
              )}

              {/* Scale distribution */}
              {scaleStats.length > 0 && (
                <>
                  <Text style={[st.distLabel, { color: theme.text, marginTop: 24 }]}>Scale Distribution</Text>
                  {scaleStats.map(([name, count]) => {
                    const pct = totalSongs > 0 ? (count / totalSongs) * 100 : 0;
                    return (
                      <View key={name} style={st.barRow}>
                        <View style={st.barMeta}>
                          <Text style={[st.barName, { color: theme.text }]}>{name}</Text>
                          <Text style={[st.barCount, { color: theme.subText }]}>
                            {count} ({Math.round(pct)}%)
                          </Text>
                        </View>
                        <View style={[st.barTrack, { backgroundColor: theme.secondaryBg }]}>
                          <View
                            style={[
                              st.barFill,
                              { width: `${pct}%`, backgroundColor: CYAN },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const st = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingVertical: 16, paddingBottom: 48 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sectionFooter: {
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
    paddingHorizontal: 20,
    lineHeight: 17,
  },

  group: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowLeft: { flex: 1, paddingRight: 12 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },

  appTitle: { fontSize: 16, fontWeight: '700' },
  appSub: { fontSize: 12, fontWeight: '500' },
  appDesc: { fontSize: 12.5, lineHeight: 18 },

  inputWrap: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputField: {
    height: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    fontSize: 14.5,
    fontWeight: '500',
  },
  saveProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 10,
    marginTop: 14,
  },
  saveProfileBtnText: {
    color: '#1E1909',
    fontSize: 13.5,
    fontWeight: '700',
  },

  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '88%',
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700' },
  doneChipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
  },
  doneChipText: { color: '#1E1909', fontSize: 13, fontWeight: '700' },

  statsContent: { padding: 18, paddingBottom: Platform.OS === 'ios' ? 36 : 24 },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCell: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '700', lineHeight: 26 },
  statLabel: { fontSize: 12, fontWeight: '500', marginTop: 2 },

  distLabel: { fontSize: 14, fontWeight: '700', marginBottom: 12, letterSpacing: 0.2 },
  barRow: { marginBottom: 12 },
  barMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barName: { fontSize: 13, fontWeight: '600' },
  barCount: { fontSize: 12 },
  barTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
});

export default SettingsScreen;
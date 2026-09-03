import React, { useState } from 'react';
import {
  View, Text, Switch, TouchableOpacity,
  StyleSheet, Modal, ScrollView, Platform,
} from 'react-native';

export const SettingsScreen = ({
  theme, isDarkMode, setIsDarkMode, toggleDarkMode,
  handleExportSongs, handleImportSongs,
  handleClearImportedSetlists,
  handleClearImportedSongs,
  handleClearAllImportedData,
  songs = [],
  setlists = [],
}) => {
  const [statsVisible, setStatsVisible] = useState(false);
  const onToggle = toggleDarkMode || (() => setIsDarkMode && setIsDarkMode(!isDarkMode));

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
      style={[st.root, { backgroundColor: theme.secondaryBg }]}
      contentContainerStyle={st.content}>

      {/* ─── Section: Appearance ─── */}
      <Text style={[st.sectionLabel, { color: theme.subText }]}>Appearance</Text>
      <View style={[st.group, { backgroundColor: theme.bg, borderColor: theme.border }]}>
        <View style={[st.row, { borderBottomColor: theme.divider }]}>
          <View style={st.rowLeft}>
            <Text style={[st.rowTitle, { color: theme.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={onToggle}
            trackColor={{ false: '#C7C7CC', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* ─── Section: Library ─── */}
      <Text style={[st.sectionLabel, { color: theme.subText }]}>Library</Text>
      <View style={[st.group, { backgroundColor: theme.bg, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[st.row, st.rowPressable]}
          onPress={() => setStatsVisible(true)}>
          <View style={st.rowLeft}>
            <Text style={[st.rowTitle, { color: theme.text }]}>Song Statistics</Text>
            <Text style={[st.rowSub, { color: theme.subText }]}>
              {totalSongs} songs · {uniqueArtists} artists · {audioLinks} audio links
            </Text>
          </View>
          <Text style={[st.chevron, { color: theme.subText }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Section: Backup & Restore ─── */}
      <Text style={[st.sectionLabel, { color: theme.subText }]}>Backup & Restore</Text>
      <View style={[st.group, { backgroundColor: theme.bg, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[st.row, st.rowPressable, { borderBottomColor: theme.divider }]}
          onPress={handleExportSongs}>
          <View style={st.rowLeft}>
            <Text style={[st.rowTitle, { color: theme.text }]}>Export Backup</Text>
            <Text style={[st.rowSub, { color: theme.subText }]}>
              Export full catalog and setlists as JSON
            </Text>
          </View>
          <Text style={[st.chevron, { color: theme.subText }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[st.row, st.rowPressable]}
          onPress={handleImportSongs}>
          <View style={st.rowLeft}>
            <Text style={[st.rowTitle, { color: theme.text }]}>Import Backup</Text>
            <Text style={[st.rowSub, { color: theme.subText }]}>
              Restore full library from a backup JSON file
            </Text>
          </View>
          <Text style={[st.chevron, { color: theme.subText }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Section: Imported content (conditional) ─── */}
      {(importedSongs > 0 || importedSetlists > 0) && (
        <>
          <Text style={[st.sectionLabel, { color: theme.subText }]}>Imported Content</Text>
          <Text style={[st.sectionFooter, { color: theme.subText }]}>
            {importedSongs} imported song{importedSongs !== 1 ? 's' : ''} and{' '}
            {importedSetlists} imported setlist{importedSetlists !== 1 ? 's' : ''}
          </Text>
          <View style={[st.group, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            {importedSetlists > 0 && handleClearImportedSetlists && (
              <TouchableOpacity
                style={[st.row, st.rowPressable, { borderBottomColor: theme.divider }]}
                onPress={handleClearImportedSetlists}>
                <View style={st.rowLeft}>
                  <Text style={[st.rowTitle, { color: theme.destructive || '#FF3B30' }]}>
                    Remove Imported Setlists
                  </Text>
                  <Text style={[st.rowSub, { color: theme.subText }]}>
                    Delete only setlists added via import
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {importedSongs > 0 && handleClearImportedSongs && (
              <TouchableOpacity
                style={[
                  st.row, st.rowPressable,
                  handleClearAllImportedData && { borderBottomColor: theme.divider },
                ]}
                onPress={handleClearImportedSongs}>
                <View style={st.rowLeft}>
                  <Text style={[st.rowTitle, { color: theme.destructive || '#FF3B30' }]}>
                    Remove Imported Songs
                  </Text>
                  <Text style={[st.rowSub, { color: theme.subText }]}>
                    Delete only songs added via import
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {handleClearAllImportedData && (
              <TouchableOpacity
                style={[st.row, st.rowPressable]}
                onPress={handleClearAllImportedData}>
                <View style={st.rowLeft}>
                  <Text style={[st.rowTitle, { color: theme.destructive || '#FF3B30', fontWeight: '500' }]}>
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

      {/* ─── Statistics modal ─── */}
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
          <View style={[st.sheetWrap, { backgroundColor: theme.bg }]}>
            <View style={[st.handle, { backgroundColor: theme.border }]} />

            {/* Sheet header */}
            <View style={[st.sheetHeader, { borderBottomColor: theme.divider }]}>
              <Text style={[st.sheetTitle, { color: theme.text }]}>Song Statistics</Text>
              <TouchableOpacity onPress={() => setStatsVisible(false)}>
                <Text style={[st.sheetClose, { color: theme.tint || theme.text }]}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={st.statsContent}>
              {/* Key numbers */}
              <View style={st.statGrid}>
                {[
                  { label: 'Songs', value: totalSongs },
                  { label: 'Setlists', value: totalSetlists },
                  { label: 'Artists', value: uniqueArtists },
                  { label: 'Audio Links', value: audioLinks },
                  { label: 'Lyric Lines', value: totalLines },
                ].map((item) => (
                  <View key={item.label} style={[st.statCell, { backgroundColor: theme.secondaryBg }]}>
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
                              { width: `${pct}%`, backgroundColor: theme.text },
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
                  <Text style={[st.distLabel, { color: theme.text, marginTop: 20 }]}>Scale Distribution</Text>
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
                              { width: `${pct}%`, backgroundColor: theme.subText },
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
  content: { paddingBottom: 48 },

  // HIG Section Label
  sectionLabel: {
    fontSize: 13, fontWeight: '400',
    letterSpacing: -0.08, textTransform: 'uppercase',
    marginTop: 24, marginBottom: 6,
    paddingHorizontal: 20,
  },
  sectionFooter: {
    fontSize: 13, marginTop: -2, marginBottom: 8,
    paddingHorizontal: 20, lineHeight: 18,
  },

  // HIG Inset Grouped Table View
  group: {
    marginHorizontal: 16,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowPressable: { activeOpacity: 0.55 },
  rowLeft: { flex: 1, paddingRight: 12 },
  rowTitle: { fontSize: 17, fontWeight: '400' },
  rowSub: { fontSize: 13, marginTop: 2, lineHeight: 16 },
  chevron: { fontSize: 20, fontWeight: '300' },

  // Stats sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '88%',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginTop: 8, marginBottom: 2,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: { fontSize: 17, fontWeight: '600' },
  sheetClose: { fontSize: 17, fontWeight: '600' },

  // Stats content
  statsContent: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 36 : 24 },
  statGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 20,
  },
  statCell: {
    flex: 1, minWidth: '45%',
    padding: 14, borderRadius: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '600', lineHeight: 28 },
  statLabel: { fontSize: 13, fontWeight: '400', marginTop: 4 },

  // Distribution bars
  distLabel: { fontSize: 15, fontWeight: '600', marginBottom: 10 },
  barRow: { marginBottom: 10 },
  barMeta: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 4,
  },
  barName: { fontSize: 14, fontWeight: '400' },
  barCount: { fontSize: 13 },
  barTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
});

export default SettingsScreen;
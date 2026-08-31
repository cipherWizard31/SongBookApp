import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Modal, ScrollView, Platform } from 'react-native';

export const SettingsScreen = ({
  theme,
  stylesContainer = styles,
  isDarkMode,
  setIsDarkMode,
  toggleDarkMode,
  handleExportSongs,
  handleImportSongs,
  handleClearImportedSetlists,
  handleClearImportedSongs,
  handleClearAllImportedData,
  songs = [],
  setlists = [],
}) => {
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const onToggle = toggleDarkMode || (() => setIsDarkMode && setIsDarkMode(!isDarkMode));

  // Compute Song Statistics
  const totalSongs = songs.length;
  const audioUrlCount = songs.filter((s) => s.audioUrl || s.audioUri).length;
  const uniqueArtists = new Set(songs.map((s) => s.author?.trim()).filter(Boolean)).size;
  const totalLines = songs.reduce((acc, s) => acc + (s.content ? s.content.split('\n').length : 0), 0);

  const importedSongsCount = songs.filter((s) => s.isImported || s.title?.includes('(Imported)')).length;
  const importedSetlistsCount = setlists.filter((s) => s.isImported || s.title?.includes('(Imported)')).length;

  // Style Breakdown
  const styleMap = {};
  songs.forEach((s) => {
    const st = s.style || 'Unspecified';
    styleMap[st] = (styleMap[st] || 0) + 1;
  });
  const styleStats = Object.entries(styleMap).sort((a, b) => b[1] - a[1]);

  // Scale Breakdown
  const scaleMap = {};
  songs.forEach((s) => {
    const sc = s.scale || 'Unspecified';
    scaleMap[sc] = (scaleMap[sc] || 0) + 1;
  });
  const scaleStats = Object.entries(scaleMap).sort((a, b) => b[1] - a[1]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20 }}>
        <Text style={[stylesContainer.screenTitle, { color: theme.text }]}>
          Settings & Backup
        </Text>
      </View>

      {/* Dark Mode Toggle */}
      <View style={[stylesContainer.settingItem, { marginBottom: 12, backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={[stylesContainer.settingTitle, { color: theme.text }]}>Dark Mode</Text>
          <Text style={[stylesContainer.settingDesc, { color: theme.subText }]}>
            Switch between light and dark themes
          </Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: '#555555' }}
          thumbColor={isDarkMode ? '#FFFFFF' : '#f4f3f4'}
        />
      </View>

      {/* Song Statistics Button */}
      <TouchableOpacity
        style={[stylesContainer.settingItem, { marginBottom: 12, backgroundColor: theme.cardBg, borderColor: theme.border }]}
        onPress={() => setStatsModalVisible(true)}
      >
        <View style={{ flex: 1 }}>
          <Text style={[stylesContainer.settingTitle, { color: theme.text }]}>📊 Song Statistics</Text>
          <Text style={[stylesContainer.settingDesc, { color: theme.subText }]}>
            View metrics on your song catalog, styles, scales, and audio memos.
          </Text>
        </View>
      </TouchableOpacity>

      {/* Export Backup Button */}
      <TouchableOpacity
        style={[stylesContainer.settingItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
        onPress={handleExportSongs}
      >
        <View>
          <Text style={[stylesContainer.settingTitle, { color: theme.text }]}>Export Full Backup</Text>
          <Text style={[stylesContainer.settingDesc, { color: theme.subText }]}>
            Export songs, setlists, custom styles, and scales.
          </Text>
        </View>
      </TouchableOpacity>

      {/* Import Backup Button */}
      <TouchableOpacity
        style={[stylesContainer.settingItem, { marginTop: 12, backgroundColor: theme.cardBg, borderColor: theme.border }]}
        onPress={handleImportSongs}
      >
        <View>
          <Text style={[stylesContainer.settingTitle, { color: theme.text }]}>Import Full Backup</Text>
          <Text style={[stylesContainer.settingDesc, { color: theme.subText }]}>
            Restore full application state from backup.
          </Text>
        </View>
      </TouchableOpacity>

      {/* Imported Content Management */}
      {(importedSongsCount > 0 || importedSetlistsCount > 0) && (
        <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.border }}>
          <Text style={[stylesContainer.sectionHeader, { color: theme.text, fontSize: 16, fontWeight: '800', marginBottom: 6 }]}>
            📥 Imported Content Management
          </Text>
          <Text style={[stylesContainer.settingDesc, { color: theme.subText, marginBottom: 12 }]}>
            Manage items added via JSON file imports ({importedSongsCount} song{importedSongsCount === 1 ? '' : 's'}, {importedSetlistsCount} setlist{importedSetlistsCount === 1 ? '' : 's'}).
          </Text>

          {importedSetlistsCount > 0 && handleClearImportedSetlists ? (
            <TouchableOpacity
              style={[stylesContainer.settingItem, { backgroundColor: theme.cardBg, borderColor: '#FF3B3066', marginBottom: 10 }]}
              onPress={handleClearImportedSetlists}>
              <View>
                <Text style={[stylesContainer.settingTitle, { color: '#FF3B30' }]}>🗑️ Remove Imported Setlists ({importedSetlistsCount})</Text>
                <Text style={[stylesContainer.settingDesc, { color: theme.subText }]}>Delete only setlists added via import.</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {importedSongsCount > 0 && handleClearImportedSongs ? (
            <TouchableOpacity
              style={[stylesContainer.settingItem, { backgroundColor: theme.cardBg, borderColor: '#FF3B3066', marginBottom: 10 }]}
              onPress={handleClearImportedSongs}>
              <View>
                <Text style={[stylesContainer.settingTitle, { color: '#FF3B30' }]}>🗑️ Remove Imported Songs ({importedSongsCount})</Text>
                <Text style={[stylesContainer.settingDesc, { color: theme.subText }]}>Delete only songs added via import.</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {handleClearAllImportedData ? (
            <TouchableOpacity
              style={[stylesContainer.settingItem, { backgroundColor: '#FF3B301A', borderColor: '#FF3B30', marginTop: 4 }]}
              onPress={handleClearAllImportedData}>
              <View>
                <Text style={[stylesContainer.settingTitle, { color: '#FF3B30', fontWeight: '800' }]}>⚠️ Clear All Imported Data</Text>
                <Text style={[stylesContainer.settingDesc, { color: theme.subText }]}>Remove all imported songs and setlists in 1 tap.</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* Statistics Modal */}
      <Modal visible={statsModalVisible} animationType="slide" transparent={true} onRequestClose={() => setStatsModalVisible(false)}>
        <View style={modalStyles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setStatsModalVisible(false)} />
          <View style={[modalStyles.sheet, { backgroundColor: theme.cardBg }]}>
            <View style={[modalStyles.dragHandle, { backgroundColor: isDarkMode ? '#444' : '#DDD' }]} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={[modalStyles.modalHeader, { color: theme.text }]}>📊 Song Catalog Stats</Text>
              <Text style={[modalStyles.modalSubtitle, { color: theme.subText }]}>Overview of your library</Text>

              {/* Grid of Key Metrics */}
              <View style={modalStyles.gridContainer}>
                <View style={[modalStyles.statCard, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
                  <Text style={modalStyles.statIcon}>🎵</Text>
                  <Text style={[modalStyles.statNumber, { color: theme.text }]}>{totalSongs}</Text>
                  <Text style={[modalStyles.statLabel, { color: theme.subText }]}>Total Songs</Text>
                </View>

                <View style={[modalStyles.statCard, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
                  <Text style={modalStyles.statIcon}>🔗</Text>
                  <Text style={[modalStyles.statNumber, { color: theme.text }]}>{audioUrlCount}</Text>
                  <Text style={[modalStyles.statLabel, { color: theme.subText }]}>Audio Links</Text>
                </View>

                <View style={[modalStyles.statCard, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
                  <Text style={modalStyles.statIcon}>👤</Text>
                  <Text style={[modalStyles.statNumber, { color: theme.text }]}>{uniqueArtists}</Text>
                  <Text style={[modalStyles.statLabel, { color: theme.subText }]}>Artists</Text>
                </View>

                <View style={[modalStyles.statCard, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
                  <Text style={modalStyles.statIcon}>📜</Text>
                  <Text style={[modalStyles.statNumber, { color: theme.text }]}>{totalLines}</Text>
                  <Text style={[modalStyles.statLabel, { color: theme.subText }]}>Lyric Lines</Text>
                </View>
              </View>

              {/* Style Breakdown */}
              <Text style={[modalStyles.sectionHeader, { color: theme.text }]}>Rhythm / Style Distribution</Text>
              {styleStats.length === 0 ? (
                <Text style={{ color: theme.subText, fontSize: 13, marginVertical: 6 }}>No songs found.</Text>
              ) : (
                styleStats.map(([name, count]) => {
                  const pct = totalSongs > 0 ? (count / totalSongs) * 100 : 0;
                  return (
                    <View key={name} style={{ marginVertical: 6 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text }}>{name}</Text>
                        <Text style={{ fontSize: 13, color: theme.subText }}>{count} ({Math.round(pct)}%)</Text>
                      </View>
                      <View style={{ height: 6, backgroundColor: theme.border, borderRadius: 3, overflow: 'hidden' }}>
                        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: isDarkMode ? '#FFF' : '#000', borderRadius: 3 }} />
                      </View>
                    </View>
                  );
                })
              )}

              {/* Scale Breakdown */}
              <Text style={[modalStyles.sectionHeader, { color: theme.text, marginTop: 20 }]}>Scale (Qenet) Distribution</Text>
              {scaleStats.length === 0 ? (
                <Text style={{ color: theme.subText, fontSize: 13, marginVertical: 6 }}>No songs found.</Text>
              ) : (
                scaleStats.map(([name, count]) => {
                  const pct = totalSongs > 0 ? (count / totalSongs) * 100 : 0;
                  return (
                    <View key={name} style={{ marginVertical: 6 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text }}>{name}</Text>
                        <Text style={{ fontSize: 13, color: theme.subText }}>{count} ({Math.round(pct)}%)</Text>
                      </View>
                      <View style={{ height: 6, backgroundColor: theme.border, borderRadius: 3, overflow: 'hidden' }}>
                        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: isDarkMode ? '#888' : '#444', borderRadius: 3 }} />
                      </View>
                    </View>
                  );
                })
              )}

              {/* Close Button */}
              <TouchableOpacity
                style={[modalStyles.closeBtn, { backgroundColor: isDarkMode ? '#FFF' : '#000', marginTop: 24 }]}
                onPress={() => setStatsModalVisible(false)}
              >
                <Text style={[modalStyles.closeBtnText, { color: isDarkMode ? '#000' : '#FFF' }]}>Close Stats</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '88%',
    elevation: 10,
  },
  dragHandle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  modalHeader: { fontSize: 22, fontWeight: '800' },
  modalSubtitle: { fontSize: 13, marginBottom: 16 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statNumber: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  sectionHeader: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  closeBtn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  closeBtnText: { fontWeight: '700', fontSize: 15 },
});

export default SettingsScreen;
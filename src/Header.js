import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const Header = ({ theme, onOpenNewSongModal }) => {
  return (
    <View style={[styles.appBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
      {/* Left: App Logo & Identity */}
      <View style={styles.titleRow}>
        <Image
          source={require('../assets/music-player.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: theme.text }]}>Selah Kignit</Text>
      </View>

      {/* Right: Quick Action (Add Song) */}
      {onOpenNewSongModal ? (
        <TouchableOpacity
          onPress={onOpenNewSongModal}
          style={[styles.addBtn, { backgroundColor: theme.tint }]}
          activeOpacity={0.8}
          accessibilityLabel="Add new song"
          accessibilityRole="button">
          <Ionicons name="add" size={18} color={theme.fabText || '#101319'} />
          <Text style={[styles.addBtnText, { color: theme.fabText || '#101319' }]}>Add Song</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  appBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: { width: 22, height: 22 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default Header;
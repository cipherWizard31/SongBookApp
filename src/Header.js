import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

export const Header = ({ theme, onOpenSidebar }) => {
  return (
    <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
      <TouchableOpacity
        onPress={onOpenSidebar}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.hamburgerBtn}>
        <Text style={[styles.hamburgerIcon, { color: theme.text }]}>☰</Text>
      </TouchableOpacity>

      <View style={styles.titleRow}>
        <Image source={require('../assets/music-player.png')} style={styles.appLogo} resizeMode="contain" />
        <Text style={[styles.headerTitle, { color: theme.text }]}>SELAH KIGNIT</Text>
      </View>

      <View style={{ width: 24 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hamburgerBtn: { padding: 8 },
  hamburgerIcon: { fontSize: 22 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  appLogo: { width: 20, height: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 1.5 },
});
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

export const Header = ({ theme, onOpenSidebar }) => {
  return (
    <View style={[styles.appBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
      {/* Leading: menu button — 48×48 touch target */}
      <TouchableOpacity
        onPress={onOpenSidebar}
        style={styles.iconBtn}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        accessibilityLabel="Open navigation menu"
        accessibilityRole="button">
        <View style={styles.hamburger}>
          <View style={[styles.line, { backgroundColor: theme.text }]} />
          <View style={[styles.line, { backgroundColor: theme.text }]} />
          <View style={[styles.line, { backgroundColor: theme.text }]} />
        </View>
      </TouchableOpacity>

      {/* Center: app identity */}
      <View style={styles.titleRow}>
        <Image
          source={require('../assets/music-player.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: theme.text }]}>Selah Kignit</Text>
      </View>

      {/* Trailing spacer keeps title centered */}
      <View style={styles.iconBtn} />
    </View>
  );
};

const styles = StyleSheet.create({
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamburger: { gap: 5 },
  line: { width: 22, height: 1.5, borderRadius: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: { width: 20, height: 20 },
  // MD3 Title Large: 22sp, weight 400
  title: { fontSize: 18, fontWeight: '500', letterSpacing: 0.1 },
});
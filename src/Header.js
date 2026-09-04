import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const Header = ({ theme, onNavigateToProfile }) => {
  return (
    <View style={[styles.appBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
      {/* Left: App Logo & Identity */}
      <View style={styles.titleRow}>
        <Image
          source={require('../assets/music-player-transparent.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: theme.text }]}>Selah Kignit</Text>
      </View>

      {/* Right: Profile Avatar Button */}
      {onNavigateToProfile ? (
        <TouchableOpacity
          onPress={onNavigateToProfile}
          style={[styles.profileAvatarBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
          activeOpacity={0.75}
          accessibilityLabel="Open profile"
          accessibilityRole="button">
          <View style={[styles.avatarCircle, { backgroundColor: theme.secondaryBg }]}>
            <Ionicons name="person" size={18} color={theme.tint} />
          </View>
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
  logo: { width: 30, height: 30 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  profileAvatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;
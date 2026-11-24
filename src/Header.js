import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const Header = ({ theme, onOpenShare, onImportFile }) => {
  return (
    <View style={[styles.appBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
      {/* Left: App Logo & Identity */}
      <View style={styles.titleRow}>
        <View style={[styles.logoCircle, { backgroundColor: theme.tint || '#E5A93C' }]}>
          <Image
            source={require('../assets/music-player-transparent.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.title, { color: theme.text, fontFamily: theme.fonts?.title || 'System' }]}>Selah Kignit</Text>
      </View>

      {/* Right: Actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {onImportFile ? (
          <TouchableOpacity
            onPress={onImportFile}
            style={[styles.iconBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            activeOpacity={0.75}
            accessibilityLabel="Import JSON from file"
            accessibilityRole="button">
            <Ionicons name="cloud-download-outline" size={19} color={theme.tint} />
          </TouchableOpacity>
        ) : null}

        {onOpenShare ? (
          <TouchableOpacity
            onPress={onOpenShare}
            style={[styles.iconBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            activeOpacity={0.75}
            accessibilityLabel="Share songs as JSON"
            accessibilityRole="button">
            <Ionicons name="share-social-outline" size={18} color={theme.tint} />
          </TouchableOpacity>
        ) : null}
      </View>
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
  logoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  logo: { width: 22, height: 22 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;
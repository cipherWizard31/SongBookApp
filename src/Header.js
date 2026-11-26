import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from './components/AnimatedPressable';

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
          <AnimatedPressable
            onPress={onImportFile}
            rippleColor={theme.rippleColor}
            style={[styles.iconBtn, { backgroundColor: theme.surface2 || theme.cardBg, borderColor: theme.border }]}
            accessibilityLabel="Import JSON from file"
            accessibilityRole="button">
            <Ionicons name="cloud-download-outline" size={20} color={theme.tint} />
          </AnimatedPressable>
        ) : null}

        {onOpenShare ? (
          <AnimatedPressable
            onPress={onOpenShare}
            rippleColor={theme.rippleColor}
            style={[styles.iconBtn, { backgroundColor: theme.surface2 || theme.cardBg, borderColor: theme.border }]}
            accessibilityLabel="Share songs as JSON"
            accessibilityRole="button">
            <Ionicons name="share-social-outline" size={19} color={theme.tint} />
          </AnimatedPressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appBar: {
    height: 60,
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
  },
  logo: { width: 22, height: 22 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;
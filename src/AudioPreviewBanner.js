import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Linking, Alert, ImageBackground } from 'react-native';

export const getYouTubeVideoId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/)|&v=)([^#&?]{11})/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
};

export const getThumbnailUri = (url) => {
  if (!url) return null;

  // 1. YouTube link
  const ytId = getYouTubeVideoId(url);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }

  // 2. Direct Image Link
  if (/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url)) {
    return url;
  }

  return null;
};

export const AudioPreviewBanner = ({ audioUrl, onPressPlay, isDarkMode, theme }) => {
  const [imageError, setImageError] = useState(false);

  if (!audioUrl) return null;

  const handlePress = () => {
    if (onPressPlay) {
      onPressPlay(audioUrl);
    } else {
      Linking.openURL(audioUrl).catch(() => Alert.alert('Unable to open link', audioUrl));
    }
  };

  const thumbnailUri = !imageError ? getThumbnailUri(audioUrl) : null;
  const isYouTube = !!getYouTubeVideoId(audioUrl);

  let hostDomain = 'Audio Stream';
  try {
    const parsed = new URL(audioUrl);
    hostDomain = parsed.hostname.replace('www.', '');
  } catch (e) {
    if (isYouTube) hostDomain = 'youtube.com';
  }

  if (thumbnailUri) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.thumbnailCard}
        onPress={handlePress}>
        <ImageBackground
          source={{ uri: thumbnailUri }}
          style={styles.imageBackground}
          imageStyle={{ borderRadius: 12 }}
          onError={() => setImageError(true)}>
          <View style={styles.darkOverlay}>
            <View style={styles.topBadgeRow}>
              <View style={styles.hostBadge}>
                <Text style={styles.hostBadgeText}>
                  {isYouTube ? '▶ YOUTUBE' : `🎵 ${hostDomain.toUpperCase()}`}
                </Text>
              </View>
            </View>

            <View style={styles.playButtonContainer}>
              <View style={styles.playCircle}>
                <Text style={styles.playTriangle}>▶</Text>
              </View>
              <Text style={styles.playLabel}>
                {isYouTube ? 'Watch Video / Audio' : 'Play Audio Stream'}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  // Fallback banner when no thumbnail is available
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.fallbackBanner,
        {
          backgroundColor: isDarkMode ? '#1E2638' : '#EAF2FF',
          borderColor: isDarkMode ? '#334466' : '#BCD4FF',
        },
      ]}
      onPress={handlePress}>
      <View style={styles.fallbackLeft}>
        <View style={[styles.musicIconCircle, { backgroundColor: isDarkMode ? '#0066FF' : '#0052CC' }]}>
          <Text style={{ fontSize: 16 }}>🎵</Text>
        </View>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={[styles.fallbackTitle, { color: theme?.text || (isDarkMode ? '#FFF' : '#000') }]} numberOfLines={1}>
            Audio Link Attached
          </Text>
          <Text style={[styles.fallbackSub, { color: theme?.subText || (isDarkMode ? '#AAA' : '#666') }]} numberOfLines={1}>
            {hostDomain}
          </Text>
        </View>
      </View>
      <View style={[styles.fallbackPlayBtn, { backgroundColor: isDarkMode ? '#FFF' : '#000' }]}>
        <Text style={[styles.fallbackPlayBtnText, { color: isDarkMode ? '#000' : '#FFF' }]}>▶ Play Link</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  thumbnailCard: {
    height: 160,
    width: '100%',
    borderRadius: 12,
    marginVertical: 10,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  topBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  hostBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  hostBadgeText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  playButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  playLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  fallbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 10,
  },
  fallbackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  musicIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  fallbackSub: {
    fontSize: 12,
    marginTop: 1,
  },
  fallbackPlayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fallbackPlayBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});

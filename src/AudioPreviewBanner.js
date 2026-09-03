import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, ImageBackground } from 'react-native';

export const getYouTubeVideoId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/)|&v=)([^#&?]{11})/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
};

export const getThumbnailUri = (url) => {
  if (!url) return null;
  const ytId = getYouTubeVideoId(url);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
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
  const isSpotify = /spotify\.com|spotify\.link/i.test(audioUrl);

  let hostDomain = 'Audio stream';
  try {
    const parsed = new URL(audioUrl);
    hostDomain = parsed.hostname.replace('www.', '');
  } catch (e) {
    if (isYouTube) hostDomain = 'youtube.com';
    if (isSpotify) hostDomain = 'spotify.com';
  }

  const serviceLabel = isYouTube ? 'YOUTUBE' : isSpotify ? 'SPOTIFY' : hostDomain.toUpperCase();
  const playLabel = isYouTube
    ? 'Play on YouTube'
    : isSpotify
    ? 'Play on Spotify'
    : 'Play Audio';

  if (thumbnailUri) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={st.card}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Play song on ${serviceLabel}`}>
        <ImageBackground
          source={{ uri: thumbnailUri }}
          style={st.bgImage}
          imageStyle={{ borderRadius: 8 }}
          onError={() => setImageError(true)}>
          <View style={st.scrim}>
            <View style={st.badge}>
              <Text style={st.badgeLabel}>{serviceLabel}</Text>
            </View>

            <View style={st.playBar}>
              <Text style={st.playIcon}>▶</Text>
              <Text style={st.playLabel}>{playLabel}</Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  // Native row fallback for links without direct image previews (e.g., Spotify tracks, SoundCloud, MP3 streams)
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        st.fallbackRow,
        { backgroundColor: theme?.cardBg || (isDarkMode ? '#2C2C2E' : '#EFEFF4') },
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Play audio link on ${serviceLabel}`}>
      <View style={st.fallbackText}>
        <Text style={[st.fallbackTitle, { color: theme?.text || (isDarkMode ? '#FFF' : '#000') }]}>
          {isSpotify ? 'Spotify Track' : isYouTube ? 'YouTube Video' : 'Audio Link'}
        </Text>
        <Text style={[st.fallbackSub, { color: theme?.subText || (isDarkMode ? '#8E8E93' : '#6C6C70') }]} numberOfLines={1}>
          {hostDomain}
        </Text>
      </View>
      <View style={[st.playPill, { backgroundColor: theme?.text || (isDarkMode ? '#FFF' : '#000') }]}>
        <Text style={[st.playPillLabel, { color: theme?.bg || (isDarkMode ? '#000' : '#FFF') }]}>
          ▶ {isSpotify ? 'Spotify' : isYouTube ? 'YouTube' : 'Play'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const st = StyleSheet.create({
  card: {
    height: 140,
    width: '100%',
    borderRadius: 8,
    marginVertical: 10,
    overflow: 'hidden',
  },
  bgImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  playBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  playLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  fallbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  fallbackText: { flex: 1, paddingRight: 12 },
  fallbackTitle: { fontSize: 15, fontWeight: '500' },
  fallbackSub: { fontSize: 13, marginTop: 2 },
  playPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  playPillLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

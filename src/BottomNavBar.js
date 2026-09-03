import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TAB_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid', outlineIcon: 'grid-outline' },
  { key: 'songs', label: 'Song List', icon: 'musical-notes', outlineIcon: 'musical-notes-outline' },
  { key: 'setlists', label: 'Setlists', icon: 'list', outlineIcon: 'list-outline' },
  { key: 'profile', label: 'Profile', icon: 'person', outlineIcon: 'person-outline' },
];

const hexToRgba = (hex, alpha) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    return `rgba(229, 169, 60, ${alpha})`;
  }
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  if (c.length !== 6) {
    return `rgba(229, 169, 60, ${alpha})`;
  }
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
};

const TabItem = ({ tab, active, onSelectTab, theme }) => {
  const animValue = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: active ? 1 : 0,
      friction: 7,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [active, animValue]);

  const activeColor = theme.tint || '#E5A93C';
  const inactiveColor = theme.subText || '#94A3B8';
  const iconName = active ? tab.icon : tab.outlineIcon;

  // Zoom scale animation
  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  // Glass opacity
  const glassOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const bgRgba = hexToRgba(activeColor, 0.22);
  const borderRgba = hexToRgba(activeColor, 0.6);

  return (
    <TouchableOpacity
      style={st.tabTouch}
      activeOpacity={0.8}
      onPress={() => onSelectTab(tab.key)}>

      {/* Animated Glass Active Background Card */}
      <Animated.View
        style={[
          st.glassActiveCard,
          {
            backgroundColor: bgRgba,
            borderColor: borderRgba,
            opacity: glassOpacity,
            transform: [{ scale }],
          },
        ]}
      />

      {/* Foreground Content Stack */}
      <View style={st.contentStack}>
        <Ionicons
          name={iconName}
          size={19}
          color={active ? activeColor : inactiveColor}
        />
        <Text
          style={[
            st.tabLabel,
            { color: active ? activeColor : inactiveColor },
            active && st.tabLabelActive,
          ]}
          numberOfLines={1}>
          {tab.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const BottomNavBar = ({ currentTab, onSelectTab, theme }) => {
  return (
    <View style={st.dockWrapper} pointerEvents="box-none">
      <View
        style={[
          st.floatingContainer,
          {
            backgroundColor: theme.secondaryBg || '#191C22',
            borderColor: theme.border || '#32353C',
          },
        ]}>
        {TAB_ITEMS.map((tab) => (
          <TabItem
            key={tab.key}
            tab={tab}
            active={currentTab === tab.key}
            onSelectTab={onSelectTab}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
};

const st = StyleSheet.create({
  dockWrapper: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    paddingTop: 4,
    backgroundColor: 'transparent',
  },
  floatingContainer: {
    height: 64,
    borderRadius: 32, // Ultra-rounded container capsule
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    overflow: 'hidden',

    // Soft Ambient Elevation Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabTouch: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  glassActiveCard: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 3,
    right: 3,
    borderRadius: 26, // Ultra-rounded button pill capsule
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: 'transparent',

    shadowColor: '#E5A93C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  contentStack: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.1,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});

export default BottomNavBar;

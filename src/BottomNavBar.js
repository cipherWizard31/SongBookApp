import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from './components/AnimatedPressable';

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
  const activeColor = theme.tint || '#E5A93C';
  const inactiveColor = theme.subText || '#94A3B8';
  const iconName = active ? tab.icon : tab.outlineIcon;

  return (
    <AnimatedPressable
      style={st.tabTouch}
      onPress={() => onSelectTab(tab.key)}>
      <View style={st.contentStack}>
        <Ionicons
          name={iconName}
          size={19}
          color={active ? activeColor : inactiveColor}
        />
        <Text
          style={[
            st.tabLabel,
            { color: active ? activeColor : inactiveColor, fontFamily: theme.fonts?.body || 'System' },
            active && st.tabLabelActive,
          ]}
          numberOfLines={1}>
          {tab.label}
        </Text>
      </View>
    </AnimatedPressable>
  );
};

export const BottomNavBar = ({ currentTab, onSelectTab, theme }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = Math.max(0, TAB_ITEMS.findIndex((t) => t.key === currentTab));
  const translateX = useSharedValue(0);

  const horizontalPadding = 8;
  const innerWidth = Math.max(0, containerWidth - horizontalPadding * 2);
  const tabWidth = innerWidth / TAB_ITEMS.length;

  useEffect(() => {
    if (tabWidth > 0) {
      translateX.value = withSpring(activeIndex * tabWidth, {
        damping: 20,
        stiffness: 240,
        mass: 0.8,
      });
    }
  }, [activeIndex, tabWidth, translateX]);

  const activeColor = theme.tint || '#E5A93C';
  const bgRgba = hexToRgba(activeColor, 0.2);
  const borderRgba = hexToRgba(activeColor, 0.55);

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[st.dockWrapper, { backgroundColor: 'transparent' }]} pointerEvents="box-none">
      <View
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        style={[
          st.floatingContainer,
          {
            backgroundColor: theme.secondaryBg || '#191C22',
            borderColor: theme.border || '#32353C',
          },
        ]}>
        {/* Gliding Active Pill Indicator */}
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              st.glidingPill,
              {
                width: tabWidth - 8,
                left: horizontalPadding + 4,
                backgroundColor: bgRgba,
                borderColor: borderRgba,
              },
              sliderStyle,
            ]}
          />
        )}

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
    paddingBottom: 12,
    paddingTop: 4,
    backgroundColor: 'transparent',
  },
  floatingContainer: {
    height: 64,
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  glidingPill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tabTouch: {
    flex: 1,
    minHeight: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
    borderRadius: 26,
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

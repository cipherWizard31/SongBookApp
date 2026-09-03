import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TAB_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid', outlineIcon: 'grid-outline' },
  { key: 'songs',     label: 'Song List', icon: 'musical-notes', outlineIcon: 'musical-notes-outline' },
  { key: 'setlists',  label: 'Setlists',  icon: 'list', outlineIcon: 'list-outline' },
  { key: 'profile',   label: 'Profile',   icon: 'person', outlineIcon: 'person-outline' },
];

export const BottomNavBar = ({ currentTab, onSelectTab, theme }) => {
  return (
    <View style={st.outerContainer} pointerEvents="box-none">
      <View
        style={[
          st.floatingDock,
          {
            backgroundColor: theme.secondaryBg || '#191C22',
            borderColor: theme.border || '#32353C',
          },
        ]}>
        {TAB_ITEMS.map((tab) => {
          const active = currentTab === tab.key;
          const iconName = active ? tab.icon : tab.outlineIcon;
          const activePillBg = theme.tint || '#E5A93C';
          const activeIconColor = theme.fabText || '#101319';
          const inactiveColor = theme.subText || '#94A3B8';

          return (
            <TouchableOpacity
              key={tab.key}
              style={st.tabButton}
              activeOpacity={0.75}
              onPress={() => onSelectTab(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}>
              {/* One UI 8.5 Active Indicator Pill */}
              <View
                style={[
                  st.iconPill,
                  active
                    ? { backgroundColor: activePillBg }
                    : { backgroundColor: 'transparent' },
                ]}>
                <Ionicons
                  name={iconName}
                  size={20}
                  color={active ? activeIconColor : inactiveColor}
                />
              </View>

              {/* Label */}
              <Text
                style={[
                  st.tabLabel,
                  { color: active ? activePillBg : inactiveColor },
                  active && st.tabLabelActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const st = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 16 : 12,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  floatingDock: {
    width: '100%',
    maxWidth: 500,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,

    // One UI 8.5 Ambient Elevation Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconPill: {
    width: 48,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});

export default BottomNavBar;

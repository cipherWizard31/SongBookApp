import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAV_ITEMS = [
  { key: 'dashboard',  label: 'Dashboard',        icon: 'grid',          outlineIcon: 'grid-outline'          },
  { key: 'songs',      label: 'Songs',            icon: 'musical-notes', outlineIcon: 'musical-notes-outline' },
  { key: 'albums',     label: 'Albums',           icon: 'disc',          outlineIcon: 'disc-outline'          },
  { key: 'artists',    label: 'Artists',          icon: 'person',        outlineIcon: 'person-outline'        },
  { key: 'setlists',   label: 'Setlists',         icon: 'list',          outlineIcon: 'list-outline'          },
  { key: 'dictionary', label: 'Scale Dictionary', icon: 'book',          outlineIcon: 'book-outline'          },
  { key: 'settings',   label: 'Settings',         icon: 'settings',      outlineIcon: 'settings-outline'      },
];

export const SidebarDrawer = ({
  sidebarOpen, toggleSidebar, slideAnim,
  currentScreen, setCurrentScreen,
  theme, isDarkMode, drawerWidth,
}) => {
  return (
    <Modal
      visible={sidebarOpen}
      transparent
      animationType="none"
      onRequestClose={() => toggleSidebar(false)}>

      <View style={styles.overlay}>
        {/* Scrim — tap to close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => toggleSidebar(false)}
          accessibilityLabel="Close navigation menu"
          accessibilityRole="button"
        />

        <Animated.View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              backgroundColor: theme.secondaryBg,
              borderRightColor: theme.border,
              transform: [{ translateX: slideAnim }],
            },
          ]}>

          {/* Drawer header */}
          <View style={[styles.drawerHeader, { borderBottomColor: theme.divider }]}>
            <Image
              source={require('../assets/music-player-transparent.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.drawerTitle, { color: theme.text }]}>Selah Kignit</Text>
          </View>

          {/* Nav items — vector icon destinations */}
          <View style={styles.navList}>
            {NAV_ITEMS.map((item) => {
              const active = currentScreen === item.key;
              const iconName = active ? item.icon : item.outlineIcon;
              const iconColor = active ? theme.tint : theme.subText;

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.navItem,
                    active && { backgroundColor: theme.activeItem },
                  ]}
                  onPress={() => {
                    setCurrentScreen(item.key);
                    toggleSidebar(false);
                  }}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: active }}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={iconName} size={22} color={iconColor} />
                  </View>
                  <Text
                    style={[
                      styles.navLabel,
                      { color: active ? theme.tint : theme.subText },
                      active && styles.navLabelActive,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  drawer: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    borderRightWidth: StyleSheet.hairlineWidth,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo: { width: 30, height: 30 },
  drawerTitle: { fontSize: 17, fontWeight: '600', letterSpacing: 0.1 },
  navList: { paddingHorizontal: 8, paddingTop: 12 },
  navItem: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 26,
    marginBottom: 4,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  navLabel: { fontSize: 15, fontWeight: '400', letterSpacing: 0.1 },
  navLabelActive: { fontWeight: '600' },
});

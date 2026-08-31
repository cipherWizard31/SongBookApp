import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  Animated,
  StyleSheet,
} from "react-native";

export const SidebarDrawer = ({
  sidebarOpen,
  toggleSidebar,
  slideAnim,
  currentScreen,
  setCurrentScreen,
  theme,
  isDarkMode,
  drawerWidth,
}) => {
  return (
    <Modal
      visible={sidebarOpen}
      transparent={true}
      animationType="none"
      onRequestClose={() => toggleSidebar(false)}
    >
      <View style={styles.drawerOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => toggleSidebar(false)}
        />

        <Animated.View
          style={[
            styles.drawerContainer,
            {
              width: drawerWidth,
              backgroundColor: theme.cardBg,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View
            style={[styles.drawerHeader, { borderBottomColor: theme.border }]}
          >
            <Image
              source={require("../assets/music-player.png")}
              style={styles.drawerLogo}
              resizeMode="contain"
            />
            <Text style={[styles.drawerTitle, { color: theme.text }]}>
              Selah Kignit
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.drawerItem,
              currentScreen === "songs" && {
                backgroundColor: isDarkMode ? "#2C2C2C" : "#F5F5F5",
              },
            ]}
            onPress={() => {
              setCurrentScreen("songs");
              toggleSidebar(false);
            }}
          >
            <Text style={[styles.drawerItemText, { color: theme.text }]}>
              🎵 Songs Feed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.drawerItem,
              currentScreen === "albums" && {
                backgroundColor: isDarkMode ? "#2C2C2C" : "#F5F5F5",
              },
            ]}
            onPress={() => {
              setCurrentScreen("albums");
              toggleSidebar(false);
            }}
          >
            <Text style={[styles.drawerItemText, { color: theme.text }]}>
              💿 Albums
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.drawerItem,
              currentScreen === "artists" && {
                backgroundColor: isDarkMode ? "#2C2C2C" : "#F5F5F5",
              },
            ]}
            onPress={() => {
              setCurrentScreen("artists");
              toggleSidebar(false);
            }}
          >
            <Text style={[styles.drawerItemText, { color: theme.text }]}>
              👤 Artists
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.drawerItem,
              currentScreen === "dictionary" && {
                backgroundColor: isDarkMode ? "#2C2C2C" : "#F5F5F5",
              },
            ]}
            onPress={() => {
              setCurrentScreen("dictionary");
              toggleSidebar(false);
            }}
          >
            <Text style={[styles.drawerItemText, { color: theme.text }]}>
              📖 Scale Dictionary
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.drawerItem,
              currentScreen === "setlists" && {
                backgroundColor: isDarkMode ? "#2C2C2C" : "#F5F5F5",
              },
            ]}
            onPress={() => {
              setCurrentScreen("setlists");
              toggleSidebar(false);
            }}
          >
            <Text
              style={[styles.drawerItemText, { color: theme.text }]}
            >
              📋 Setlists
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.drawerItem,
              currentScreen === "settings" && {
                backgroundColor: isDarkMode ? "#2C2C2C" : "#F5F5F5",
              },
            ]}
            onPress={() => {
              setCurrentScreen("settings");
              toggleSidebar(false);
            }}
          >
            <Text style={[styles.drawerItemText, { color: theme.text }]}>
              ⚙️ Settings
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  drawerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  drawerContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    padding: 20,
    paddingTop: 40,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  drawerLogo: { width: 28, height: 28 },
  drawerTitle: { fontSize: 20, fontWeight: "800" },
  drawerItem: {
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  drawerItemText: { fontSize: 15, fontWeight: "600" },
});

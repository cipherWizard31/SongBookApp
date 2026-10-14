import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AMBER = '#E5A93C';
const CYAN = '#38BDF8';
const EMERALD = '#10B981';

/**
 * ExportOptionsModal
 * Presents the user with two clear choices upon initiating an export / backup:
 * 1) "Save to Files" - Save the JSON file to device storage or iCloud/Google Drive
 * 2) "Share to App" - Share file to another app (WhatsApp, Telegram, Mail, AirDrop, etc.)
 */
export const ExportOptionsModal = ({
  visible,
  onClose,
  title = 'Export Backup',
  subtitle = 'Choose how you want to handle your exported file',
  itemCountText = '',
  onSaveToFile,
  onShareToApp,
  theme,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={st.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[st.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          {/* Header */}
          <View style={st.header}>
            <View style={[st.iconBox, { backgroundColor: `${AMBER}18` }]}>
              <Ionicons name="cloud-upload" size={22} color={AMBER} />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[st.title, { color: theme.text }]} numberOfLines={1}>
                {title}
              </Text>
              <Text style={[st.subtitle, { color: theme.subText }]} numberOfLines={2}>
                {subtitle}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={st.closeBtn} accessibilityLabel="Close">
              <Ionicons name="close-circle" size={24} color={theme.subText} />
            </TouchableOpacity>
          </View>

          {itemCountText ? (
            <View style={[st.badgeBox, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
              <Ionicons name="document-text-outline" size={14} color={CYAN} style={{ marginRight: 6 }} />
              <Text style={[st.badgeText, { color: theme.text }]}>{itemCountText}</Text>
            </View>
          ) : null}

          {/* Action Options */}
          <View style={st.optionsList}>
            {/* Option 1: Save to Files */}
            <TouchableOpacity
              style={[st.optionItem, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onSaveToFile && onSaveToFile();
              }}>
              <View style={[st.optionIconBox, { backgroundColor: `${EMERALD}18` }]}>
                <Ionicons name="download-outline" size={22} color={EMERALD} />
              </View>
              <View style={st.optionContent}>
                <Text style={[st.optionTitle, { color: theme.text }]}>Save to Files</Text>
                <Text style={[st.optionDesc, { color: theme.subText }]}>
                  {Platform.OS === 'android'
                    ? 'Pick a folder (Downloads, Documents) on your device'
                    : 'Save JSON file directly to device storage or Files app'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.subText} />
            </TouchableOpacity>

            {/* Option 2: Share to App */}
            <TouchableOpacity
              style={[st.optionItem, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onShareToApp && onShareToApp();
              }}>
              <View style={[st.optionIconBox, { backgroundColor: `${CYAN}18` }]}>
                <Ionicons name="share-social-outline" size={22} color={CYAN} />
              </View>
              <View style={st.optionContent}>
                <Text style={[st.optionTitle, { color: theme.text }]}>Share to App</Text>
                <Text style={[st.optionDesc, { color: theme.subText }]}>
                  Send the exported file to WhatsApp, Telegram, Email, or AirDrop
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.subText} />
            </TouchableOpacity>
          </View>

          {/* Cancel button */}
          <TouchableOpacity
            style={[st.cancelBtn, { borderColor: theme.border }]}
            onPress={onClose}
            activeOpacity={0.8}>
            <Text style={[st.cancelBtnText, { color: theme.subText }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const st = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 2,
  },
  badgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
    marginRight: 8,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  optionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ExportOptionsModal;

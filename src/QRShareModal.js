import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';

const AMBER = '#E5A93C';
const CYAN = '#38BDF8';

export const QRShareModal = ({
  visible,
  onClose,
  title = 'Direct Share',
  subtitle = 'Scan with Selah Kignit on another device',
  type = 'song', // 'song' | 'setlist'
  data = null,
  theme,
}) => {
  if (!visible || !data) return null;

  // Compact payload structure with identifying type header
  const payload = JSON.stringify({
    sk: 'selah_kignit',
    type,
    payload: data,
  });

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
              <Ionicons name="qr-code" size={22} color={AMBER} />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[st.title, { color: theme.text }]} numberOfLines={1}>
                {title}
              </Text>
              <Text style={[st.subtitle, { color: theme.subText }]} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={st.closeBtn}>
              <Ionicons name="close-circle" size={24} color={theme.subText} />
            </TouchableOpacity>
          </View>

          {/* QR Code Container */}
          <View style={st.qrBox}>
            <View style={st.whitePlate}>
              <QRCode
                value={payload}
                size={220}
                backgroundColor="#FFFFFF"
                color="#000000"
              />
            </View>
          </View>

          {/* Instructions */}
          <View style={[st.instructionBox, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
            <Ionicons name="scan-outline" size={18} color={CYAN} style={{ marginRight: 8 }} />
            <Text style={[st.instructionText, { color: theme.subText }]}>
              Open <Text style={{ color: theme.text, fontWeight: '700' }}>Selah Kignit</Text> on the other phone and tap the camera scanner to import instantly without internet or files.
            </Text>
          </View>

          <TouchableOpacity
            style={[st.doneBtn, { backgroundColor: AMBER }]}
            onPress={onClose}
            activeOpacity={0.85}>
            <Text style={st.doneBtnText}>Done</Text>
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
    maxWidth: 360,
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
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
    marginBottom: 18,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  qrBox: {
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  whitePlate: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 18,
    width: '100%',
  },
  instructionText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  doneBtn: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#1E1909',
    fontSize: 14,
    fontWeight: '700',
  },
});

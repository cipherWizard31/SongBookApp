import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const AMBER = '#E5A93C';

export const QRScannerModal = ({
  visible,
  onClose,
  onImportData,
  theme,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!visible) return null;

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const parsed = JSON.parse(data);
      if (parsed?.sk === 'selah_kignit' && parsed.type && parsed.payload) {
        onClose();
        if (onImportData) {
          onImportData(parsed.type, parsed.payload);
        }
      } else {
        Alert.alert(
          'Unrecognized QR Code',
          'This QR code is not a valid Selah Kignit song or setlist.',
          [{ text: 'Scan Again', onPress: () => setScanned(false) }]
        );
      }
    } catch (e) {
      Alert.alert(
        'Scan Error',
        'Could not parse data from this QR code.',
        [{ text: 'Try Again', onPress: () => setScanned(false) }]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={st.container}>
        {/* Top Control Bar */}
        <View style={st.topBar}>
          <TouchableOpacity
            style={st.closeIconBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close scanner">
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={st.topBarTitle}>Scan In-App QR</Text>
          <View style={{ width: 44 }} />
        </View>

        {!permission?.granted ? (
          <View style={st.permissionBox}>
            <View style={st.permIconCircle}>
              <Ionicons name="camera-outline" size={48} color={AMBER} />
            </View>
            <Text style={st.permissionTitle}>Camera Access Needed</Text>
            <Text style={st.permissionSub}>
              Selah Kignit uses your camera to scan songs and setlists directly from another phone without internet.
            </Text>
            <TouchableOpacity
              style={[st.permissionBtn, { backgroundColor: AMBER }]}
              onPress={requestPermission}
              activeOpacity={0.85}>
              <Text style={st.permissionBtnText}>Grant Camera Permission</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={st.cameraWrapper}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {/* Viewfinder Overlay Reticle */}
            <View style={st.reticleWrapper}>
              <View style={st.reticle}>
                <View style={[st.reticleCorner, st.topLeft]} />
                <View style={[st.reticleCorner, st.topRight]} />
                <View style={[st.reticleCorner, st.bottomLeft]} />
                <View style={[st.reticleCorner, st.bottomRight]} />
              </View>
            </View>

            {/* Instruction Footer */}
            <View style={st.bottomBar}>
              <Text style={st.hintText}>
                Point camera at another device's Selah Kignit QR code
              </Text>
              {scanned && (
                <TouchableOpacity
                  style={[st.rescanBtn, { backgroundColor: AMBER }]}
                  onPress={() => setScanned(false)}>
                  <Ionicons name="reload" size={16} color="#1E1909" style={{ marginRight: 6 }} />
                  <Text style={st.rescanBtnText}>Scan Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    height: 56,
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  closeIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cameraWrapper: {
    flex: 1,
  },
  reticleWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticle: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  reticleCorner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: AMBER,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  rescanBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rescanBtnText: {
    color: '#1E1909',
    fontSize: 13,
    fontWeight: '700',
  },
  permissionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${AMBER}18`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  permissionSub: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  permissionBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  permissionBtnText: {
    color: '#1E1909',
    fontSize: 14,
    fontWeight: '700',
  },
});

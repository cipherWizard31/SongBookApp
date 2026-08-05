import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';

export const StyleDictScreen = ({
  styleDict = [],
  recorderState,
  recordingStyleName,
  startRecording,
  stopRecording,
  playSound,
  playingUri,
  onDeleteRecording,
  onSaveRecording, // Callback to persist recording in parent App.js
  theme,
  isDarkMode = false,
}) => {
  const [selectedStyleName, setSelectedStyleName] = useState(null);

  // Dynamically derive current active style from styleDict to guarantee UI updates when recordings change
  const currentActiveStyle = selectedStyleName
    ? styleDict.find((item) => item.name === selectedStyleName)
    : null;

  const handleStopRecording = async () => {
    if (stopRecording) {
      const newRecording = await stopRecording(); 
      // If stopRecording returns the recorded object or URI, pass it up:
      if (onSaveRecording && recordingStyleName) {
        onSaveRecording(recordingStyleName, newRecording);
      }
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={[styles.screenTitle, { color: theme.text }]}>Style & Rhythm Dictionary</Text>
      <Text style={[styles.screenSub, { color: theme.subText }]}>
        Tap any style to record multiple samples and view player details.
      </Text>

      {styleDict.map((s) => {
        const recordingsList = s.recordings || (s.audioUri ? [{ id: 'legacy', uri: s.audioUri, timestamp: 'Sample 1' }] : []);
        const recCount = recordingsList.length;
        const isCurrentlyRecording = recorderState?.isRecording && recordingStyleName === s.name;

        return (
          <TouchableOpacity
            key={s.name}
            activeOpacity={0.7}
            style={[
              styles.dictCard,
              {
                backgroundColor: theme.cardBg,
                borderColor: isCurrentlyRecording ? '#FF3B30' : theme.border,
              },
            ]}
            onPress={() => setSelectedStyleName(s.name)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.dictTitle, { color: theme.text }]}>{s.name}</Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: recCount > 0 ? (isDarkMode ? '#0066FF' : '#E6F0FF') : (isDarkMode ? '#333333' : '#F0F0F0'),
                  },
                ]}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: recCount > 0 ? (isDarkMode ? '#FFFFFF' : '#0066FF') : theme.subText,
                  }}>
                  {recCount} {recCount === 1 ? 'sample' : 'samples'}
                </Text>
              </View>
            </View>

            <Text style={[styles.dictNotes, { color: theme.subText, marginTop: 4 }]}>
              Rhythm Pattern: {s.rhythm}
            </Text>
            <Text style={[styles.dictDesc, { color: theme.subText }]}>{s.description}</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <View
                style={[
                  styles.smallBtn,
                  { backgroundColor: isDarkMode ? '#FFFFFF' : '#000000' },
                ]}>
                <Text style={{ color: isDarkMode ? '#000000' : '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                  ▶ Open Player & List ({recCount})
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* POPUP PLAYER & LIST MODAL */}
      <Modal
        visible={!!currentActiveStyle}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedStyleName(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setSelectedStyleName(null)} />

          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <View style={[styles.dragHandle, { backgroundColor: isDarkMode ? '#444444' : '#DDDDDD' }]} />

            <Text style={[styles.modalHeader, { color: theme.text }]}>{currentActiveStyle?.name}</Text>
            <Text style={[styles.dictNotes, { color: theme.subText, marginTop: 2 }]}>
              Pattern: {currentActiveStyle?.rhythm}
            </Text>
            <Text style={[styles.dictDesc, { color: theme.subText, marginBottom: 12 }]}>
              {currentActiveStyle?.description}
            </Text>

            {/* RECORD ACTION BUTTON */}
            <View style={{ marginBottom: 14 }}>
              {recorderState?.isRecording && recordingStyleName === currentActiveStyle?.name ? (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#FF3B30' }]}
                  onPress={handleStopRecording}>
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>⏹ Stop Recording</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: isDarkMode ? '#FFFFFF' : '#000000' }]}
                  onPress={() => startRecording(currentActiveStyle?.name)}>
                  <Text style={{ color: isDarkMode ? '#000000' : '#FFFFFF', fontWeight: 'bold' }}>
                    🎙️ Record New Sample
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={[styles.inputLabel, { color: theme.subText }]}>
              RECORDED SAMPLES ({ (currentActiveStyle?.recordings || []).length })
            </Text>

            {/* LIST OF RECORDINGS */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 10 }}>
              {(!currentActiveStyle?.recordings || currentActiveStyle.recordings.length === 0) ? (
                <Text style={[styles.emptyText, { color: theme.subText }]}>
                  No audio samples recorded yet for this rhythm.
                </Text>
              ) : (
                currentActiveStyle.recordings.map((rec, index) => {
                  const isPlayingThis = playingUri === rec.uri;
                  return (
                    <View
                      key={rec.id || index.toString()}
                      style={[
                        styles.recordingRow,
                        { backgroundColor: isDarkMode ? '#252525' : '#F8F8F8', borderColor: theme.border },
                      ]}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={[styles.recordingTitle, { color: theme.text }]}>
                          {rec.timestamp || `Recording #${index + 1}`}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          style={[
                            styles.smallBtn,
                            { backgroundColor: isPlayingThis ? '#FF9500' : (isDarkMode ? '#FFFFFF' : '#000000') },
                          ]}
                          onPress={() => playSound(rec.uri)}>
                          <Text
                            style={{
                              color: isPlayingThis ? '#FFFFFF' : (isDarkMode ? '#000000' : '#FFFFFF'),
                              fontWeight: 'bold',
                              fontSize: 11,
                            }}>
                            {isPlayingThis ? '⏹ Stop' : '▶ Play'}
                          </Text>
                        </TouchableOpacity>

                        {onDeleteRecording ? (
                          <TouchableOpacity
                            style={[styles.smallBtn, { backgroundColor: '#FF3B301A' }]}
                            onPress={() => onDeleteRecording(currentActiveStyle.name, rec.id)}>
                            <Text style={{ color: '#FF3B30', fontSize: 12 }}>🗑️</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              onPress={() => setSelectedStyleName(null)}>
              <Text style={[styles.closeBtnText, { color: theme.text }]}>Close Player</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screenTitle: { fontSize: 20, fontWeight: '800' },
  screenSub: { fontSize: 13, marginBottom: 14 },
  dictCard: { borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 10 },
  dictTitle: { fontSize: 16, fontWeight: '700' },
  dictNotes: { fontSize: 13, fontWeight: '600' },
  dictDesc: { fontSize: 13 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  modalHeader: { fontSize: 22, fontWeight: '800' },
  inputLabel: { fontSize: 11, fontWeight: '700', marginTop: 12, marginBottom: 8, letterSpacing: 1.1 },
  actionBtn: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  recordingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  recordingTitle: { fontSize: 13, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginVertical: 20, fontSize: 14 },
  closeBtn: { borderWidth: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  closeBtnText: { fontWeight: '600', fontSize: 15 },
});
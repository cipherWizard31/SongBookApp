import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { downloadAndInstallApk } from './services/controllerApi';

export default function UpdateModal({
  visible,
  update,
  onClose,
}) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  if (!update) return null;

  async function handleInstall() {
    if (!update.storeUrl) {
      setError('No APK download URL configured for this release.');
      return;
    }
    setError(null);
    setDownloading(true);
    setProgress(0);
    try {
      await downloadAndInstallApk(update.storeUrl, (pct) => {
        setProgress(pct);
      });
    } catch (err) {
      setError(err?.message || 'Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  const pctLabel = `${Math.round(progress * 100)}%`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={update.forceUpdate ? undefined : onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Update Available (v{update.version})</Text>
          <Text style={styles.notes}>{update.releaseNotes}</Text>

          {downloading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round(progress * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>Downloading... {pctLabel}</Text>
            </View>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.actions}>
            {!update.forceUpdate && !downloading && (
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.secondaryButton]}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryText}>Later</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleInstall}
              disabled={downloading}
              style={[styles.button, styles.primaryButton]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryText}>
                {downloading ? `Installing (${pctLabel})` : 'Install Update'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#181C26',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#1E2330',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    minHeight: 44,
    minWidth: 88,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
  },
  secondaryButton: {
    backgroundColor: '#1E2330',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '500',
  },
});


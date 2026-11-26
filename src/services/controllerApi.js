import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const INSTALL_ID_KEY = '@selah_install_id';
const DICT_VERSION_KEY = '@selah_dict_version';
const DICT_SONGS_KEY = '@selah_dict_songs';

const CONTROLLER_BASE_URL =
  process.env.EXPO_PUBLIC_CONTROLLER_URL || 'http://localhost:3000';
const MOBILE_API_KEY =
  process.env.EXPO_PUBLIC_MOBILE_API_KEY || 'dev-mobile-api-key';

export function getAppVersion() {
  return Constants.expoConfig?.version || '1.0.0';
}

export function compareSemver(a, b) {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i += 1) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

export async function getOrCreateInstallId() {
  let id = await AsyncStorage.getItem(INSTALL_ID_KEY);
  if (!id) {
    id = `selah_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    await AsyncStorage.setItem(INSTALL_ID_KEY, id);
  }
  return id;
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${CONTROLLER_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': MOBILE_API_KEY,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Controller API error: ${res.status}`);
  }
  return res.json();
}

export async function sendHeartbeat() {
  const installId = await getOrCreateInstallId();
  return apiFetch('/api/mobile/heartbeat', {
    method: 'POST',
    body: JSON.stringify({
      installId,
      platform: Platform.OS,
      appVersion: getAppVersion(),
    }),
  });
}

export async function fetchRemoteConfig() {
  return apiFetch('/api/mobile/config');
}

export async function syncGlobalDictionary() {
  const cachedVersionStr = await AsyncStorage.getItem(DICT_VERSION_KEY);
  const sinceVersion = cachedVersionStr ? parseInt(cachedVersionStr, 10) : 0;
  const data = await apiFetch(
    `/api/mobile/dictionary?sinceVersion=${sinceVersion}`
  );
  if (!data.upToDate && Array.isArray(data.songs)) {
    await AsyncStorage.setItem(DICT_SONGS_KEY, JSON.stringify(data.songs));
    await AsyncStorage.setItem(DICT_VERSION_KEY, String(data.version));
    return data.songs;
  }
  const cached = await AsyncStorage.getItem(DICT_SONGS_KEY);
  return cached ? JSON.parse(cached) : [];
}

export async function downloadAndInstallApk(apkUrl, onProgress) {
  if (Platform.OS !== 'android') {
    throw new Error('APK installation is only supported on Android.');
  }
  const fileUri = `${FileSystem.cacheDirectory}selah-update.apk`;
  const downloadResumable = FileSystem.createDownloadResumable(
    apkUrl,
    fileUri,
    {},
    (progress) => {
      if (progress.totalBytesExpectedToWrite > 0) {
        const pct =
          progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
        onProgress(Math.min(1, Math.max(0, pct)));
      }
    }
  );

  const result = await downloadResumable.downloadAsync();
  if (!result?.uri) {
    throw new Error('Failed to download APK');
  }

  const contentUri = await FileSystem.getContentUriAsync(result.uri);
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
    type: 'application/vnd.android.package-archive',
  });
}


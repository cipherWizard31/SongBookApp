import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

/**
 * Handles exporting a JSON data object either via Android StorageAccessFramework (SAF)
 * or via standard Sharing.shareAsync fallback.
 */
export async function saveJsonToFile({ data, fileName, dialogTitle, successAlertTitle = 'Saved', successMessage = 'Successfully saved file:' }) {
  try {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

    if (Platform.OS === 'android' && FileSystem.StorageAccessFramework) {
      try {
        const initialUri = FileSystem.StorageAccessFramework.getUriForDirectoryInRoot('Download');
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(initialUri);

        if (permissions.granted) {
          const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            'application/json'
          );
          await FileSystem.writeAsStringAsync(destinationUri, dataString, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          Alert.alert(successAlertTitle, `${successMessage}\n${fileName}`);
          return;
        }
      } catch (safErr) {
        console.log('SAF error, falling back:', safErr);
      }
    }

    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, dataString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: dialogTitle || `Save: ${fileName}`,
        UTI: 'public.json',
      });
    } else {
      Alert.alert(successAlertTitle, `${successMessage} ${fileUri}`);
    }
  } catch (error) {
    console.error('Save file error:', error);
    Alert.alert('Save Failed', error.message || 'Failed to save file.');
  }
}

/**
 * Handles sharing a JSON data object directly to another application via standard share sheet.
 */
export async function shareJsonToApp({ data, fileName, dialogTitle }) {
  try {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const fileUri = `${FileSystem.cacheDirectory || FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, dataString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: dialogTitle || `Share: ${fileName}`,
        UTI: 'public.json',
      });
    } else {
      Alert.alert('Sharing Unavailable', `Sharing is not supported on this device. File saved to: ${fileUri}`);
    }
  } catch (error) {
    console.error('Share error:', error);
    Alert.alert('Share Failed', error.message || 'Failed to share file.');
  }
}

/**
 * Resiliently reads file content as text from any URI (file://, content://, cache, etc.)
 * Tries multiple fallbacks:
 *  1. UTF-8 read via FileSystem.readAsStringAsync
 *  2. fetch(uri).then(r => r.text())
 *  3. Base64 read via FileSystem.readAsStringAsync and decodes using global.atob / Buffer
 */
export async function readFileTextAsync(fileUri) {
  if (!fileUri) {
    throw new Error('No file URI provided.');
  }

  // Fallback 1: FileSystem legacy UTF8 read
  try {
    const text = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    if (typeof text === 'string' && text.length > 0) {
      return text;
    }
  } catch (fsErr) {
    console.warn('FileSystem.readAsStringAsync UTF8 failed, trying fetch fallback:', fsErr?.message || fsErr);
  }

  // Fallback 2: fetch API (widely supported in React Native for local / content / blob URIs)
  try {
    const response = await fetch(fileUri);
    if (response && typeof response.text === 'function') {
      const text = await response.text();
      if (typeof text === 'string' && text.length > 0) {
        return text;
      }
    }
  } catch (fetchErr) {
    console.warn('fetch fallback failed, trying base64 fallback:', fetchErr?.message || fetchErr);
  }

  // Fallback 3: FileSystem Base64 read + decode
  try {
    const b64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (b64) {
      if (typeof atob === 'function') {
        const decoded = atob(b64);
        try {
          return decodeURIComponent(escape(decoded));
        } catch {
          return decoded;
        }
      } else if (typeof Buffer !== 'undefined') {
        return Buffer.from(b64, 'base64').toString('utf8');
      }
    }
  } catch (b64Err) {
    console.warn('FileSystem Base64 read failed:', b64Err?.message || b64Err);
  }

  throw new Error('Unable to read content from the selected file.');
}

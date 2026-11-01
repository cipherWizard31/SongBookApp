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

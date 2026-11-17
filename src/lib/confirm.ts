import { Alert, Platform } from 'react-native'

export function confirmDelete(title: string, message: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onYes()
    return
  }
  Alert.alert(title, message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: onYes }])
}

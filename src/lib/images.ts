import { Directory, File, Paths } from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import { Alert, Platform } from 'react-native'
import { newId } from './types'

/** Ask for a photo from the camera or the photo library. Returns a temporary uri. */
export async function pickPhoto(source: 'camera' | 'library'): Promise<string | null> {
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.85, allowsEditing: false }
  if (source === 'camera' && Platform.OS !== 'web') {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Allow camera access in Settings to photograph your clothes.')
      return null
    }
  }
  const res = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts)
  if (res.canceled || !res.assets?.length) return null
  return res.assets[0].uri
}

type Remover = (uri: string, opts?: { trim?: boolean }) => Promise<string>

/**
 * Load the on-device background remover (iOS 17+ Vision / Android ML Kit).
 * It is a native module, so it is missing in Expo Go and on the web.
 */
function getRemover(): Remover | null {
  if (Platform.OS === 'web') return null
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@six33/react-native-bg-removal')
    return mod?.removeBackground ?? null
  } catch {
    return null
  }
}

export function isCleanupAvailable() {
  return getRemover() !== null
}

/** Remove the background on the phone. Resolves to a new uri, or null if not possible here. */
export async function cleanPhoto(uri: string): Promise<string | null> {
  const remove = getRemover()
  if (!remove) return null
  try {
    return await remove(uri, { trim: true })
  } catch (e) {
    console.warn('background removal failed', e)
    return null
  }
}

const imagesDir = () => {
  const dir = new Directory(Paths.document, 'images')
  if (!dir.exists) dir.create({ intermediates: true })
  return dir
}

/** Copy an image into the app's own storage so it survives cache clean-ups. */
export function persistImage(uri: string): string {
  if (Platform.OS === 'web') return uri
  try {
    const src = new File(uri)
    const ext = (src.extension || '.jpg').replace(/^\.?/, '.')
    const dest = new File(imagesDir(), newId() + ext)
    src.copy(dest)
    return dest.uri
  } catch (e) {
    console.warn('persist failed', e)
    return uri
  }
}

export function deleteImage(uri: string) {
  if (Platform.OS === 'web' || !uri.startsWith('file:')) return
  try {
    const f = new File(uri)
    if (f.exists) f.delete()
  } catch { /* ignore */ }
}

import * as Crypto from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { bytesToBase64 } from '@/lib/bytes';
import type { EvidenceFile } from '@/types';

import { decryptBytes, encryptBytes, sha256Hex } from './crypto';

export const MAX_EVIDENCE_BYTES = 15 * 1024 * 1024;

/** Carpeta privada de la app (no visible en Fotos ni en Archivos). */
export function evidenceDir(): Directory | null {
  if (Platform.OS === 'web') return null;
  const dir = new Directory(Paths.document, 'evidence');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export function deleteAllEvidence(): void {
  if (Platform.OS === 'web') return;
  try {
    const dir = new Directory(Paths.document, 'evidence');
    if (dir.exists) dir.delete();
  } catch {
    // ya no existe
  }
}

export type PickSource = 'photos' | 'camera' | 'files';

interface Picked {
  uri: string;
  name: string;
  mime: string;
}

async function pick(source: PickSource): Promise<Picked | 'denied' | null> {
  if (source === 'files') {
    const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
    if (res.canceled || !res.assets[0]) return null;
    const a = res.assets[0];
    return { uri: a.uri, name: a.name, mime: a.mimeType ?? 'application/octet-stream' };
  }
  const perm =
    source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return 'denied';
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1, exif: false, allowsEditing: false };
  const res = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (res.canceled || !res.assets[0]) return null;
  const a = res.assets[0];
  return { uri: a.uri, name: a.fileName ?? `captura-${Date.now()}.jpg`, mime: a.mimeType ?? 'image/jpeg' };
}

export type AttachResult = { ok: true; file: EvidenceFile } | { ok: false; reason: 'denied' | 'too-big' | 'error' } | null;

/**
 * Copia el archivo a la carpeta privada CIFRADO (AES-GCM) y calcula el SHA-256
 * del archivo ORIGINAL, para que cualquiera pueda comprobar que no fue alterado.
 */
export async function attachEvidence(incidentId: string, source: PickSource): Promise<AttachResult> {
  const dir = evidenceDir();
  if (!dir) return { ok: false, reason: 'error' };
  let picked: Picked | 'denied' | null;
  try {
    picked = await pick(source);
  } catch {
    return { ok: false, reason: 'error' };
  }
  if (picked === 'denied') return { ok: false, reason: 'denied' };
  if (!picked) return null;

  const original = new File(picked.uri);
  try {
    const bytes = await original.bytes();
    if (bytes.length > MAX_EVIDENCE_BYTES) return { ok: false, reason: 'too-big' };
    const sha256 = await sha256Hex(bytes);
    const id = Crypto.randomUUID();
    const target = new File(dir, `${id}.enc`);
    target.write(await encryptBytes(bytes));
    return {
      ok: true,
      file: {
        id,
        incidentId,
        localUri: target.uri,
        name: picked.name,
        mime: picked.mime,
        sha256,
        size: bytes.length,
        addedAt: new Date().toISOString(),
      },
    };
  } catch {
    return { ok: false, reason: 'error' };
  } finally {
    // Borrar la copia temporal que dejan los selectores en caché.
    try {
      if (original.uri.includes('/Caches/') || original.uri.includes('/cache/')) original.delete();
    } catch {
      // ignorar
    }
  }
}

export async function readEvidenceBytes(file: EvidenceFile): Promise<Uint8Array> {
  const enc = new File(file.localUri);
  return decryptBytes(await enc.text());
}

/** data: URI para miniaturas y el PDF (se crea en memoria, no en disco). */
export async function evidenceDataUri(file: EvidenceFile): Promise<string> {
  return `data:${file.mime};base64,${bytesToBase64(await readEvidenceBytes(file))}`;
}

export async function verifyEvidence(file: EvidenceFile): Promise<boolean> {
  return (await sha256Hex(await readEvidenceBytes(file))) === file.sha256;
}

export function deleteEvidenceFile(file: EvidenceFile): void {
  try {
    const f = new File(file.localUri);
    if (f.exists) f.delete();
  } catch {
    // ignorar
  }
}

/** Comparte el archivo ORIGINAL (descifrado temporalmente) para que su hash coincida. */
export async function shareOriginal(file: EvidenceFile): Promise<void> {
  const tmp = new File(Paths.cache, file.name.replace(/[^\w.\-]/g, '_'));
  try {
    if (tmp.exists) tmp.delete();
    tmp.write(await readEvidenceBytes(file));
    await Sharing.shareAsync(tmp.uri, { mimeType: file.mime });
  } finally {
    try {
      if (tmp.exists) tmp.delete();
    } catch {
      // ignorar
    }
  }
}

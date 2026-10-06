import { Contact, requestPermissionsAsync } from 'expo-contacts';
import { Platform } from 'react-native';

import { notify } from '@/lib/dialog';
import { S } from '@/lib/strings.es';

/** Abre el selector nativo de contactos. Solo lee nombre y teléfono del contacto elegido. */
export async function pickContact(): Promise<{ name: string; phone: string } | null> {
  if (Platform.OS === 'web') return null;
  try {
    const perm = await requestPermissionsAsync();
    if (!perm.granted) {
      notify(S.circle.contactsDenied);
      return null;
    }
    const contact = await Contact.presentPicker();
    if (!contact) return null;
    const [name, phones] = await Promise.all([contact.getFullName(), contact.getPhones()]);
    const phone = phones[0]?.number ?? '';
    if (!phone) notify(S.circle.noPhone);
    return { name: name ?? '', phone };
  } catch {
    notify(S.circle.contactsDenied);
    return null;
  }
}

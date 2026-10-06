import { StyleSheet, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { brand } from '@/theme';

/** Capa que tapa todo cuando la app no está activa: el app switcher no muestra contenido. */
export function PrivacyCover() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: brand.coverBg, alignItems: 'center', justifyContent: 'center' },
      ]}
    >
      <Logo size={96} mono />
    </View>
  );
}

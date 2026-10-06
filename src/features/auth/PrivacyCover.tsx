import { StyleSheet, View } from 'react-native';

import { Logo } from '@/components/Logo';

/** Capa que tapa todo cuando la app no está activa: el app switcher no muestra contenido. */
export function PrivacyCover() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, { backgroundColor: '#4C1D95', alignItems: 'center', justifyContent: 'center' }]}
    >
      <Logo size={96} mono />
    </View>
  );
}

import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import { PermissionsPanel, usePermissions } from '@/features/permissions/PermissionsPanel';
import { S } from '@/lib/strings.es';
import { spacing } from '@/theme';

/** Paso 1: permisos antes que nada (ubicación, SMS en Android y notificaciones). */
export default function PermissionsStep() {
  const perms = usePermissions();
  return (
    <OnboardingFrame
      step={1}
      canGoBack={false}
      footer={
        <Button
          label={perms.allGranted ? S.permissions.continue : S.permissions.continueMissing}
          size="lg"
          variant={perms.allGranted ? 'primary' : 'secondary'}
          onPress={() => router.push('/bienvenida')}
        />
      }
    >
      <View style={{ gap: spacing.sm }}>
        <Logo size={56} />
        <AppText variant="label" tone="textMuted" style={{ marginTop: spacing.md }}>
          {S.permissions.eyebrow}
        </AppText>
        <AppText variant="hero" accessibilityRole="header">
          {S.permissions.title}
        </AppText>
        <AppText tone="textMuted">{S.permissions.subtitle}</AppText>
      </View>
      <PermissionsPanel perms={perms} />
    </OnboardingFrame>
  );
}

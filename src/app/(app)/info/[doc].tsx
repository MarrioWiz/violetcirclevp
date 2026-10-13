import Constants from 'expo-constants';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Logo } from '@/components/Logo';
import { ScopeNotice } from '@/components/ScopeNotice';
import { Screen } from '@/components/Screen';
import { QuickExitGuide } from '@/features/auth/QuickExitGuide';
import { bundled } from '@/features/content/repository';
import { PrivacyNoticeBody } from '@/features/settings/PrivacyNoticeBody';
import { S, t } from '@/lib/strings.es';
import { spacing } from '@/theme';

export default function InfoDoc() {
  const { doc } = useLocalSearchParams<{ doc: 'privacidad' | 'alcance' | 'acerca' | 'salida-rapida' }>();

  if (doc === 'salida-rapida') {
    return (
      <Screen nav="back" title={S.quickExitGuide.title} subtitle={S.quickExitGuide.subtitle}>
        <QuickExitGuide />
      </Screen>
    );
  }

  if (doc === 'privacidad') {
    return (
      <Screen nav="back" title={bundled.legal.privacy.title}>
        <PrivacyNoticeBody />
      </Screen>
    );
  }

  if (doc === 'alcance') {
    return (
      <Screen nav="back" title={S.settings.scopeNotice}>
        <ScopeNotice full />
      </Screen>
    );
  }

  const about = bundled.legal.about;
  return (
    <Screen nav="back">
      <View style={{ alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl }}>
        <Logo size={96} />
        <AppText variant="title" center accessibilityRole="header">
          {S.appName}
        </AppText>
        <AppText variant="caption" tone="textMuted">
          {t(S.settings.version, { v: Constants.expoConfig?.version ?? '1.0.0' })}
        </AppText>
      </View>
      <Card>
        <View style={{ gap: spacing.md }}>
          {about.body.map((p) => (
            <AppText key={p}>{p}</AppText>
          ))}
        </View>
      </Card>
      <View style={{ marginTop: spacing.lg }}>
        <ScopeNotice full />
      </View>
    </Screen>
  );
}

import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Backdrop } from '@/components/ui/Backdrop';
import { QuickExitGuide } from '@/features/auth/QuickExitGuide';
import { S } from '@/lib/strings.es';
import { useSettings } from '@/store/settingsStore';
import { HAIRLINE, palette, spacing } from '@/theme';

import { PermissionsPanel, usePermissions } from './PermissionsPanel';
import { missingCritical } from './permissions';

type Page = 'perms' | 'tip';

/** "Ahora no" vale por esta sesión: en la siguiente apertura se vuelve a revisar. */
let dismissedThisSession = false;

/** Al terminar el onboarding ya se vieron los permisos: no repetir el aviso en esta sesión. */
export function skipSetupGateThisSession(): void {
  dismissedThisSession = true;
}

/**
 * Decide si hay que mostrar el aviso tras desbloquear (usuarias que ya hicieron el onboarding):
 * falta un permiso crítico o aún no vio la guía de salida rápida.
 */
export function useSetupGate(enabled: boolean): { pages: Page[]; close: () => void } {
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    if (!enabled || dismissedThisSession) return;
    let alive = true;
    void missingCritical().then((missing) => {
      if (!alive) return;
      const next: Page[] = [];
      if (missing.length) next.push('perms');
      if (!useSettings.getState().quickExitTipSeen) next.push('tip');
      setPages(next);
    });
    return () => {
      alive = false;
    };
  }, [enabled]);

  return {
    pages,
    close: () => {
      dismissedThisSession = true;
      setPages([]);
    },
  };
}

function PermsPage({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const perms = usePermissions();
  return (
    <Frame
      eyebrow={S.permissions.eyebrow}
      title={S.permissions.gateTitle}
      subtitle={S.permissions.gateSubtitle}
      footer={
        <Button
          label={perms.allGranted ? S.permissions.continue : S.permissions.notNow}
          size="lg"
          variant={perms.allGranted ? 'primary' : 'secondary'}
          onPress={perms.allGranted ? onNext : onSkip}
        />
      }
    >
      <PermissionsPanel perms={perms} />
    </Frame>
  );
}

function Frame({
  eyebrow,
  title,
  subtitle,
  footer,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      <Backdrop />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ gap: spacing.sm }}>
            <AppText variant="label" tone="textMuted">
              {eyebrow}
            </AppText>
            <AppText variant="hero" accessibilityRole="header">
              {title}
            </AppText>
            <AppText tone="textMuted">{subtitle}</AppText>
          </View>
          {children}
        </ScrollView>
        <View style={styles.footer}>{footer}</View>
      </SafeAreaView>
    </View>
  );
}

/** Capa a pantalla completa: permisos que faltan y/o la guía de salida rápida. */
export function SetupGate({ pages, close }: { pages: Page[]; close: () => void }) {
  const update = useSettings((s) => s.update);
  const [i, setI] = useState(0);
  const page = pages[i];

  const next = () => (i + 1 < pages.length ? setI(i + 1) : close());

  if (page === 'perms') return <PermsPage onNext={next} onSkip={next} />;
  return (
    <Frame
      eyebrow={S.quickExitGuide.eyebrow}
      title={S.quickExitGuide.title}
      subtitle={S.quickExitGuide.subtitle}
      footer={
        <Button
          label={S.quickExitGuide.gotIt}
          size="lg"
          onPress={() => {
            void update({ quickExitTipSeen: true });
            next();
          }}
        />
      }
    >
      <QuickExitGuide />
    </Frame>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl, gap: spacing.xl },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderTopWidth: HAIRLINE,
    borderTopColor: palette.stroke,
  },
});

import { router, useFocusEffect } from 'expo-router';
import {
  Accessibility,
  BellRing,
  CheckCircle2,
  Circle,
  MapPin,
  MessageSquareText,
  PlayCircle,
  Smartphone,
  Users,
  Volume1,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { AppState, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Divider, ListRow, SectionTitle, ToggleRow } from '@/components/Rows';
import { Screen } from '@/components/Screen';
import {
  hasPreciseLocation,
  hasSmsPermission,
  requestPreciseLocation,
  requestSmsPermission,
  sosNative,
} from '@/features/sos/sosService';
import { SIMULATED, sosSim, useWebSim } from '@/features/sos/webSimulator';
import { SimulationBanner } from '@/features/sos/SimulationBanner';
import { confirmDialog } from '@/lib/dialog';
import { S, t } from '@/lib/strings.es';
import { useCircle } from '@/store/circleStore';
import { markExternalNavigation, useSession } from '@/store/sessionStore';
import { spacing, useTheme } from '@/theme';

interface Status {
  sms: boolean;
  location: boolean;
  launcher: boolean;
  volume: boolean;
  shortcut: boolean;
}

function Requirement({
  ok,
  title,
  body,
  icon,
  onGrant,
  actionLabel,
}: {
  ok: boolean;
  actionLabel?: string;
  title: string;
  body: string;
  icon: typeof Users;
  onGrant?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <ListRow
      icon={icon}
      iconTone={ok ? 'success' : 'warning'}
      title={title}
      body={body}
      right={
        ok ? (
          <View accessibilityLabel={S.sos.granted} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={20} color={colors.success} />
          </View>
        ) : onGrant ? (
          <Button label={actionLabel ?? S.sos.grant} variant="secondary" onPress={onGrant} />
        ) : (
          <Circle size={20} color={colors.warning} />
        )
      }
    />
  );
}

/** En Android, el módulo real; en web, la simulación (misma forma). */
const native = sosNative ?? (SIMULATED ? sosSim : null);

export default function QuickHelpSetup() {
  const contacts = useCircle((s) => s.contacts.length);
  const setSosActive = useSession((s) => s.setSosActive);
  const [st, setSt] = useState<Status>({
    sms: false,
    location: false,
    launcher: false,
    volume: false,
    shortcut: false,
  });

  const refresh = useCallback(async () => {
    setSt({
      sms: SIMULATED ? useWebSim.getState().sms : await hasSmsPermission(),
      location: await hasPreciseLocation(),
      launcher: native?.isLauncherEntryEnabled() ?? false,
      volume: native?.isVolumeTriggerEnabled() ?? false,
      shortcut: native?.isIconShortcutEnabled() ?? false,
    });
  }, []);

  // Se actualiza al entrar y al volver de Ajustes de Android (p. ej. tras activar Accesibilidad).
  useFocusEffect(
    useCallback(() => {
      void refresh();
      const sub = AppState.addEventListener('change', (s) => s === 'active' && void refresh());
      return () => sub.remove();
    }, [refresh]),
  );

  // iOS nativo (sin build todavía): solo explicación.
  if (!native) {
    return (
      <Screen nav="back" title={S.sos.setupTitle} subtitle={S.sos.notSupported}>
        <View />
      </Screen>
    );
  }

  const toggleLauncher = async (on: boolean) => {
    native?.setLauncherEntryEnabled(on);
    await refresh();
    if (on) {
      await confirmDialog({
        title: S.sos.sideButtonHelpTitle,
        message: S.sos.sideButtonHelp.join('\n\n'),
        confirmLabel: S.common.done,
        cancelLabel: S.common.close,
      });
    }
  };

  const setupVolume = async () => {
    const ok = await confirmDialog({
      title: S.sos.volumeExplainTitle,
      message: S.sos.volumeExplain,
      confirmLabel: S.common.continue,
    });
    if (!ok) return;
    markExternalNavigation();
    native?.openAccessibilitySettings();
    if (SIMULATED) await refresh();
  };

  const toggleShortcut = async (on: boolean) => {
    native?.setIconShortcutEnabled(on);
    await refresh();
  };

  return (
    <Screen nav="back" title={S.sos.setupTitle} subtitle={S.sos.setupSubtitle}>
      {SIMULATED && <SimulationBanner />}
      <SectionTitle>{S.sos.requirements}</SectionTitle>
      <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
        <Requirement
          ok={contacts > 0}
          icon={Users}
          title={S.sos.reqContacts}
          body={contacts > 0 ? t(S.sos.reqContactsOk, { n: contacts }) : S.sos.reqContactsMissing}
          onGrant={contacts > 0 ? undefined : () => router.push('/circulo/nuevo')}
          actionLabel="Agregar"
        />
        <Divider />
        <Requirement
          ok={st.sms}
          icon={MessageSquareText}
          title={S.sos.reqSms}
          body={S.sos.reqSmsBody}
          onGrant={async () => {
            if (SIMULATED) useWebSim.getState().set({ sms: true });
            else await requestSmsPermission();
            await refresh();
          }}
        />
        <Divider />
        <Requirement
          ok={st.location}
          icon={MapPin}
          title={S.sos.reqLocation}
          body={S.sos.reqLocationBody}
          onGrant={async () => {
            await requestPreciseLocation();
            await refresh();
          }}
        />
      </Card>

      <SectionTitle>{S.sos.triggers}</SectionTitle>
      <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
        <ToggleRow
          icon={Smartphone}
          title={S.sos.sideButton}
          body={S.sos.sideButtonBody}
          value={st.launcher}
          onChange={(v) => void toggleLauncher(v)}
        />
        <Divider />
        <ListRow
          icon={st.volume ? Volume1 : Accessibility}
          iconTone={st.volume ? 'success' : 'primary'}
          title={S.sos.volume}
          body={st.volume ? `${S.sos.volumeOn} · ${S.sos.volumeBody}` : S.sos.volumeBody}
          onPress={() => void setupVolume()}
          accessibilityHint={S.sos.volumeSetup}
        />
        <Divider />
        <ToggleRow
          icon={BellRing}
          title={S.sos.shortcut}
          body={S.sos.shortcutBody}
          value={st.shortcut}
          onChange={(v) => void toggleShortcut(v)}
        />
      </Card>
      <AppText variant="caption" tone="textMuted" style={{ marginTop: spacing.sm }}>
        {S.sos.discreetNote}
      </AppText>

      <SectionTitle>{S.sos.test}</SectionTitle>
      <Card>
        <AppText tone="textMuted">{S.sos.testBody}</AppText>
        <Button
          label={S.sos.test}
          icon={PlayCircle}
          variant="secondary"
          style={{ marginTop: spacing.md }}
          onPress={() => setSosActive(true, 'test')}
        />
      </Card>
    </Screen>
  );
}

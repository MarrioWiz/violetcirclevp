import { router } from 'expo-router';
import {
  Bell,
  BarChart3,
  Calculator,
  Download,
  EyeOff,
  Info,
  KeyRound,
  MessageSquareHeart,
  ScanFace,
  ShieldCheck,
  Siren,
  Trash2,
  TriangleAlert,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Divider, ListRow, SectionTitle, Segmented, ToggleRow } from '@/components/Rows';
import { openExternalUrl } from '@/lib/external';
import { ScopeNotice } from '@/components/ScopeNotice';
import { Screen } from '@/components/Screen';
import { exportMyData } from '@/features/settings/exportData';
import { useWipeAllData } from '@/features/settings/useWipeAllData';
import { confirmDialog, notify } from '@/lib/dialog';
import { S, t } from '@/lib/strings.es';
import { authenticateBiometric, getBiometricInfo } from '@/services/biometrics';
import { isDiscreetIconOn, setDiscreetIcon, supportsDiscreetIcon } from '@/services/discreet';
import { cancelAllReminders, scheduleSelfCareReminder } from '@/services/notifications';
import { useSettings } from '@/store/settingsStore';
import { spacing } from '@/theme';
import type { AutoLock, TextScale, ThemePreference } from '@/types';

/** Correo del equipo para comentarios. PENDIENTE: el equipo debe definirlo. */
const FEEDBACK_EMAIL = '';

export default function SettingsScreen() {
  const s = useSettings();
  const wipe = useWipeAllData();
  const [bio, setBio] = useState<{ available: boolean; label: string }>({ available: false, label: 'Face ID' });
  const card = { paddingHorizontal: spacing.lg };

  const [iconSupported, setIconSupported] = useState(false);
  const [discreet, setDiscreet] = useState(false);

  useEffect(() => {
    void getBiometricInfo().then(setBio);
    void supportsDiscreetIcon().then(setIconSupported);
    void isDiscreetIconOn().then(setDiscreet);
  }, []);

  const toggleDiscreet = async (on: boolean) => {
    if (Platform.OS === 'android') {
      const ok = await confirmDialog({
        title: S.settings.discreetIcon,
        message: S.settings.discreetIconAndroidNote,
        confirmLabel: S.common.continue,
      });
      if (!ok) return;
    }
    if (await setDiscreetIcon(on)) setDiscreet(on);
    else notify(S.settings.discreetIconUnavailable);
  };

  const toggleBio = async (on: boolean) => {
    if (!on) return s.update({ biometrics: false });
    if (await authenticateBiometric(S.lock.biometricPrompt)) await s.update({ biometrics: true });
  };

  const toggleReminders = async (on: boolean) => {
    if (on) {
      const ok = await scheduleSelfCareReminder();
      if (!ok) return notify('Activa las notificaciones en Configuración de tu teléfono para recibir recordatorios.');
    } else {
      await cancelAllReminders();
    }
    await s.update({ selfCareReminders: on });
  };

  return (
    <Screen nav="back" title={S.settings.title}>
      <SectionTitle>{S.sos.title}</SectionTitle>
      <Card padded={false} style={card}>
        <ListRow
          icon={Siren}
          title={S.sos.setupTitle}
          body={S.sos.homeCardBody}
          onPress={() => router.push('/ajustes/ayuda-rapida')}
        />
      </Card>

      <SectionTitle>{S.settings.security}</SectionTitle>
      <Card padded={false} style={card}>
        <ListRow icon={KeyRound} title={S.settings.changePin} onPress={() => router.push('/ajustes/pin')} />
        <Divider />
        <ToggleRow
          icon={ScanFace}
          title={t(S.settings.biometrics, { method: bio.label })}
          body={bio.available ? undefined : S.settings.biometricsUnavailable}
          value={s.biometrics}
          disabled={!bio.available}
          onChange={(v) => void toggleBio(v)}
        />
        <Divider />
        <ToggleRow
          icon={EyeOff}
          title={S.settings.hidePreview}
          body={S.settings.hidePreviewBody}
          value={s.hidePreview}
          onChange={(v) => void s.update({ hidePreview: v })}
        />
        <Divider />
        <ToggleRow
          icon={Calculator}
          title={S.settings.discreetIcon}
          body={iconSupported ? S.settings.discreetIconBody : S.settings.discreetIconUnavailable}
          value={discreet}
          disabled={!iconSupported}
          onChange={(v) => void toggleDiscreet(v)}
        />
        <View style={{ paddingVertical: spacing.md, gap: spacing.sm }}>
          <AppText variant="bodyStrong">{S.settings.autolock}</AppText>
          <Segmented<AutoLock>
            label={S.settings.autolock}
            value={s.autolock}
            onChange={(v) => void s.update({ autolock: v })}
            options={(['immediate', '1m', '5m'] as AutoLock[]).map((v) => ({
              value: v,
              label: S.settings.autolockOptions[v],
            }))}
          />
        </View>
      </Card>

      <SectionTitle>{S.settings.appearance}</SectionTitle>
      <Card style={{ gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <AppText variant="bodyStrong">{S.settings.theme}</AppText>
          <Segmented<ThemePreference>
            label={S.settings.theme}
            value={s.theme}
            onChange={(v) => void s.update({ theme: v })}
            options={(['system', 'light', 'dark'] as ThemePreference[]).map((v) => ({
              value: v,
              label: S.settings.themeOptions[v],
            }))}
          />
        </View>
        <View style={{ gap: spacing.sm }}>
          <AppText variant="bodyStrong">{S.settings.textSize}</AppText>
          <Segmented<'1' | '1.15' | '1.3'>
            label={S.settings.textSize}
            value={String(s.textScale) as '1' | '1.15' | '1.3'}
            onChange={(v) => void s.update({ textScale: Number(v) as TextScale })}
            options={(['1', '1.15', '1.3'] as const).map((v) => ({ value: v, label: S.settings.textSizeOptions[v] }))}
          />
        </View>
      </Card>

      <SectionTitle>{S.settings.notifications}</SectionTitle>
      <Card padded={false} style={card}>
        <ToggleRow
          icon={Bell}
          title={S.settings.reminders}
          body={S.settings.remindersBody}
          value={s.selfCareReminders}
          onChange={(v) => void toggleReminders(v)}
        />
      </Card>

      <SectionTitle>{S.settings.data}</SectionTitle>
      <Card padded={false} style={card}>
        <ToggleRow
          icon={BarChart3}
          title={S.settings.stats}
          body={S.settings.statsBody}
          value={s.statsOptIn}
          onChange={(v) => void s.update({ statsOptIn: v })}
        />
        <Divider />
        <ListRow icon={Download} title={S.settings.exportData} onPress={() => void exportMyData()} />
        <Divider />
        <ListRow
          icon={Trash2}
          title={S.settings.deleteAll}
          body={S.settings.deleteAllBody}
          destructive
          onPress={() => void wipe()}
        />
      </Card>

      <SectionTitle>{S.settings.info}</SectionTitle>
      <Card padded={false} style={card}>
        <ListRow
          icon={ShieldCheck}
          title={S.settings.privacyNotice}
          onPress={() => router.push({ pathname: '/info/[doc]', params: { doc: 'privacidad' } })}
        />
        <Divider />
        <ListRow
          icon={TriangleAlert}
          title={S.settings.scopeNotice}
          onPress={() => router.push({ pathname: '/info/[doc]', params: { doc: 'alcance' } })}
        />
        <Divider />
        <ListRow
          icon={Info}
          title={S.settings.about}
          onPress={() => router.push({ pathname: '/info/[doc]', params: { doc: 'acerca' } })}
        />
        <Divider />
        <ListRow
          icon={MessageSquareHeart}
          title={S.settings.feedback}
          onPress={() =>
            openExternalUrl(`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('Comentarios VioletCircleVP')}`)
          }
        />
      </Card>

      <View style={{ marginTop: spacing.xl }}>
        <ScopeNotice />
      </View>
    </Screen>
  );
}

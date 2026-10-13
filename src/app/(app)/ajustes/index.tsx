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
  LogOut,
  Trash2,
  TriangleAlert,
  Type,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Expandable } from '@/components/Expandable';
import { ListRow, Segmented, ToggleRow } from '@/components/Rows';
import { openExternalUrl } from '@/lib/external';
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
import type { AutoLock, TextScale } from '@/types';

/** Correo del equipo para comentarios. PENDIENTE: el equipo debe definirlo. */
const FEEDBACK_EMAIL = '';

export default function SettingsScreen() {
  const s = useSettings();
  const wipe = useWipeAllData();
  const [bio, setBio] = useState<{ available: boolean; label: string }>({ available: false, label: 'Face ID' });

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
    <Screen nav="back" title={S.settings.title} eyebrow={S.settings.eyebrow}>
      <View style={{ gap: spacing.md }}>
        <Expandable icon={ShieldCheck} title={S.settings.security} summary={S.settings.securitySummary} defaultOpen>
          <ListRow icon={KeyRound} title={S.settings.changePin} onPress={() => router.push('/ajustes/pin')} />
          <ListRow
            icon={LogOut}
            title={S.quickExitGuide.settingsRow}
            body={S.quickExitGuide.settingsRowBody}
            onPress={() => router.push({ pathname: '/info/[doc]', params: { doc: 'salida-rapida' } })}
          />
          <ToggleRow
            icon={ScanFace}
            title={t(S.settings.biometrics, { method: bio.label })}
            body={bio.available ? undefined : S.settings.biometricsUnavailable}
            value={s.biometrics}
            disabled={!bio.available}
            onChange={(v) => void toggleBio(v)}
          />
          <ToggleRow
            icon={EyeOff}
            title={S.settings.hidePreview}
            body={S.settings.hidePreviewBody}
            value={s.hidePreview}
            onChange={(v) => void s.update({ hidePreview: v })}
          />
          {iconSupported && (
            <ToggleRow
              icon={Calculator}
              title={S.settings.discreetIcon}
              body={S.settings.discreetIconBody}
              value={discreet}
              onChange={(v) => void toggleDiscreet(v)}
            />
          )}
          <View style={{ gap: spacing.sm, paddingTop: spacing.sm }}>
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
        </Expandable>

        <Expandable icon={Type} title={S.settings.appearanceAndAlerts} summary={S.settings.appearanceSummary}>
          <View style={{ gap: spacing.sm }}>
            <AppText variant="bodyStrong">{S.settings.textSize}</AppText>
            <Segmented<'1' | '1.15' | '1.3'>
              label={S.settings.textSize}
              value={String(s.textScale) as '1' | '1.15' | '1.3'}
              onChange={(v) => void s.update({ textScale: Number(v) as TextScale })}
              options={(['1', '1.15', '1.3'] as const).map((v) => ({ value: v, label: S.settings.textSizeOptions[v] }))}
            />
          </View>
          {/* En la web del iPhone no hay notificaciones. */}
          {Platform.OS !== 'web' && (
            <ToggleRow
              icon={Bell}
              title={S.settings.reminders}
              body={S.settings.remindersBody}
              value={s.selfCareReminders}
              onChange={(v) => void toggleReminders(v)}
            />
          )}
        </Expandable>

        <Expandable icon={Download} title={S.settings.data} summary={S.settings.dataSummary}>
          <ToggleRow
            icon={BarChart3}
            title={S.settings.stats}
            body={S.settings.statsBody}
            value={s.statsOptIn}
            onChange={(v) => void s.update({ statsOptIn: v })}
          />
          <ListRow icon={Download} title={S.settings.exportData} onPress={() => void exportMyData()} />
          <ListRow
            icon={Trash2}
            title={S.settings.deleteAll}
            body={S.settings.deleteAllBody}
            destructive
            onPress={() => void wipe()}
          />
        </Expandable>

        <Expandable icon={Info} title={S.settings.info} summary={S.settings.infoSummary}>
          <ListRow
            icon={ShieldCheck}
            title={S.settings.privacyNotice}
            onPress={() => router.push({ pathname: '/info/[doc]', params: { doc: 'privacidad' } })}
          />
          <ListRow
            icon={TriangleAlert}
            title={S.settings.scopeNotice}
            onPress={() => router.push({ pathname: '/info/[doc]', params: { doc: 'alcance' } })}
          />
          <ListRow
            icon={Info}
            title={S.settings.about}
            onPress={() => router.push({ pathname: '/info/[doc]', params: { doc: 'acerca' } })}
          />
          {FEEDBACK_EMAIL ? (
            <ListRow
              icon={MessageSquareHeart}
              title={S.settings.feedback}
              onPress={() =>
                openExternalUrl(`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('Comentarios VioletCircleVP')}`)
              }
            />
          ) : null}
        </Expandable>
      </View>
    </Screen>
  );
}

import {
  Bell,
  CheckCircle2,
  MapPin,
  MessageSquareText,
  Share,
  Smartphone,
  type LucideIcon,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { IconBadge } from '@/components/IconBadge';
import { S } from '@/lib/strings.es';
import { HAIRLINE, alpha, fonts, palette, radius, spacing } from '@/theme';

import {
  checkAll,
  isIosWeb,
  isStandaloneWeb,
  openAppSettings,
  permissionsForPlatform,
  requestPermission,
  type PermKey,
  type PermState,
} from './permissions';

const ICONS: Record<PermKey, LucideIcon> = { location: MapPin, sms: MessageSquareText, notifications: Bell };

/** Estado de los permisos de esta plataforma; se vuelve a leer al regresar de Ajustes. */
export function usePermissions() {
  const keys = permissionsForPlatform();
  const [states, setStates] = useState<Partial<Record<PermKey, PermState>>>({});
  const [busy, setBusy] = useState<PermKey | null>(null);

  const refresh = useCallback(async () => setStates(await checkAll()), []);

  useEffect(() => {
    void checkAll().then(setStates);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && void refresh());
    return () => sub.remove();
  }, [refresh]);

  const act = async (key: PermKey) => {
    const current = states[key];
    if (current === 'granted') return;
    if (current === 'blocked') {
      if (!(await openAppSettings())) await refresh(); // web: solo vuelve a revisar
      return;
    }
    setBusy(key);
    try {
      const next = await requestPermission(key);
      setStates((s) => ({ ...s, [key]: next }));
    } finally {
      setBusy(null);
    }
  };

  const allGranted = keys.every((k) => states[k] === 'granted');
  return { keys, states, busy, act, refresh, allGranted };
}

function StatePill({ ok }: { ok: boolean }) {
  return ok ? (
    <View style={[styles.pill, { backgroundColor: alpha(palette.success, 0.14), borderColor: alpha(palette.success, 0.3) }]}>
      <CheckCircle2 size={14} color={palette.success} strokeWidth={2} />
      <AppText variant="caption" style={{ color: palette.success, fontFamily: fonts.semi }}>
        {S.permissions.state.granted}
      </AppText>
    </View>
  ) : null;
}

function PermissionCard({
  k,
  state,
  busy,
  onPress,
  onRecheck,
}: {
  k: PermKey;
  state: PermState | undefined;
  busy: boolean;
  onPress: () => void;
  onRecheck: () => void;
}) {
  const copy = S.permissions.items[k];
  const granted = state === 'granted';
  const web = Platform.OS === 'web';
  return (
    <Card tone={granted ? 'success' : 'surface'} accessibilityLabel={`${copy.title}. ${copy.why}`}>
      <View style={styles.head}>
        <IconBadge icon={ICONS[k]} size={44} tone={granted ? 'success' : 'accent'} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="subheading">{copy.title}</AppText>
          <AppText variant="caption" tone="textMuted">
            {copy.why}
          </AppText>
        </View>
      </View>

      {granted ? (
        <View style={styles.footer}>
          <StatePill ok />
        </View>
      ) : (
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          {state === 'denied' && (
            <AppText variant="caption" tone="warning">
              {k === 'location' && Platform.OS === 'android'
                ? S.permissions.items.location.androidPrecise
                : S.permissions.deniedNote}
            </AppText>
          )}
          {state === 'blocked' && (
            <View style={styles.steps}>
              <AppText variant="caption" tone="warning">
                {S.permissions.blockedNote}
              </AppText>
              <AppText variant="caption" tone="textMuted">
                {web
                  ? isIosWeb()
                    ? S.permissions.webBlocked
                    : S.permissions.webBlockedOther
                  : S.permissions.blockedSteps[k]}
              </AppText>
            </View>
          )}
          {state === 'undetermined' && k === 'location' && Platform.OS === 'android' && (
            <AppText variant="caption" tone="textMuted">
              {S.permissions.items.location.androidPrecise}
            </AppText>
          )}
          {state === 'blocked' && web ? (
            <Button label={S.permissions.retryCheck} variant="secondary" onPress={onRecheck} />
          ) : (
            <Button
              label={S.permissions.state[state ?? 'undetermined']}
              variant={state === 'blocked' ? 'secondary' : 'primary'}
              loading={busy}
              onPress={onPress}
            />
          )}
        </View>
      )}
    </Card>
  );
}

/** Nota informativa (sin acción) para lo que no aplica en esta plataforma. */
function InfoNote({ icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <View style={styles.note}>
      <IconBadge icon={icon} size={36} tone="primary" />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="caption" tone="textMuted">
          {body}
        </AppText>
      </View>
    </View>
  );
}

/** Tarjetas de permisos + notas según la plataforma (APK de Android vs. web en iPhone). */
export function PermissionsPanel({ perms }: { perms: ReturnType<typeof usePermissions> }) {
  const web = Platform.OS === 'web';
  const iosWeb = isIosWeb();
  return (
    <View style={{ gap: spacing.md }}>
      {perms.keys.map((k) => (
        <PermissionCard
          key={k}
          k={k}
          state={perms.states[k]}
          busy={perms.busy === k}
          onPress={() => void perms.act(k)}
          onRecheck={() => void perms.refresh()}
        />
      ))}

      {web && (
        <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
          <InfoNote icon={MessageSquareText} title={S.permissions.webSmsTitle} body={S.permissions.webSmsNote} />
          {iosWeb && <InfoNote icon={Bell} title={S.permissions.webNotifTitle} body={S.permissions.webNotifNote} />}
        </View>
      )}

      {iosWeb && !isStandaloneWeb() && (
        <Card tone="soft">
          <View style={styles.head}>
            <IconBadge icon={Smartphone} size={44} tone="primary" />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="subheading">{S.permissions.installTitle}</AppText>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs }}>
                <Share size={14} color={palette.textMuted} style={{ marginTop: 3 }} />
                <AppText variant="caption" tone="textMuted" style={{ flex: 1 }}>
                  {S.permissions.installBody}
                </AppText>
              </View>
            </View>
          </View>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.sm },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: HAIRLINE,
  },
  steps: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: palette.glass,
    borderWidth: HAIRLINE,
    borderColor: palette.stroke,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: HAIRLINE,
    borderColor: palette.stroke,
    borderStyle: 'dashed',
  },
});

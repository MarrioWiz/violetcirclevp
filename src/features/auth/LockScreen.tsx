import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Logo } from '@/components/Logo';
import { PinDots, PinPad } from '@/components/PinPad';
import { S, t } from '@/lib/strings.es';
import { authenticateBiometric, getBiometricInfo } from '@/services/biometrics';
import { getPinLength, verifyPin } from '@/services/crypto';
import { MAX_ATTEMPTS, useSession } from '@/store/sessionStore';
import { useSettings } from '@/store/settingsStore';
import { spacing, useTheme } from '@/theme';

import { useWipeAllData } from '../settings/useWipeAllData';

export function LockScreen() {
  const { colors } = useTheme();
  const unlock = useSession((s) => s.unlock);
  const registerFailure = useSession((s) => s.registerFailure);
  const failedAttempts = useSession((s) => s.failedAttempts);
  const lockoutUntil = useSession((s) => s.lockoutUntil);
  const biometricsOn = useSettings((s) => s.biometrics);
  const wipe = useWipeAllData();

  const [pin, setPin] = useState('');
  const [length, setLength] = useState(4);
  const [error, setError] = useState(false);
  const [bioLabel, setBioLabel] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const triedBio = useRef(false);

  const lockedOut = lockoutUntil > now;

  useEffect(() => {
    void getPinLength().then(setLength);
  }, []);

  useEffect(() => {
    if (!lockedOut) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lockedOut]);

  const tryBiometric = useCallback(async () => {
    if (await authenticateBiometric(S.lock.biometricPrompt)) unlock();
  }, [unlock]);

  useEffect(() => {
    if (!biometricsOn) return;
    void getBiometricInfo().then((info) => {
      if (!info.available) return;
      setBioLabel(info.label);
      if (!triedBio.current) {
        triedBio.current = true;
        void tryBiometric();
      }
    });
  }, [biometricsOn, tryBiometric]);

  const onChange = async (value: string) => {
    setError(false);
    setPin(value);
    if (value.length < length) return;
    if (await verifyPin(value)) {
      unlock();
    } else {
      registerFailure();
      setError(true);
      setTimeout(() => setPin(''), 350);
    }
  };

  const remaining = MAX_ATTEMPTS - failedAttempts;
  const seconds = Math.max(0, Math.ceil((lockoutUntil - now) / 1000));

  return (
    <SafeAreaView style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]}>
      <View style={styles.wrap}>
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <Logo size={64} />
          <AppText variant="title" center accessibilityRole="header">
            {S.lock.title}
          </AppText>
          <View style={{ minHeight: 40, justifyContent: 'center' }} accessibilityLiveRegion="polite">
            {lockedOut ? (
              <AppText tone="warning" center>
                {t(S.lock.lockedOut, { s: seconds })}
              </AppText>
            ) : error ? (
              <AppText tone="danger" center>
                {S.lock.wrong}
                {remaining <= 2 ? ` ${t(S.lock.attemptsLeft, { n: remaining })}` : ''}
              </AppText>
            ) : null}
          </View>
        </View>
        <PinDots length={length} filled={pin.length} error={error} />
        <PinPad
          value={pin}
          length={length}
          onChange={(v) => void onChange(v)}
          disabled={lockedOut}
          onBiometric={bioLabel ? () => void tryBiometric() : undefined}
          biometricLabel={bioLabel ? t(S.lock.useBiometrics, { method: bioLabel }) : undefined}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => void wipe({ fromLock: true })}
          style={{ alignSelf: 'center', padding: spacing.md, minHeight: 48, justifyContent: 'center' }}
        >
          <AppText variant="caption" tone="textMuted">
            {S.lock.forgot}
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.sm },
});

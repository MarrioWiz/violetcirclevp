import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PinDots, PinPad } from '@/components/PinPad';
import { Screen } from '@/components/Screen';
import { PinSetup } from '@/features/auth/PinSetup';
import { notify } from '@/lib/dialog';
import { S } from '@/lib/strings.es';
import { getPinLength, savePin, verifyPin } from '@/services/crypto';
import { spacing } from '@/theme';

export default function ChangePin() {
  const [verified, setVerified] = useState(false);
  const [value, setValue] = useState('');
  const [length, setLength] = useState(4);
  const [error, setError] = useState(false);

  useEffect(() => {
    void getPinLength().then(setLength);
  }, []);

  const onCurrent = async (v: string) => {
    setError(false);
    setValue(v);
    if (v.length < length) return;
    if (await verifyPin(v)) setVerified(true);
    else {
      setError(true);
      setTimeout(() => setValue(''), 300);
    }
  };

  return (
    <Screen nav="back" quickExit={false} edges={['top', 'bottom']}>
      {verified ? (
        <PinSetup
          onDone={async (pin) => {
            await savePin(pin);
            notify(S.settings.pinChanged);
            router.back();
          }}
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          <AppText variant="title" center accessibilityRole="header">
            {S.settings.changePinCurrent}
          </AppText>
          <View style={{ minHeight: 24 }} accessibilityLiveRegion="polite">
            {error ? (
              <AppText tone="danger" center>
                {S.lock.wrong}
              </AppText>
            ) : null}
          </View>
          <PinDots length={length} filled={value.length} error={error} />
          <PinPad value={value} length={length} onChange={(v) => void onCurrent(v)} />
        </View>
      )}
    </Screen>
  );
}

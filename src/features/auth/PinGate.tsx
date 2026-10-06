import { Lock } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { IconBadge } from '@/components/IconBadge';
import { PinDots, PinPad } from '@/components/PinPad';
import { S } from '@/lib/strings.es';
import { getPinLength, verifyPin } from '@/services/crypto';
import { spacing } from '@/theme';

/** Pide el PIN otra vez antes de mostrar contenido extra sensible. */
export function PinGate({ title, body, onUnlock }: { title: string; body: string; onUnlock: () => void }) {
  const [value, setValue] = useState('');
  const [length, setLength] = useState(4);
  const [error, setError] = useState(false);

  useEffect(() => {
    void getPinLength().then(setLength);
  }, []);

  const onChange = async (v: string) => {
    setError(false);
    setValue(v);
    if (v.length < length) return;
    if (await verifyPin(v)) onUnlock();
    else {
      setError(true);
      setTimeout(() => setValue(''), 300);
    }
  };

  return (
    <View style={{ gap: spacing.md, alignItems: 'stretch', paddingTop: spacing.xl }}>
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <IconBadge icon={Lock} size={64} />
        <AppText variant="title" center accessibilityRole="header">
          {title}
        </AppText>
        <AppText tone="textMuted" center>
          {body}
        </AppText>
        {error ? (
          <AppText tone="danger" center accessibilityLiveRegion="polite">
            {S.lock.wrong}
          </AppText>
        ) : null}
      </View>
      <PinDots length={length} filled={value.length} error={error} />
      <PinPad value={value} length={length} onChange={(v) => void onChange(v)} />
    </View>
  );
}

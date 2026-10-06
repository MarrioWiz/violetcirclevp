import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { PinDots, PinPad } from '@/components/PinPad';
import { S } from '@/lib/strings.es';
import { spacing } from '@/theme';

import { isTooEasy, isValidPinFormat } from './pinRules';

const MAX = 6;

/** Crear y confirmar PIN. Llama a onDone con el PIN confirmado. */
export function PinSetup({ onDone, busy }: { onDone: (pin: string) => void; busy?: boolean }) {
  const [stage, setStage] = useState<'create' | 'confirm'>('create');
  const [first, setFirst] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submitFirst = (pin: string) => {
    if (!isValidPinFormat(pin)) return;
    if (isTooEasy(pin)) {
      setError(S.onboarding.pinTooEasy);
      setValue('');
      return;
    }
    setFirst(pin);
    setValue('');
    setError(null);
    setStage('confirm');
  };

  const onChange = (v: string) => {
    setError(null);
    setValue(v);
    if (stage === 'create' && v.length === MAX) submitFirst(v);
    if (stage === 'confirm' && v.length === first.length) {
      if (v === first) onDone(v);
      else {
        setError(S.onboarding.pinMismatch);
        setStage('create');
        setFirst('');
        setTimeout(() => setValue(''), 300);
      }
    }
  };

  // Al crear, los puntos crecen para indicar que se pueden usar hasta 6 dígitos.
  const dots = stage === 'create' ? Math.min(MAX, Math.max(4, value.length + 1)) : first.length;

  return (
    <View style={{ gap: spacing.md }}>
      <AppText variant="title" center accessibilityRole="header">
        {stage === 'create' ? S.onboarding.pinTitle : S.onboarding.pinConfirmTitle}
      </AppText>
      <AppText tone="textMuted" center>
        {stage === 'create' ? S.onboarding.pinBody : S.onboarding.pinConfirmBody}
      </AppText>
      <View style={{ minHeight: 24 }} accessibilityLiveRegion="polite">
        {error ? (
          <AppText tone="danger" center>
            {error}
          </AppText>
        ) : null}
      </View>
      <PinDots length={dots} filled={value.length} error={!!error} />
      <PinPad value={value} length={stage === 'create' ? MAX : first.length} onChange={onChange} disabled={busy} />
      {stage === 'create' && value.length >= 4 && value.length < MAX ? (
        <Button label={S.onboarding.pinUse} onPress={() => submitFirst(value)} variant="secondary" style={{ marginTop: spacing.md }} />
      ) : null}
    </View>
  );
}

import { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { HAIRLINE, MIN_TOUCH, alpha, fonts, palette, radius, spacing, useTheme } from '@/theme';

import { AppText } from './AppText';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
}

/** Campo de vidrio: etiqueta mono, borde hairline que se aclara en foco con halo del acento. */
export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, hint, style, multiline, onFocus, onBlur, ...rest },
  ref,
) {
  const { colors, textScale, accent } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="label" tone="textMuted">
        {label}
      </AppText>
      <View style={[styles.halo, focused && { backgroundColor: alpha(accent, 0.1), borderColor: alpha(accent, 0.18) }]}>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          placeholderTextColor={palette.textFaint}
          selectionColor={accent}
          cursorColor={accent}
          multiline={multiline}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: focused ? palette.strokeStrong : palette.stroke,
              fontSize: 16 * textScale,
              minHeight: multiline ? 120 : MIN_TOUCH + 4,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            style,
          ]}
          {...rest}
        />
      </View>
      {error ? (
        <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" tone="textMuted">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  halo: {
    borderRadius: radius.md + 3,
    padding: 3,
    margin: -3,
    borderWidth: HAIRLINE,
    borderColor: 'transparent',
  },
  input: {
    backgroundColor: palette.glass,
    borderWidth: HAIRLINE,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: fonts.body,
  },
});

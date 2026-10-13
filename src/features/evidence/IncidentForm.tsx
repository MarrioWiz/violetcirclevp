import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, SlidersHorizontal } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { DateTimeField } from '@/components/DateTimeField';
import { Expandable } from '@/components/Expandable';
import { Chip, ToggleRow } from '@/components/Rows';
import { TextField } from '@/components/TextField';
import { S } from '@/lib/strings.es';
import { HAIRLINE, alpha, fonts, palette, radius, spacing, useTheme } from '@/theme';

import { KIND_LABEL, PLATFORM_LABEL } from './pdfHtml';
import { PLATFORM_ICON } from './platformIcons';
import { KIND_VALUES, PLATFORM_VALUES, incidentSchema, type IncidentFormValues } from './schema';

interface Props {
  defaults: IncidentFormValues;
  submitLabel: string;
  onSubmit: (v: IncidentFormValues) => Promise<void>;
  /** Texto bajo el botón (p. ej. "al guardar podrás agregar capturas"). */
  footnote?: string;
}

/** Bloque con número: guía la lectura del formulario de arriba abajo. */
function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  const { accent } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={[styles.num, { backgroundColor: alpha(accent, 0.14), borderColor: alpha(accent, 0.4) }]}>
          <AppText variant="caption" style={{ color: accent, fontFamily: fonts.bold }}>
            {n}
          </AppText>
        </View>
        <AppText variant="heading">{title}</AppText>
      </View>
      <View style={{ gap: spacing.lg }}>{children}</View>
    </View>
  );
}

/** Selector de plataforma con ícono (más fácil de reconocer que solo texto). */
function PlatformPicker({ value, onChange }: { value: string; onChange: (v: IncidentFormValues['platform']) => void }) {
  const { accent } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="bodyStrong">{S.journal.fields.platform}</AppText>
      <View style={styles.platforms}>
        {PLATFORM_VALUES.map((p) => {
          const Icon = PLATFORM_ICON[p];
          const on = value === p;
          return (
            <Pressable
              key={p}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={PLATFORM_LABEL[p]}
              onPress={() => onChange(p)}
              style={[
                styles.platform,
                on && { borderColor: alpha(accent, 0.6), backgroundColor: alpha(accent, 0.14) },
              ]}
            >
              <Icon size={20} color={on ? accent : palette.textMuted} strokeWidth={1.8} />
              <AppText variant="caption" style={{ color: on ? accent : palette.text, fontFamily: fonts.semi }}>
                {PLATFORM_LABEL[p]}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Formulario de un registro en 3 bloques: lo esencial, cuándo y dónde, y detalles opcionales
 * (plegados para no abrumar).
 */
export function IncidentForm({ defaults, submitLabel, onSubmit, footnote }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IncidentFormValues>({ resolver: zodResolver(incidentSchema), defaultValues: defaults });

  return (
    <View style={{ gap: spacing.xl }}>
      <Section n={1} title={S.journal.essentials}>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <TextField
              label={S.journal.fields.title}
              placeholder={S.journal.fields.titlePlaceholder}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.title?.message}
              maxLength={80}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextField
              label={S.journal.fields.description}
              hint={S.journal.fields.descriptionHint}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.description?.message}
              multiline
              maxLength={5000}
              style={{ minHeight: 110 }}
            />
          )}
        />
      </Section>

      <Section n={2} title={S.journal.whenWhere}>
        <Controller
          control={control}
          name="occurredAt"
          render={({ field }) => (
            <DateTimeField label={S.journal.fields.occurredAt} value={field.value} onChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="platform"
          render={({ field }) => <PlatformPicker value={field.value} onChange={field.onChange} />}
        />
      </Section>

      <Expandable icon={SlidersHorizontal} title={S.journal.optional} summary={S.journal.optionalSummary}>
        <View style={{ gap: spacing.lg }}>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <View style={{ gap: spacing.sm }}>
                <AppText variant="bodyStrong">{S.journal.fields.type}</AppText>
                <View style={styles.wrap}>
                  {KIND_VALUES.map((k) => (
                    <Chip
                      key={k}
                      label={KIND_LABEL[k]}
                      selected={field.value === k}
                      onPress={() => field.onChange(field.value === k ? undefined : k)}
                    />
                  ))}
                </View>
              </View>
            )}
          />
          <Controller
            control={control}
            name="involved"
            render={({ field }) => (
              <TextField
                label={S.journal.fields.involved}
                placeholder={S.journal.fields.involvedPlaceholder}
                value={field.value ?? ''}
                onChangeText={field.onChange}
                autoCapitalize="none"
                maxLength={300}
              />
            )}
          />
          <Controller
            control={control}
            name="linksText"
            render={({ field }) => (
              <TextField
                label={S.journal.fields.links}
                hint={S.journal.fields.linksHint}
                value={field.value ?? ''}
                onChangeText={field.onChange}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                multiline
                style={{ minHeight: 80 }}
              />
            )}
          />
          <Controller
            control={control}
            name="mood"
            render={({ field }) => (
              <View style={{ gap: spacing.sm }}>
                <AppText variant="bodyStrong">{S.journal.fields.mood}</AppText>
                <View style={styles.wrap}>
                  {S.journal.moods.map((m, i) => (
                    <Chip
                      key={m}
                      label={m}
                      selected={field.value === i + 1}
                      onPress={() => field.onChange(field.value === i + 1 ? undefined : i + 1)}
                    />
                  ))}
                </View>
              </View>
            )}
          />
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <TextField
                label={S.journal.fields.notes}
                value={field.value ?? ''}
                onChangeText={field.onChange}
                multiline
                style={{ minHeight: 80 }}
              />
            )}
          />
          <Controller
            control={control}
            name="locked"
            render={({ field }) => (
              <ToggleRow
                icon={Lock}
                title={S.journal.fields.locked}
                body={S.journal.fields.lockedBody}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </View>
      </Expandable>

      <View style={{ gap: spacing.sm }}>
        <Button label={submitLabel} size="lg" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
        {footnote ? (
          <AppText variant="caption" tone="textMuted" center>
            {footnote}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: HAIRLINE,
    borderColor: palette.stroke,
    backgroundColor: palette.glass,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  num: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  platforms: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  platform: {
    width: '31%',
    flexGrow: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: radius.md,
    borderWidth: HAIRLINE,
    borderColor: palette.stroke,
    backgroundColor: palette.glass,
  },
});

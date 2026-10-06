import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DateTimeField } from '@/components/DateTimeField';
import { Chip, ToggleRow } from '@/components/Rows';
import { TextField } from '@/components/TextField';
import { S } from '@/lib/strings.es';
import { spacing } from '@/theme';

import { KIND_LABEL, PLATFORM_LABEL } from './pdfHtml';
import { KIND_VALUES, PLATFORM_VALUES, incidentSchema, type IncidentFormValues } from './schema';

interface Props {
  defaults: IncidentFormValues;
  submitLabel: string;
  onSubmit: (v: IncidentFormValues) => Promise<void>;
}

export function IncidentForm({ defaults, submitLabel, onSubmit }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IncidentFormValues>({ resolver: zodResolver(incidentSchema), defaultValues: defaults });

  return (
    <View style={{ gap: spacing.xl }}>
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
        name="occurredAt"
        render={({ field }) => (
          <DateTimeField label={S.journal.fields.occurredAt} value={field.value} onChange={field.onChange} />
        )}
      />

      <Controller
        control={control}
        name="platform"
        render={({ field }) => (
          <View style={{ gap: spacing.sm }}>
            <AppText variant="bodyStrong">{S.journal.fields.platform}</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {PLATFORM_VALUES.map((p) => (
                <Chip
                  key={p}
                  label={PLATFORM_LABEL[p]}
                  selected={field.value === p}
                  onPress={() => field.onChange(p)}
                />
              ))}
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <View style={{ gap: spacing.sm }}>
            <AppText variant="bodyStrong">{S.journal.fields.type}</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
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
          />
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
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
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
          <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
            <ToggleRow
              icon={Lock}
              title={S.journal.fields.locked}
              body={S.journal.fields.lockedBody}
              value={field.value}
              onChange={field.onChange}
            />
          </Card>
        )}
      />

      <Button label={submitLabel} size="lg" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { BookUser } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { Platform, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Rows';
import { TextField } from '@/components/TextField';
import { S } from '@/lib/strings.es';
import { spacing } from '@/theme';
import type { ContactRole } from '@/types';

import { pickContact } from './pickContact';
import { contactSchema, type ContactForm } from './schema';

const ROLES = Object.keys(S.circle.roles) as ContactRole[];

interface Props {
  initial?: Partial<ContactForm>;
  submitLabel: string;
  onSubmit: (data: ContactForm) => Promise<void>;
}

export function ContactFormView({ initial, submitLabel, onSubmit }: Props) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: initial?.name ?? '', phone: initial?.phone ?? '', role: initial?.role },
  });

  const fromContacts = async () => {
    const picked = await pickContact();
    if (!picked) return;
    if (picked.name) setValue('name', picked.name.slice(0, 40), { shouldValidate: true });
    if (picked.phone) setValue('phone', picked.phone, { shouldValidate: true });
  };

  return (
    <View style={{ gap: spacing.lg }}>
      {Platform.OS !== 'web' && (
        <Button label={S.circle.fromContacts} icon={BookUser} variant="secondary" onPress={() => void fromContacts()} />
      )}
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextField
            label={S.circle.name}
            placeholder={S.circle.namePlaceholder}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.name?.message}
            autoCapitalize="words"
            maxLength={40}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <TextField
            label={S.circle.phone}
            placeholder={S.circle.phonePlaceholder}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.phone?.message}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
          />
        )}
      />
      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <View style={{ gap: spacing.sm }}>
            <AppText variant="bodyStrong">{S.circle.role}</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {ROLES.map((r) => (
                <Chip
                  key={r}
                  label={S.circle.roles[r]}
                  selected={field.value === r}
                  onPress={() => field.onChange(field.value === r ? undefined : r)}
                />
              ))}
            </View>
          </View>
        )}
      />
      <Button label={submitLabel} size="lg" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

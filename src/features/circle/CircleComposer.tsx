import { router } from 'expo-router';
import { Check, Copy, MapPin, MessageCircle, MessageSquareText } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Chip, SectionTitle, ToggleRow } from '@/components/Rows';
import { TextField } from '@/components/TextField';
import { bundled } from '@/features/content/repository';
import { notify } from '@/lib/dialog';
import { S } from '@/lib/strings.es';
import { useCircle } from '@/store/circleStore';
import { MIN_TOUCH, radius, spacing, useTheme } from '@/theme';

import { buildAlertMessage, recipients } from './message';
import { copyText, getApproxLocation, openSmsComposer, openWhatsApp } from './sendToCircle';

interface Props {
  initialTemplateId?: string;
  /** Se llama cuando ella abre Mensajes/WhatsApp (para la bitácora local). */
  onOpened?: (channel: 'sms' | 'whatsapp') => void;
  preselectId?: string;
}

export function CircleComposer({ initialTemplateId = 'pedir-apoyo', onOpened, preselectId }: Props) {
  const { colors } = useTheme();
  const contacts = useCircle((s) => s.contacts);
  const templates = bundled.templates;
  const [selected, setSelected] = useState<string[]>(() => (preselectId ? [preselectId] : contacts.map((c) => c.id)));
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [text, setText] = useState(templates.find((t) => t.id === initialTemplateId)?.body ?? S.alert.defaultMessage);
  const [withLocation, setWithLocation] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [copied, setCopied] = useState(false);

  const finalText = useMemo(() => buildAlertMessage(text, withLocation ? location : null), [text, withLocation, location]);

  if (contacts.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title={S.alert.noContacts}
        body={S.circle.emptyBody}
        actionLabel={S.alert.noContactsAction}
        onAction={() => router.push('/circulo/nuevo')}
      />
    );
  }

  const toggleLocation = async (on: boolean) => {
    setWithLocation(on);
    if (!on || location) return;
    setLocating(true);
    const res = await getApproxLocation();
    setLocating(false);
    if (res === 'denied') {
      setWithLocation(false);
      notify(S.alert.locationDenied);
    } else if (!res) {
      setWithLocation(false);
      notify(S.alert.locationError);
    } else {
      setLocation(res);
    }
  };

  const sendSms = async () => {
    if (!selected.length) return notify(S.alert.selectAtLeastOne);
    if (await openSmsComposer(recipients(contacts, selected), finalText)) onOpened?.('sms');
  };

  const sendWhatsApp = async () => {
    const phone = selected.length === 1 ? contacts.find((c) => c.id === selected[0])?.phone : undefined;
    if (await openWhatsApp(finalText, phone)) onOpened?.('whatsapp');
  };

  return (
    <View>
      <SectionTitle>{S.alert.who}</SectionTitle>
      <View style={{ gap: spacing.sm }}>
        {contacts.map((c) => {
          const on = selected.includes(c.id);
          return (
            <Pressable
              key={c.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={c.name}
              onPress={() => setSelected((s) => (on ? s.filter((x) => x !== c.id) : [...s, c.id]))}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                minHeight: MIN_TOUCH + 8,
                paddingHorizontal: spacing.lg,
                borderRadius: radius.md,
                borderWidth: 1.5,
                borderColor: on ? colors.primary : colors.border,
                backgroundColor: on ? colors.primarySoft : colors.surface,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: on ? colors.primary : 'transparent',
                  borderWidth: 2,
                  borderColor: on ? colors.primary : colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {on ? <Check size={14} color={colors.onPrimary} strokeWidth={3} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">{c.name}</AppText>
                {c.role ? (
                  <AppText variant="caption" tone="textMuted">
                    {S.circle.roles[c.role]}
                  </AppText>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle>{S.alert.templates}</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {templates.map((t) => (
          <Chip
            key={t.id}
            label={t.title}
            selected={templateId === t.id}
            onPress={() => {
              setTemplateId(t.id);
              setText(t.body);
            }}
          />
        ))}
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <TextField label={S.alert.message} value={text} onChangeText={setText} multiline maxLength={500} />
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        <ToggleRow
          icon={MapPin}
          title={S.alert.location}
          body={locating ? S.common.loading : S.alert.locationHint}
          value={withLocation}
          onChange={(v) => void toggleLocation(v)}
        />
      </Card>

      <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
        <Button label={S.alert.sendSms} icon={MessageSquareText} size="lg" onPress={() => void sendSms()} />
        <Button label={S.alert.sendWhatsApp} icon={MessageCircle} variant="secondary" onPress={() => void sendWhatsApp()} />
        <Button
          label={copied ? S.alert.copied : S.alert.copy}
          icon={copied ? Check : Copy}
          variant="ghost"
          onPress={() => {
            void copyText(finalText).then(() => setCopied(true));
          }}
        />
        <AppText variant="caption" tone="textMuted" center>
          {S.alert.manualNote}
        </AppText>
      </View>
    </View>
  );
}

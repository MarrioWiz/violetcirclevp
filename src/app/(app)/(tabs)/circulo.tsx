import { router } from 'expo-router';
import { HeartHandshake, Lock, MessageSquareText, Pencil, Phone, Trash2, UserPlus, Users } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ListRow, SectionTitle } from '@/components/Rows';
import { tabMeta } from '@/components/dock/tabs';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/ui/Avatar';
import { callNumber } from '@/features/emergency/call';
import { confirmDialog } from '@/lib/dialog';
import { S, t } from '@/lib/strings.es';
import { MAX_CONTACTS, useCircle } from '@/store/circleStore';
import { HAIRLINE, MIN_TOUCH, alpha, fonts, palette, spacing, useTheme } from '@/theme';
import type { CircleContact } from '@/types';

function IconAction({
  icon: Icon,
  label,
  onPress,
  danger,
}: {
  icon: typeof Phone;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const { colors, accent } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => ({
        width: MIN_TOUCH,
        height: MIN_TOUCH,
        borderRadius: MIN_TOUCH / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: danger ? colors.dangerSoft : palette.glassStrong,
        borderWidth: HAIRLINE,
        borderColor: danger ? alpha(palette.danger, 0.3) : palette.stroke,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon size={19} color={danger ? colors.danger : accent} strokeWidth={1.75} />
    </Pressable>
  );
}

function ContactCard({ c }: { c: CircleContact }) {
  const remove = useCircle((s) => s.remove);
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Avatar name={c.name} />
        <View style={{ flex: 1 }}>
          <AppText variant="bodyStrong">{c.name}</AppText>
          <AppText variant="caption" tone="textMuted">
            {c.role ? `${S.circle.roles[c.role]} · ` : ''}
            {c.phone}
          </AppText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, justifyContent: 'flex-end' }}>
        <IconAction
          icon={MessageSquareText}
          label={`${S.circle.message} a ${c.name}`}
          onPress={() => router.push({ pathname: '/alerta', params: { to: c.id } })}
        />
        <IconAction icon={Phone} label={`${S.circle.call} a ${c.name}`} onPress={() => void callNumber(c.phone)} />
        <IconAction
          icon={Pencil}
          label={`${S.common.edit} ${c.name}`}
          onPress={() => router.push({ pathname: '/circulo/nuevo', params: { id: c.id } })}
        />
        <IconAction
          icon={Trash2}
          danger
          label={`${S.common.delete} ${c.name}`}
          onPress={async () => {
            const ok = await confirmDialog({
              title: t(S.circle.deleteTitle, { name: c.name }),
              message: S.circle.deleteBody,
              confirmLabel: S.common.delete,
              destructive: true,
            });
            if (ok) await remove(c.id);
          }}
        />
      </View>
    </Card>
  );
}

export default function CircleTab() {
  const meta = tabMeta('circulo');
  const { colors } = useTheme();
  const contacts = useCircle((s) => s.contacts);
  const full = contacts.length >= MAX_CONTACTS;

  return (
    <Screen dock title={meta.title} subtitle={meta.subtitle}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
        <Lock size={16} color={colors.success} />
        <AppText variant="caption" tone="success" style={{ fontFamily: fonts.semi }}>
          {S.circle.localOnly}
        </AppText>
      </View>

      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title={S.circle.emptyTitle}
          body={S.circle.emptyBody}
          actionLabel={S.circle.add}
          onAction={() => router.push('/circulo/nuevo')}
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          <AppText variant="caption" tone="textMuted">
            {t(S.circle.count, { n: contacts.length, max: MAX_CONTACTS })}
          </AppText>
          {contacts.map((c) => (
            <ContactCard key={c.id} c={c} />
          ))}
          {full ? (
            <AppText variant="caption" tone="textMuted" center>
              {S.circle.full}
            </AppText>
          ) : (
            <Button
              label={S.circle.add}
              icon={UserPlus}
              variant="outline"
              onPress={() => router.push('/circulo/nuevo')}
            />
          )}
        </View>
      )}

      <SectionTitle>{S.circle.howToSupport}</SectionTitle>
      <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
        <ListRow
          icon={HeartHandshake}
          title={S.circle.howToSupport}
          body={S.circle.howToSupportBody}
          onPress={() => router.push('/circulo/acompanar')}
        />
      </Card>
    </Screen>
  );
}

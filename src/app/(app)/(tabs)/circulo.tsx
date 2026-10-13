import { router } from 'expo-router';
import { ChevronRight, Lock, MessageSquareText, Pencil, Phone, Send, Trash2, UserPlus, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ActionSheet } from '@/components/ActionSheet';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Divider, SectionTitle } from '@/components/Rows';
import { tabMeta } from '@/components/dock/tabs';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/ui/Avatar';
import { callNumber } from '@/features/emergency/call';
import { confirmDialog } from '@/lib/dialog';
import { S, t } from '@/lib/strings.es';
import { MAX_CONTACTS, useCircle } from '@/store/circleStore';
import { MIN_TOUCH, spacing, useTheme } from '@/theme';
import type { CircleContact } from '@/types';

function ContactRow({ c, onPress }: { c: CircleContact; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${c.name}. ${c.role ? S.circle.roles[c.role] : ''} ${c.phone}`}
      accessibilityHint="Abre opciones: llamar, escribir, editar o quitar"
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Avatar name={c.name} />
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong">{c.name}</AppText>
        <AppText variant="caption" tone="textMuted">
          {c.role ? `${S.circle.roles[c.role]} · ` : ''}
          {c.phone}
        </AppText>
      </View>
      <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.75} />
    </Pressable>
  );
}

/** Círculo: UNA acción principal (avisar). Cada persona abre sus opciones en una hoja. */
export default function CircleTab() {
  const meta = tabMeta('circulo');
  const { colors } = useTheme();
  const contacts = useCircle((s) => s.contacts);
  const remove = useCircle((s) => s.remove);
  const [selected, setSelected] = useState<CircleContact | null>(null);
  const full = contacts.length >= MAX_CONTACTS;

  const confirmRemove = async (c: CircleContact) => {
    const ok = await confirmDialog({
      title: t(S.circle.deleteTitle, { name: c.name }),
      message: S.circle.deleteBody,
      confirmLabel: S.common.delete,
      destructive: true,
    });
    if (ok) await remove(c.id);
  };

  return (
    <Screen dock title={meta.title} subtitle={meta.subtitle}>
      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title={S.circle.emptyTitle}
          body={S.circle.emptyBody}
          actionLabel={S.circle.add}
          onAction={() => router.push('/circulo/nuevo')}
        />
      ) : (
        <>
          <Button
            label={S.circle.notify}
            icon={Send}
            size="lg"
            accessibilityHint={S.circle.notifyBody}
            onPress={() => router.push({ pathname: '/alerta', params: { compose: '1' } })}
          />

          <SectionTitle>{`${S.circle.people} · ${t(S.circle.count, { n: contacts.length, max: MAX_CONTACTS })}`}</SectionTitle>
          <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
            {contacts.map((c, i) => (
              <View key={c.id}>
                {i > 0 && <Divider />}
                <ContactRow c={c} onPress={() => setSelected(c)} />
              </View>
            ))}
          </Card>

          {full ? (
            <AppText variant="caption" tone="textMuted" center style={{ marginTop: spacing.md }}>
              {S.circle.full}
            </AppText>
          ) : (
            <Button
              label={S.circle.add}
              icon={UserPlus}
              variant="ghost"
              style={{ marginTop: spacing.sm }}
              onPress={() => router.push('/circulo/nuevo')}
            />
          )}
        </>
      )}

      <View style={styles.privacy}>
        <Lock size={14} color={colors.success} />
        <AppText variant="caption" tone="textMuted" style={{ flex: 1 }}>
          {S.circle.localOnly}
        </AppText>
      </View>

      <ActionSheet
        visible={!!selected}
        onClose={() => setSelected(null)}
        header={
          selected ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Avatar name={selected.name} />
              <View>
                <AppText variant="heading">{selected.name}</AppText>
                <AppText variant="caption" tone="textMuted">
                  {selected.phone}
                </AppText>
              </View>
            </View>
          ) : null
        }
        actions={
          selected
            ? [
                { label: S.circle.call, icon: Phone, onPress: () => void callNumber(selected.phone) },
                {
                  label: S.circle.message,
                  icon: MessageSquareText,
                  onPress: () => router.push({ pathname: '/alerta', params: { to: selected.id } }),
                },
                {
                  label: S.common.edit,
                  icon: Pencil,
                  onPress: () => router.push({ pathname: '/circulo/nuevo', params: { id: selected.id } }),
                },
                { label: S.common.delete, icon: Trash2, destructive: true, onPress: () => void confirmRemove(selected) },
              ]
            : []
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: MIN_TOUCH + 16 },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xxl },
});

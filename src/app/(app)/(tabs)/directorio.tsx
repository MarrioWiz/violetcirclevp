import { router } from 'expo-router';
import { Phone, ShieldQuestion, WifiOff } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { Expandable } from '@/components/Expandable';
import { Chip } from '@/components/Rows';
import { tabMeta } from '@/components/dock/tabs';
import { Screen } from '@/components/Screen';
import { call911, callNumber } from '@/features/emergency/call';
import { DIRECTORY_TYPES, pendingCount, visibleEntries } from '@/features/directory/filter';
import { S } from '@/lib/strings.es';
import { useContent } from '@/store/contentStore';
import { HAIRLINE, MIN_TOUCH, alpha, palette, radius, spacing, useTheme } from '@/theme';
import type { DirectoryEntry, DirectoryType } from '@/types';

function EntryCard({ e }: { e: DirectoryEntry }) {
  const { accent } = useTheme();
  const emergency = e.type === 'emergencia';
  const tint = emergency ? palette.danger : accent;
  return (
    <Card>
      <View style={styles.entry}>
        {/* Dos zonas tocables separadas (en web un botón no puede ir dentro de otro). */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${e.name}. ${S.directory.types[e.type]}`}
          accessibilityHint="Abre los detalles"
          onPress={() => router.push({ pathname: '/directorio/[id]', params: { id: e.id } })}
          style={({ pressed }) => ({ flex: 1, gap: 2, opacity: pressed ? 0.7 : 1 })}
        >
          <AppText variant="label" tone="textMuted" style={{ fontSize: 10 }}>
            {S.directory.types[e.type]}
          </AppText>
          <AppText variant="subheading">{e.name}</AppText>
          {e.whatToExpect ? (
            <AppText variant="caption" tone="textMuted" numberOfLines={3} style={{ marginTop: 2 }}>
              {e.whatToExpect}
            </AppText>
          ) : null}
          {e.hours ? (
            <AppText variant="caption" style={{ color: tint, marginTop: 2 }} numberOfLines={1}>
              {e.hours}
            </AppText>
          ) : null}
        </Pressable>
        {e.phone ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${S.directory.call} ${e.name}`}
            hitSlop={6}
            onPress={() => void (emergency ? call911() : callNumber(e.phone!))}
            style={({ pressed }) => [
              styles.call,
              { backgroundColor: alpha(tint, 0.14), borderColor: alpha(tint, 0.3), opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Phone size={20} color={tint} strokeWidth={1.9} />
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

/** Apoyo: lista verificada con filtro; llamar es la acción principal de cada tarjeta. */
export default function DirectoryTab() {
  const meta = tabMeta('directorio');
  const { colors } = useTheme();
  const entries = useContent((s) => s.directory);
  const offline = useContent((s) => s.offline);
  const [filter, setFilter] = useState<DirectoryType | 'all'>('all');

  const all = visibleEntries(entries, 'all');
  const types = DIRECTORY_TYPES.filter((ty) => all.some((e) => e.type === ty));
  const visible = visibleEntries(entries, filter);
  const pending = pendingCount(entries);

  return (
    <Screen dock title={meta.title} subtitle={meta.subtitle} footer={<EmergencyBanner />}>
      <AppText tone="textMuted" style={{ marginBottom: spacing.lg }}>
        {S.directory.intro}
      </AppText>

      {offline && (
        <View style={styles.offline}>
          <WifiOff size={14} color={colors.warning} />
          <AppText variant="caption" tone="textMuted" style={{ flex: 1 }}>
            {S.directory.offline}
          </AppText>
        </View>
      )}

      {types.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.xl }}
          style={{ marginHorizontal: -spacing.xl, paddingLeft: spacing.xl, marginBottom: spacing.lg }}
        >
          <Chip label={S.directory.all} selected={filter === 'all'} onPress={() => setFilter('all')} />
          {types.map((type) => (
            <Chip key={type} label={S.directory.types[type]} selected={filter === type} onPress={() => setFilter(type)} />
          ))}
        </ScrollView>
      )}

      <View style={{ gap: spacing.md }}>
        {visible.length === 0 ? (
          <AppText tone="textMuted" center style={{ paddingVertical: spacing.xl }}>
            {S.directory.emptyFilter}
          </AppText>
        ) : (
          visible.map((e) => <EntryCard key={e.id} e={e} />)
        )}
      </View>

      {pending > 0 && (
        <View style={{ marginTop: spacing.xl }}>
          <Expandable icon={ShieldQuestion} title={S.directory.pendingTitle}>
            <AppText variant="caption" tone="textMuted">
              {S.directory.pendingBody}
            </AppText>
          </Expandable>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  entry: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  call: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: MIN_TOUCH / 2,
    borderWidth: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderWidth: HAIRLINE,
    borderColor: alpha(palette.warning, 0.25),
  },
});

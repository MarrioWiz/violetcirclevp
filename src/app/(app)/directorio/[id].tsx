import { useLocalSearchParams } from 'expo-router';
import { BadgeCheck, Clock, Globe, Mail, MapPin, Phone, ShieldQuestion } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ListRow } from '@/components/Rows';
import { openExternalUrl } from '@/lib/external';
import { Screen } from '@/components/Screen';
import { isPublishable } from '@/features/directory/filter';
import { call911, callNumber } from '@/features/emergency/call';
import { S, t } from '@/lib/strings.es';
import { useContent } from '@/store/contentStore';
import { spacing, useTheme } from '@/theme';

export default function DirectoryDetail() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = useContent((s) => s.directory.find((e) => e.id === id));

  // Doble candado: aunque llegue por enlace directo, una entrada no verificada no se muestra.
  if (!entry || !isPublishable(entry)) {
    return (
      <Screen nav="back">
        <EmptyState icon={ShieldQuestion} title={S.directory.pendingTitle} body={S.directory.pendingBody} />
      </Screen>
    );
  }

  const isEmergency = entry.type === 'emergencia';

  return (
    <Screen nav="back">
      <AppText variant="label" tone={isEmergency ? 'danger' : 'primary'}>
        {S.directory.types[entry.type]}
      </AppText>
      <AppText variant="title" accessibilityRole="header" style={{ marginTop: spacing.xs }}>
        {entry.name}
      </AppText>
      <AppText tone="textMuted" style={{ marginTop: spacing.sm }}>
        {entry.description}
      </AppText>

      {entry.phone ? (
        <Button
          label={`${S.directory.call} ${entry.phone}`}
          icon={Phone}
          size="lg"
          variant={isEmergency ? 'danger' : 'primary'}
          style={{ marginTop: spacing.xl }}
          onPress={() => void (isEmergency ? call911() : callNumber(entry.phone!))}
        />
      ) : null}

      <Card style={{ marginTop: spacing.xl }}>
        <AppText variant="heading" accessibilityRole="header">
          {S.directory.whatToExpect}
        </AppText>
        <AppText style={{ marginTop: spacing.sm }}>{entry.whatToExpect}</AppText>
      </Card>

      <Card padded={false} style={{ marginTop: spacing.lg, paddingHorizontal: spacing.lg }}>
        {entry.hours ? <ListRow icon={Clock} title={S.directory.hours} body={entry.hours} /> : null}
        {entry.email ? (
          <ListRow
            icon={Mail}
            title={S.directory.email}
            body={entry.email}
            onPress={() => openExternalUrl(`mailto:${entry.email}`)}
          />
        ) : null}
        {entry.url ? (
          <ListRow icon={Globe} title={S.directory.web} body={entry.url} onPress={() => openExternalUrl(entry.url!)} />
        ) : null}
        {entry.address ? (
          <ListRow
            icon={MapPin}
            title={S.directory.address}
            body={entry.address}
            onPress={() => openExternalUrl(`https://maps.google.com/?q=${encodeURIComponent(entry.address!)}`)}
          />
        ) : null}
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginTop: spacing.xl }}>
        <BadgeCheck size={18} color={colors.success} />
        <View style={{ flex: 1 }}>
          <AppText variant="caption" tone="success">
            {t(S.directory.verifiedOn, { date: entry.verifiedAt ?? '' })}
          </AppText>
          <AppText variant="caption" tone="textMuted">
            {t(S.directory.source, { source: entry.source ?? '' })}
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

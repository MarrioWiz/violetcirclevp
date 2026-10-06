import { router } from 'expo-router';
import { ChevronRight, Clock, Phone, ShieldQuestion, WifiOff } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { Chip, ListRow, SectionTitle } from '@/components/Rows';
import { tabMeta } from '@/components/dock/tabs';
import { Screen } from '@/components/Screen';
import { FileCard } from '@/components/ui/FileCard';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { iconFor } from '@/components/icons';
import { DIRECTORY_TYPES, pendingCount, visibleEntries } from '@/features/directory/filter';
import { S } from '@/lib/strings.es';
import { useContent } from '@/store/contentStore';
import { palette, spacing, useTheme } from '@/theme';
import type { DirectoryType } from '@/types';

export default function DirectoryTab() {
  const meta = tabMeta('directorio');
  const { colors } = useTheme();
  const entries = useContent((s) => s.directory);
  const guides = useContent((s) => s.guides);
  const offline = useContent((s) => s.offline);
  const [filter, setFilter] = useState<DirectoryType | 'all'>('all');

  const visible = visibleEntries(entries, filter);
  const pending = pendingCount(entries);
  const platformGuides = guides.filter((g) => g.category === 'plataforma');

  return (
    <Screen
      dock
      title={meta.title}
      subtitle={meta.subtitle}
      eyebrow="Directorio verificado"
      footer={<EmergencyBanner />}
    >
      {offline && (
        <Card tone="warning" style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
            <WifiOff size={18} color={colors.warning} />
            <AppText variant="caption" tone="warning" style={{ flex: 1 }}>
              {S.directory.offline}
            </AppText>
          </View>
        </Card>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.xl }}
        style={{ marginHorizontal: -spacing.xl, paddingLeft: spacing.xl, marginBottom: spacing.lg }}
      >
        <Chip label={S.directory.all} selected={filter === 'all'} onPress={() => setFilter('all')} />
        {DIRECTORY_TYPES.map((type) => (
          <Chip key={type} label={S.directory.types[type]} selected={filter === type} onPress={() => setFilter(type)} />
        ))}
      </ScrollView>

      {filter !== 'plataformas' && (
        <View style={{ gap: spacing.md }}>
          {visible.length === 0 ? (
            <Card>
              <AppText tone="textMuted" center>
                {S.directory.emptyFilter}
              </AppText>
            </Card>
          ) : (
            visible.map((e) => {
              const emergency = e.type === 'emergencia';
              return (
                <FileCard
                  key={e.id}
                  name={S.directory.types[e.type].toLowerCase()}
                  meta={e.scope.toUpperCase()}
                  accent={emergency ? palette.danger : undefined}
                  onPress={() => router.push({ pathname: '/directorio/[id]', params: { id: e.id } })}
                  accessibilityLabel={`${e.name}. ${S.directory.types[e.type]}. ${e.description}`}
                >
                  <AppText variant="heading">{e.name}</AppText>
                  <AppText variant="caption" tone="textMuted" numberOfLines={2}>
                    {e.description}
                  </AppText>
                  <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm, flexWrap: 'wrap' }}>
                    {e.phone ? (
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        <Phone size={14} color={emergency ? palette.danger : colors.textMuted} />
                        <AppText variant="mono" tone={emergency ? 'danger' : 'textMuted'}>
                          {e.phone}
                        </AppText>
                      </View>
                    ) : null}
                    {e.hours ? (
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        <Clock size={14} color={colors.textMuted} />
                        <AppText variant="caption" tone="textMuted">
                          {e.hours}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md }}>
                    <View style={{ flex: 1 }}>
                      <VerifiedBadge date={e.verifiedAt} />
                    </View>
                    <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.75} />
                  </View>
                </FileCard>
              );
            })
          )}
        </View>
      )}

      {(filter === 'all' || filter === 'plataformas') && (
        <>
          <SectionTitle>{S.directory.platformGuides}</SectionTitle>
          <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
            {platformGuides.map((g) => (
              <ListRow
                key={g.slug}
                icon={iconFor(g.icon)}
                title={g.title}
                body={g.summary}
                onPress={() => router.push({ pathname: '/guia/[slug]', params: { slug: g.slug } })}
              />
            ))}
          </Card>
        </>
      )}

      {pending > 0 && (
        <Card tone="soft" style={{ marginTop: spacing.xl }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <ShieldQuestion size={22} color={colors.primaryDark} />
            <View style={{ flex: 1, gap: spacing.xs }}>
              <AppText variant="subheading" tone="primaryDark">
                {S.directory.pendingTitle}
              </AppText>
              <AppText variant="caption" tone="primaryDark">
                {S.directory.pendingBody}
              </AppText>
            </View>
          </View>
        </Card>
      )}
    </Screen>
  );
}

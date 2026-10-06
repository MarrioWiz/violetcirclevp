import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { router } from 'expo-router';
import { FileDown, Lock, NotebookPen, Paperclip, Plus, Search, Siren } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Chip } from '@/components/Rows';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { PLATFORM_LABEL } from '@/features/evidence/pdfHtml';
import { PLATFORM_VALUES } from '@/features/evidence/schema';
import { S } from '@/lib/strings.es';
import { useIncidents } from '@/store/incidentsStore';
import { spacing, useTheme } from '@/theme';
import type { Platform } from '@/types';

export default function JournalIndex() {
  const { colors } = useTheme();
  const incidents = useIncidents((s) => s.incidents);
  const files = useIncidents((s) => s.files);
  const [q, setQ] = useState('');
  const [platform, setPlatform] = useState<Platform | 'all'>('all');

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...incidents]
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .filter((i) => platform === 'all' || i.platform === platform)
      .filter((i) => {
        if (!needle) return true;
        // Las entradas bloqueadas solo se buscan por título, para no revelar contenido.
        const hay = i.locked ? i.title : `${i.title} ${i.description} ${i.involved ?? ''} ${i.notes ?? ''}`;
        return hay.toLowerCase().includes(needle);
      });
  }, [incidents, q, platform]);

  return (
    <Screen
      nav="back"
      title={S.journal.title}
      subtitle={S.journal.subtitle}
      footer={
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button label={S.journal.new} icon={Plus} onPress={() => router.push('/bitacora/nueva')} style={{ flex: 1 }} />
          {incidents.length > 0 && (
            <Button label={S.journal.exportPdf} icon={FileDown} variant="secondary" onPress={() => router.push('/bitacora/exportar')} style={{ flex: 1 }} />
          )}
        </View>
      }
    >
      {incidents.length === 0 ? (
        <EmptyState icon={NotebookPen} title={S.journal.emptyTitle} body={S.journal.emptyBody} />
      ) : (
        <>
          <TextField label={S.journal.search} value={q} onChangeText={setQ} placeholder="…" returnKeyType="search" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -spacing.xl, marginTop: spacing.md }}
            contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.xl }}
          >
            <Chip label={S.journal.allPlatforms} selected={platform === 'all'} onPress={() => setPlatform('all')} />
            {PLATFORM_VALUES.map((p) => (
              <Chip key={p} label={PLATFORM_LABEL[p]} selected={platform === p} onPress={() => setPlatform(p)} />
            ))}
          </ScrollView>

          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            {list.length === 0 ? (
              <EmptyState icon={Search} title={S.journal.noResults} />
            ) : (
              list.map((i) => {
                const count = files.filter((f) => f.incidentId === i.id).length;
                const when = format(new Date(i.occurredAt), "d MMM yyyy · HH:mm", { locale: es });
                return (
                  <Card
                    key={i.id}
                    onPress={() => router.push({ pathname: '/bitacora/[id]', params: { id: i.id } })}
                    accessibilityLabel={`${i.title}. ${when}. ${PLATFORM_LABEL[i.platform]}${i.locked ? '. Protegida' : ''}`}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      {i.isAlertLog ? <Siren size={16} color={colors.primary} /> : null}
                      <AppText variant="caption" tone="textMuted" style={{ flex: 1 }}>
                        {when} · {PLATFORM_LABEL[i.platform]}
                      </AppText>
                      {i.locked ? <Lock size={16} color={colors.textMuted} /> : null}
                    </View>
                    <AppText variant="subheading" style={{ marginTop: spacing.xs }}>
                      {i.title}
                    </AppText>
                    {!i.locked && (
                      <AppText variant="caption" tone="textMuted" numberOfLines={2} style={{ marginTop: 2 }}>
                        {i.description}
                      </AppText>
                    )}
                    {count > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm }}>
                        <Paperclip size={14} color={colors.primary} />
                        <AppText variant="caption" tone="primary">
                          {count} {count === 1 ? 'archivo' : 'archivos'}
                        </AppText>
                      </View>
                    )}
                  </Card>
                );
              })
            )}
          </View>
        </>
      )}
    </Screen>
  );
}

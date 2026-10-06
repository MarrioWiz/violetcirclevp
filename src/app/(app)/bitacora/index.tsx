import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { router } from 'expo-router';
import { FileDown, Lock, NotebookPen, Paperclip, Plus, Search, Siren } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Chip } from '@/components/Rows';
import { Screen } from '@/components/Screen';
import { FileCard } from '@/components/ui/FileCard';
import { TextField } from '@/components/TextField';
import { PLATFORM_LABEL } from '@/features/evidence/pdfHtml';
import { PLATFORM_VALUES } from '@/features/evidence/schema';
import { S } from '@/lib/strings.es';
import { useIncidents } from '@/store/incidentsStore';
import { HAIRLINE, alpha, palette, spacing, useTheme } from '@/theme';
import type { Platform } from '@/types';

export default function JournalIndex() {
  const { colors, accent } = useTheme();
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
          <Button
            label={S.journal.new}
            icon={Plus}
            onPress={() => router.push('/bitacora/nueva')}
            style={{ flex: 1 }}
          />
          {incidents.length > 0 && (
            <Button
              label={S.journal.exportPdf}
              icon={FileDown}
              variant="secondary"
              onPress={() => router.push('/bitacora/exportar')}
              style={{ flex: 1 }}
            />
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

          <View style={{ marginTop: spacing.xl }}>
            {list.length === 0 ? (
              <EmptyState icon={Search} title={S.journal.noResults} />
            ) : (
              list.map((i, idx) => {
                const count = files.filter((f) => f.incidentId === i.id).length;
                const when = format(new Date(i.occurredAt), 'd MMM yyyy · HH:mm', { locale: es });
                const last = idx === list.length - 1;
                return (
                  // Línea de tiempo: línea hairline vertical con puntos del acento.
                  <View key={i.id} style={styles.tlRow}>
                    <View style={styles.tlRail}>
                      <View style={[styles.tlDot, { backgroundColor: accent, borderColor: alpha(accent, 0.35) }]} />
                      {!last && <View style={styles.tlLine} />}
                    </View>
                    <View style={{ flex: 1, paddingBottom: spacing.lg }}>
                      <FileCard
                        name={PLATFORM_LABEL[i.platform].toLowerCase()}
                        meta={when.toUpperCase()}
                        onPress={() => router.push({ pathname: '/bitacora/[id]', params: { id: i.id } })}
                        accessibilityLabel={`${i.title}. ${when}. ${PLATFORM_LABEL[i.platform]}${i.locked ? '. Protegida' : ''}`}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                          {i.isAlertLog ? <Siren size={16} color={accent} strokeWidth={1.75} /> : null}
                          <AppText variant="subheading" style={{ flex: 1 }}>
                            {i.title}
                          </AppText>
                          {i.locked ? <Lock size={16} color={colors.textMuted} strokeWidth={1.75} /> : null}
                        </View>
                        {!i.locked && (
                          <AppText variant="caption" tone="textMuted" numberOfLines={2}>
                            {i.description}
                          </AppText>
                        )}
                        {count > 0 && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm }}>
                            <Paperclip size={14} color={accent} strokeWidth={1.75} />
                            <AppText variant="mono" accent>
                              {count} {count === 1 ? 'ARCHIVO' : 'ARCHIVOS'}
                            </AppText>
                          </View>
                        )}
                      </FileCard>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tlRow: { flexDirection: 'row', gap: spacing.md },
  tlRail: { width: 14, alignItems: 'center', paddingTop: 18 },
  tlDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 3 },
  tlLine: { flex: 1, width: HAIRLINE, backgroundColor: palette.strokeStrong, marginTop: 4 },
});

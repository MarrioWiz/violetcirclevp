import { format, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { router } from 'expo-router';
import { Camera, CheckCircle2, ChevronRight, FileDown, Lock, NotebookPen, Plus, Search, Siren } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Expandable } from '@/components/Expandable';
import { IconBadge } from '@/components/IconBadge';
import { Chip } from '@/components/Rows';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { KIND_LABEL, PLATFORM_LABEL } from '@/features/evidence/pdfHtml';
import { PLATFORM_ICON } from '@/features/evidence/platformIcons';
import { PLATFORM_VALUES } from '@/features/evidence/schema';
import { S, t } from '@/lib/strings.es';
import { useIncidents } from '@/store/incidentsStore';
import { HAIRLINE, alpha, fonts, palette, radius, spacing, useTheme } from '@/theme';
import type { Incident, Platform } from '@/types';

/** Consejos para que una captura sirva como prueba. */
function CaptureTips({ open }: { open: boolean }) {
  return (
    <Expandable icon={Camera} title={S.journal.tipsTitle} summary={S.journal.tipsSummary} defaultOpen={open}>
      {S.journal.tips.map((tip) => (
        <View key={tip} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
          <CheckCircle2 size={18} color={palette.success} strokeWidth={1.9} style={{ marginTop: 2 }} />
          <AppText style={{ flex: 1 }}>{tip}</AppText>
        </View>
      ))}
    </Expandable>
  );
}

function EntryCard({ i, files }: { i: Incident; files: number }) {
  const { accent } = useTheme();
  const Icon = i.isAlertLog ? Siren : (PLATFORM_ICON[i.platform] ?? NotebookPen);
  const date = new Date(i.occurredAt);
  const ago = formatDistanceToNowStrict(date, { locale: es, addSuffix: true });
  const time = format(date, "d 'de' MMM · HH:mm", { locale: es });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${i.title}. ${time}. ${PLATFORM_LABEL[i.platform]}${i.locked ? `. ${S.journal.locked}` : ''}`}
      onPress={() => router.push({ pathname: '/bitacora/[id]', params: { id: i.id } })}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
    >
      <IconBadge icon={Icon} size={44} />
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <AppText variant="subheading" numberOfLines={1} style={{ flex: 1 }}>
            {i.title}
          </AppText>
          {i.locked ? <Lock size={15} color={palette.textMuted} strokeWidth={1.8} /> : null}
        </View>
        <AppText variant="caption" tone="textMuted">
          {PLATFORM_LABEL[i.platform]} · {time} · {ago}
        </AppText>
        {(i.type || files > 0) && (
          <View style={styles.tags}>
            {i.type ? (
              <View style={[styles.tag, { borderColor: alpha(accent, 0.35) }]}>
                <AppText variant="caption" style={{ color: accent, fontSize: 11, fontFamily: fonts.semi }}>
                  {KIND_LABEL[i.type] ?? i.type}
                </AppText>
              </View>
            ) : null}
            {files > 0 ? (
              <View style={styles.tag}>
                <AppText variant="caption" tone="textMuted" style={{ fontSize: 11 }}>
                  {t(S.journal.captures, { n: files })}
                </AppText>
              </View>
            ) : null}
          </View>
        )}
      </View>
      <ChevronRight size={18} color={palette.textMuted} strokeWidth={1.75} />
    </Pressable>
  );
}

/** Mis registros: consejos de captura, lista agrupada por mes y un botón claro para crear. */
export default function JournalIndex() {
  const incidents = useIncidents((s) => s.incidents);
  const files = useIncidents((s) => s.files);
  const [q, setQ] = useState('');
  const [platform, setPlatform] = useState<Platform | 'all'>('all');

  const used = PLATFORM_VALUES.filter((p) => incidents.some((i) => i.platform === p));

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = [...incidents]
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .filter((i) => platform === 'all' || i.platform === platform)
      .filter((i) => {
        if (!needle) return true;
        // Los registros protegidos solo se buscan por título, para no revelar contenido.
        const hay = i.locked ? i.title : `${i.title} ${i.description} ${i.involved ?? ''} ${i.notes ?? ''}`;
        return hay.toLowerCase().includes(needle);
      });
    const out: { month: string; items: Incident[] }[] = [];
    for (const i of list) {
      const raw = format(new Date(i.occurredAt), 'MMMM yyyy', { locale: es });
      const month = raw.charAt(0).toUpperCase() + raw.slice(1);
      const last = out[out.length - 1];
      if (last?.month === month) last.items.push(i);
      else out.push({ month, items: [i] });
    }
    return out;
  }, [incidents, q, platform]);

  return (
    <Screen
      nav="back"
      title={S.journal.title}
      subtitle={S.journal.subtitle}
      footer={
        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
          <Button label={S.journal.new} icon={Plus} onPress={() => router.push('/bitacora/nueva')} style={{ flex: 1 }} />
          {incidents.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={S.journal.exportPdf}
              onPress={() => router.push('/bitacora/exportar')}
              style={({ pressed }) => [styles.exportBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <FileDown size={20} color={palette.text} strokeWidth={1.8} />
            </Pressable>
          )}
        </View>
      }
    >
      <CaptureTips open={incidents.length === 0} />

      {incidents.length === 0 ? (
        <EmptyState icon={NotebookPen} title={S.journal.emptyTitle} body={S.journal.emptyBody} />
      ) : (
        <>
          {incidents.length >= 4 && (
            <View style={{ marginTop: spacing.lg }}>
              <TextField label={S.journal.search} value={q} onChangeText={setQ} returnKeyType="search" />
            </View>
          )}
          {used.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -spacing.xl, marginTop: spacing.md }}
              contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.xl }}
            >
              <Chip label={S.journal.allPlatforms} selected={platform === 'all'} onPress={() => setPlatform('all')} />
              {used.map((p) => (
                <Chip key={p} label={PLATFORM_LABEL[p]} selected={platform === p} onPress={() => setPlatform(p)} />
              ))}
            </ScrollView>
          )}

          {groups.length === 0 ? (
            <EmptyState icon={Search} title={S.journal.noResults} />
          ) : (
            groups.map((g) => (
              <View key={g.month} style={{ marginTop: spacing.xl, gap: spacing.sm }}>
                <AppText variant="label" tone="textMuted">
                  {g.month}
                </AppText>
                {g.items.map((i) => (
                  <EntryCard key={i.id} i={i} files={files.filter((f) => f.incidentId === i.id).length} />
                ))}
              </View>
            ))
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: HAIRLINE,
    borderColor: palette.stroke,
    backgroundColor: palette.glass,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
  },
  exportBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.glassStrong,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
  },
});

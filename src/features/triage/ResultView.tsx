import { router } from 'expo-router';
import {
  BookOpen,
  Check,
  ChevronRight,
  LifeBuoy,
  NotebookPen,
  Phone,
  Scale,
  ShieldAlert,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Expandable } from '@/components/Expandable';
import { IconBadge } from '@/components/IconBadge';
import { Divider } from '@/components/Rows';
import { call911 } from '@/features/emergency/call';
import { KIND_VALUES } from '@/features/evidence/schema';
import { S, t } from '@/lib/strings.es';
import { HAIRLINE, MIN_TOUCH, alpha, fonts, palette, radius, spacing, useTheme } from '@/theme';

import type { ResolvedResult } from './engine';

export const PLATFORM_NAMES: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  otra: 'correo u otras apps',
};

/** Color de cada nivel: lila (te afecta), ámbar (violencia), coral (puede ser delito). */
const LEVEL_COLOR = [palette.violetLight, palette.warning, palette.danger];

export function UrgentBlock() {
  return (
    <Card tone="danger" accessibilityLabel={`${S.triage.urgentTitle}. ${S.triage.urgentBody}`}>
      <View style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
          <ShieldAlert size={22} color={palette.danger} />
          <AppText variant="heading">{S.triage.urgentTitle}</AppText>
        </View>
        <AppText>{S.triage.urgentBody}</AppText>
        <Button label={S.emergency.call911} variant="danger" icon={Phone} size="lg" onPress={() => void call911()} />
        <Button label={S.triage.goCircle} variant="secondary" icon={Users} onPress={() => router.push('/alerta')} />
      </View>
    </Card>
  );
}

/** Medidor de 3 niveles con etiquetas: se ilumina hasta el nivel del resultado. */
function LevelMeter({ level }: { level: 1 | 2 | 3 }) {
  const color = LEVEL_COLOR[level - 1];
  return (
    <View
      accessible
      accessibilityLabel={`${S.triage.levelLabel}: ${S.triage.levels[level - 1]}`}
      style={{ gap: spacing.sm, marginTop: spacing.lg }}
    >
      <AppText variant="label" tone="textMuted">
        {S.triage.levelLabel}
      </AppText>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {S.triage.levels.map((label, i) => {
          const on = i < level;
          const current = i === level - 1;
          return (
            <View key={label} style={{ flex: 1, gap: 6 }}>
              <View style={[styles.seg, { backgroundColor: on ? color : palette.glassStrong }]} />
              <AppText
                variant="caption"
                style={{
                  fontSize: 11,
                  color: current ? color : palette.textMuted,
                  fontFamily: current ? fonts.bold : fonts.body,
                }}
              >
                {label}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Paso del plan: se marca con palomita (sin tachar). Vive solo en pantalla. */
function PlanStep({ n, text, done, onToggle }: { n: number; text: string; done: boolean; onToggle: () => void }) {
  const { accent } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={text}
      onPress={onToggle}
      style={({ pressed }) => [styles.planRow, { opacity: pressed ? 0.75 : 1 }]}
    >
      <View
        style={[
          styles.planNum,
          done
            ? { backgroundColor: palette.success, borderColor: palette.success }
            : { backgroundColor: alpha(accent, 0.12), borderColor: alpha(accent, 0.45) },
        ]}
      >
        {done ? (
          <Check size={15} color={palette.bg0} strokeWidth={3} />
        ) : (
          <AppText variant="caption" style={{ color: accent, fontFamily: fonts.bold }}>
            {n}
          </AppText>
        )}
      </View>
      <AppText style={{ flex: 1 }}>{text}</AppText>
    </Pressable>
  );
}

function NextRow({ icon, title, body, onPress }: { icon: LucideIcon; title: string; body?: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={body ? `${title}. ${body}` : title}
      onPress={onPress}
      style={({ pressed }) => [styles.nextRow, { opacity: pressed ? 0.7 : 1 }]}
    >
      <IconBadge icon={icon} size={40} />
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong">{title}</AppText>
        {body ? (
          <AppText variant="caption" tone="textMuted">
            {body}
          </AppText>
        ) : null}
      </View>
      <ChevronRight size={18} color={palette.textMuted} strokeWidth={1.75} />
    </Pressable>
  );
}

interface Props {
  resolved: ResolvedResult;
  /** Lo que eligió en cada pregunta (para recordárselo). */
  answers: string[];
  onChange: () => void;
}

export function ResultView({ resolved, answers, onChange }: Props) {
  const { accent } = useTheme();
  const { result, extras, platform } = resolved;
  const level = result.level ?? (result.urgent ? 3 : 2);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const doneCount = result.doNow.filter((_, i) => done[i]).length;

  const saveCase = () => {
    const kind = (KIND_VALUES as readonly string[]).includes(result.kind) ? result.kind : undefined;
    router.push({
      pathname: '/bitacora/nueva',
      params: {
        title: t(S.triage.caseTitle, { title: result.title }).slice(0, 80),
        ...(platform ? { platform } : {}),
        ...(kind ? { type: kind } : {}),
      },
    });
  };

  return (
    <View style={{ gap: spacing.lg }}>
      {result.urgent && <UrgentBlock />}

      {/* Qué es y qué tan serio */}
      <Card tone="strong">
        <AppText variant="caption" tone="textMuted">
          {S.triage.resultLead}
        </AppText>
        <AppText variant="title" accessibilityRole="header" style={{ marginTop: spacing.xs, color: accent }}>
          {result.title}
        </AppText>
        <LevelMeter level={level as 1 | 2 | 3} />
        <AppText style={{ marginTop: spacing.lg }}>{result.explanation}</AppText>
        <AppText variant="bodyStrong" style={{ marginTop: spacing.md }}>
          {S.triage.notYourFault}
        </AppText>
      </Card>

      {/* Lo que contestó */}
      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <AppText variant="label" tone="textMuted">
            {S.triage.youTold}
          </AppText>
          <Pressable accessibilityRole="button" onPress={onChange} hitSlop={8}>
            <AppText variant="caption" style={{ color: accent, fontFamily: fonts.semi }}>
              {S.triage.change}
            </AppText>
          </Pressable>
        </View>
        <View style={styles.chips}>
          {answers.map((a) => (
            <View key={a} style={styles.chip}>
              <AppText variant="caption">{a}</AppText>
            </View>
          ))}
        </View>
      </View>

      {extras.map((e) => (
        <Card key={e} tone="soft">
          <AppText>{e}</AppText>
        </Card>
      ))}

      {/* Plan marcable */}
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <AppText variant="heading" accessibilityRole="header">
            {S.triage.plan}
          </AppText>
          <AppText variant="caption" style={{ color: doneCount ? palette.success : palette.textMuted }}>
            {t(S.triage.planProgress, { done: doneCount, total: result.doNow.length })}
          </AppText>
        </View>
        <AppText variant="caption" tone="textMuted" style={{ marginTop: 2, marginBottom: spacing.md }}>
          {S.triage.planHint}
        </AppText>
        <View style={{ gap: spacing.sm }}>
          {result.doNow.map((step, i) => (
            <PlanStep key={step} n={i + 1} text={step} done={!!done[i]} onToggle={() => setDone((d) => ({ ...d, [i]: !d[i] }))} />
          ))}
        </View>
      </Card>

      <Expandable icon={ShieldAlert} title={S.triage.dontDo} summary={result.dontDo[0]}>
        {result.dontDo.map((d) => (
          <AppText key={d}>• {d}</AppText>
        ))}
      </Expandable>

      {result.law ? (
        <Expandable icon={Scale} title={S.triage.law} summary={S.triage.levels[level - 1]}>
          <AppText>{result.law}</AppText>
          <AppText variant="caption" tone="textMuted">
            {S.triage.lawNote}
          </AppText>
        </Expandable>
      ) : null}

      {/* Siguiente paso principal + otros */}
      <View style={{ gap: spacing.xs }}>
        <Button label={S.triage.saveCase} icon={NotebookPen} size="lg" onPress={saveCase} />
        <AppText variant="caption" tone="textMuted" center>
          {S.triage.saveCaseBody}
        </AppText>
      </View>

      <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
        <NextRow
          icon={Sparkles}
          title={S.triage.askVi}
          body={S.triage.askViBody}
          onPress={() => router.push({ pathname: '/asistente', params: { tema: result.kind } })}
        />
        <Divider />
        <NextRow icon={LifeBuoy} title={S.triage.whereToGo} body={S.triage.whereToGoBody} onPress={() => router.push('/directorio')} />
        {platform ? (
          <>
            <Divider />
            <NextRow
              icon={BookOpen}
              title={t(S.triage.goPlatform, { platform: PLATFORM_NAMES[platform] ?? platform })}
              onPress={() => router.push({ pathname: '/guia/[slug]', params: { slug: `plataforma-${platform}` } })}
            />
          </>
        ) : null}
        {!result.urgent && (
          <>
            <Divider />
            <NextRow icon={Users} title={S.triage.goCircle} onPress={() => router.push('/alerta')} />
          </>
        )}
      </Card>

      <AppText variant="caption" tone="textMuted">
        {S.triage.disclaimer}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  seg: { height: 6, borderRadius: 3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
    backgroundColor: palette.glass,
  },
  planRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    minHeight: MIN_TOUCH - 8,
    paddingVertical: spacing.xs,
  },
  planNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: MIN_TOUCH + 12 },
});

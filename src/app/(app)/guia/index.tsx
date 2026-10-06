import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { iconFor } from '@/components/icons';
import { ListRow, SectionTitle } from '@/components/Rows';
import { Screen } from '@/components/Screen';
import { S, t } from '@/lib/strings.es';
import { checklistKey, useChecklist } from '@/store/checklistStore';
import { useContent } from '@/store/contentStore';
import { spacing } from '@/theme';
import type { Guide } from '@/types';

function useProgress(guide: Guide) {
  const done = useChecklist((s) => s.done);
  const items = guide.sections.flatMap((s) => s.items);
  return { done: items.filter((i) => done[checklistKey(guide.slug, i.id)]).length, total: items.length };
}

function GuideRow({ guide }: { guide: Guide }) {
  const p = useProgress(guide);
  return (
    <ListRow
      icon={iconFor(guide.icon)}
      title={guide.title}
      body={p.done > 0 ? `${guide.summary} · ${t(S.guides.progress, { done: p.done, total: p.total })}` : guide.summary}
      onPress={() => router.push({ pathname: '/guia/[slug]', params: { slug: guide.slug } })}
    />
  );
}

export default function GuidesIndex() {
  const guides = useContent((s) => s.guides);
  const firstSteps = guides.filter((g) => g.category === 'primeros-pasos');
  const platforms = guides.filter((g) => g.category === 'plataforma');
  const routes = guides.filter((g) => g.category === 'rutas');

  return (
    <Screen nav="back" title={S.guides.title} subtitle={S.guides.subtitle}>
      <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
        {firstSteps.map((g) => (
          <GuideRow key={g.slug} guide={g} />
        ))}
      </Card>

      <SectionTitle>{S.guides.platformsTitle}</SectionTitle>
      <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
        {platforms.map((g) => (
          <GuideRow key={g.slug} guide={g} />
        ))}
      </Card>

      <SectionTitle>Rutas formales</SectionTitle>
      <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
        {routes.map((g) => (
          <GuideRow key={g.slug} guide={g} />
        ))}
      </Card>

      <View style={{ marginTop: spacing.xl }}>
        <AppText variant="caption" tone="textMuted" center>
          {S.common.draftBadge}: el equipo está revisando estos textos.
        </AppText>
      </View>
    </Screen>
  );
}

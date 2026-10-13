import { router } from 'expo-router';
import { ClipboardCheck, HeartHandshake, Star } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Expandable } from '@/components/Expandable';
import { IconBadge } from '@/components/IconBadge';
import { iconFor } from '@/components/icons';
import { Divider, ListRow, Segmented } from '@/components/Rows';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { S, t } from '@/lib/strings.es';
import { checklistKey, useChecklist } from '@/store/checklistStore';
import { useContent } from '@/store/contentStore';
import { spacing, useTheme } from '@/theme';
import type { Article, Guide } from '@/types';

type Tab = 'guias' | 'lecturas';

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function GuideRow({ guide }: { guide: Guide }) {
  const done = useChecklist((s) => s.done);
  const items = guide.sections.flatMap((s) => s.items);
  const n = items.filter((i) => done[checklistKey(guide.slug, i.id)]).length;
  return (
    <ListRow
      icon={iconFor(guide.icon)}
      title={guide.title}
      body={n > 0 ? t(S.guides.progress, { done: n, total: items.length }) : guide.summary}
      onPress={() => router.push({ pathname: '/guia/[slug]', params: { slug: guide.slug } })}
    />
  );
}

function GuideList({ guides }: { guides: Guide[] }) {
  return (
    <>
      {guides.map((g, i) => (
        <View key={g.slug}>
          {i > 0 && <Divider />}
          <GuideRow guide={g} />
        </View>
      ))}
    </>
  );
}

function ArticleRow({ a, fav }: { a: Article; fav: boolean }) {
  const { accent } = useTheme();
  return (
    <Card
      onPress={() => router.push({ pathname: '/aprende/[slug]', params: { slug: a.slug } })}
      accessibilityLabel={`${a.title}. ${a.summary}. ${t(S.learn.minutes, { n: a.minutes })}`}
    >
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
        <IconBadge icon={iconFor(a.icon)} size={40} />
        <View style={{ flex: 1 }}>
          <AppText variant="subheading">{a.title}</AppText>
          <AppText variant="caption" tone="textMuted">
            {t(S.learn.minutes, { n: a.minutes })}
          </AppText>
        </View>
        {fav ? <Star size={16} color={accent} fill={accent} /> : null}
      </View>
    </Card>
  );
}

/**
 * Biblioteca: el único lugar para guías, lecturas, autoevaluación y "Cómo acompañar".
 * (Antes estaban repartidas entre Inicio, Más, Círculo y Apoyo.)
 */
export default function Library() {
  const [tab, setTab] = useState<Tab>('guias');
  const guides = useContent((s) => s.guides);
  const articles = useContent((s) => s.articles);
  const favorites = useChecklist((s) => s.favorites);
  const [q, setQ] = useState('');

  const byCat = (c: Guide['category']) => guides.filter((g) => g.category === c);
  const filtered = useMemo(() => {
    const n = normalize(q.trim());
    const list = n
      ? articles.filter((a) => normalize(`${a.title} ${a.summary} ${a.body.join(' ')} ${a.keyPoints.join(' ')}`).includes(n))
      : articles;
    // Favoritos primero.
    return [...list].sort((a, b) => Number(favorites.includes(b.slug)) - Number(favorites.includes(a.slug)));
  }, [articles, favorites, q]);

  return (
    <Screen nav="back" title={S.library.title} subtitle={S.library.subtitle}>
      <Segmented<Tab>
        label={S.library.title}
        value={tab}
        onChange={setTab}
        options={[
          { value: 'guias', label: S.library.tabGuides },
          { value: 'lecturas', label: S.library.tabReads },
        ]}
      />

      {tab === 'guias' ? (
        <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
          <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
            <GuideList guides={byCat('primeros-pasos')} />
          </Card>
          <Expandable title={S.library.platforms} summary="WhatsApp, Instagram, TikTok, Facebook…">
            <GuideList guides={byCat('plataforma')} />
          </Expandable>
          <Expandable title={S.library.routes} summary="Denuncia, institución, UVP">
            <GuideList guides={byCat('rutas')} />
          </Expandable>
          <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
            <ListRow
              icon={HeartHandshake}
              title={S.library.support}
              body={S.circle.howToSupportBody}
              onPress={() => router.push('/circulo/acompanar')}
            />
          </Card>
          <AppText variant="caption" tone="textMuted" center style={{ marginTop: spacing.sm }}>
            {S.common.draftBadge}
          </AppText>
        </View>
      ) : (
        <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
          <TextField label={S.learn.search} value={q} onChangeText={setQ} returnKeyType="search" />
          {!q && (
            <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
              <ListRow
                icon={ClipboardCheck}
                title={S.learn.audit}
                body={S.learn.auditBody}
                onPress={() => router.push('/aprende/autoevaluacion')}
              />
            </Card>
          )}
          {filtered.length === 0 ? (
            <EmptyState icon={ClipboardCheck} title={S.learn.noResults} />
          ) : (
            filtered.map((a) => <ArticleRow key={a.slug} a={a} fav={favorites.includes(a.slug)} />)
          )}
        </View>
      )}
    </Screen>
  );
}

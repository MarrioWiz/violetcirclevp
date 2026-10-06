import { router } from 'expo-router';
import { ClipboardCheck, Star } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { IconBadge } from '@/components/IconBadge';
import { iconFor } from '@/components/icons';
import { ListRow, SectionTitle } from '@/components/Rows';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { S, t } from '@/lib/strings.es';
import { useChecklist } from '@/store/checklistStore';
import { useContent } from '@/store/contentStore';
import { spacing, useTheme } from '@/theme';
import type { Article } from '@/types';

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function ArticleCard({ a, fav }: { a: Article; fav: boolean }) {
  const { colors } = useTheme();
  return (
    <Card
      onPress={() => router.push({ pathname: '/aprende/[slug]', params: { slug: a.slug } })}
      accessibilityLabel={`${a.title}. ${a.summary}`}
    >
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
        <IconBadge icon={iconFor(a.icon)} />
        <View style={{ flex: 1 }}>
          <AppText variant="subheading">{a.title}</AppText>
          <AppText variant="caption" tone="textMuted">
            {a.summary} · {t(S.learn.minutes, { n: a.minutes })}
          </AppText>
        </View>
        {fav ? <Star size={18} color={colors.primary} fill={colors.primary} /> : null}
      </View>
    </Card>
  );
}

export default function LearnIndex() {
  const articles = useContent((s) => s.articles);
  const favorites = useChecklist((s) => s.favorites);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const n = normalize(q.trim());
    if (!n) return articles;
    return articles.filter((a) =>
      normalize(`${a.title} ${a.summary} ${a.body.join(' ')} ${a.keyPoints.join(' ')}`).includes(n),
    );
  }, [articles, q]);
  const favs = articles.filter((a) => favorites.includes(a.slug));

  return (
    <Screen nav="back" title={S.learn.title} subtitle={S.learn.subtitle}>
      <TextField label={S.learn.search} value={q} onChangeText={setQ} returnKeyType="search" />

      {!q && (
        <Card padded={false} style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <ListRow
            icon={ClipboardCheck}
            title={S.learn.audit}
            body={S.learn.auditBody}
            onPress={() => router.push('/aprende/autoevaluacion')}
          />
        </Card>
      )}

      {!q && favs.length > 0 && (
        <>
          <SectionTitle>{S.learn.favorites}</SectionTitle>
          <View style={{ gap: spacing.md }}>
            {favs.map((a) => (
              <ArticleCard key={a.slug} a={a} fav />
            ))}
          </View>
        </>
      )}

      <SectionTitle>{S.learn.all}</SectionTitle>
      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title={S.learn.noResults} />
      ) : (
        <View style={{ gap: spacing.md }}>
          {filtered.map((a) => (
            <ArticleCard key={a.slug} a={a} fav={favorites.includes(a.slug)} />
          ))}
        </View>
      )}
    </Screen>
  );
}

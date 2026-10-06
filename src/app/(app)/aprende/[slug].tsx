import { useLocalSearchParams } from 'expo-router';
import { CheckCircle2, FileQuestion, Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { IconBadge } from '@/components/IconBadge';
import { iconFor } from '@/components/icons';
import { Screen } from '@/components/Screen';
import { S, t } from '@/lib/strings.es';
import { useChecklist } from '@/store/checklistStore';
import { useContent } from '@/store/contentStore';
import { MIN_TOUCH, spacing, useTheme } from '@/theme';

export default function ArticleDetail() {
  const { colors } = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = useContent((s) => s.articles.find((a) => a.slug === slug));
  const isFav = useChecklist((s) => s.favorites.includes(slug ?? ''));
  const toggleFavorite = useChecklist((s) => s.toggleFavorite);

  if (!article) {
    return (
      <Screen nav="back">
        <EmptyState icon={FileQuestion} title={S.learn.noResults} />
      </Screen>
    );
  }

  return (
    <Screen
      nav="back"
      headerRight={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFav ? S.learn.unfavorite : S.learn.favorite}
          accessibilityState={{ selected: isFav }}
          onPress={() => void toggleFavorite(article.slug)}
          style={{ width: MIN_TOUCH - 4, height: MIN_TOUCH - 4, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: colors.surfaceAlt }}
        >
          <Star size={20} color={colors.primary} fill={isFav ? colors.primary : 'transparent'} />
        </Pressable>
      }
    >
      <IconBadge icon={iconFor(article.icon)} size={64} />
      <AppText variant="title" accessibilityRole="header" style={{ marginTop: spacing.lg }}>
        {article.title}
      </AppText>
      <AppText variant="caption" tone="textMuted" style={{ marginTop: spacing.xs }}>
        {t(S.learn.minutes, { n: article.minutes })}
        {article.reviewStatus === 'borrador' ? ` · ${S.common.draftBadge}` : ''}
      </AppText>

      <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
        {article.body.map((p) => (
          <AppText key={p}>{p}</AppText>
        ))}
      </View>

      <Card tone="soft" style={{ marginTop: spacing.xl }}>
        <AppText variant="heading" tone="primaryDark" accessibilityRole="header" style={{ marginBottom: spacing.md }}>
          {S.learn.keyPoints}
        </AppText>
        <View style={{ gap: spacing.md }}>
          {article.keyPoints.map((k) => (
            <View key={k} style={{ flexDirection: 'row', gap: spacing.md }}>
              <CheckCircle2 size={20} color={colors.primaryDark} style={{ marginTop: 2 }} />
              <AppText tone="primaryDark" style={{ flex: 1 }}>
                {k}
              </AppText>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

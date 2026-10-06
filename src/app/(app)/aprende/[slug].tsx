import { useLocalSearchParams } from 'expo-router';
import { CheckCircle2, FileQuestion, Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { IconBadge } from '@/components/IconBadge';
import { iconFor } from '@/components/icons';
import { Screen } from '@/components/Screen';
import { S } from '@/lib/strings.es';
import { useChecklist } from '@/store/checklistStore';
import { useContent } from '@/store/contentStore';
import { HAIRLINE, MIN_TOUCH, palette, radius, spacing, useTheme } from '@/theme';

export default function ArticleDetail() {
  const { colors, accent } = useTheme();
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
          style={{
            width: MIN_TOUCH - 4,
            height: MIN_TOUCH - 4,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.pill,
            backgroundColor: palette.glassStrong,
            borderWidth: HAIRLINE,
            borderColor: palette.strokeStrong,
          }}
        >
          <Star size={20} color={accent} fill={isFav ? accent : 'transparent'} strokeWidth={1.75} />
        </Pressable>
      }
    >
      <IconBadge icon={iconFor(article.icon)} size={64} />
      <AppText variant="title" accessibilityRole="header" style={{ marginTop: spacing.lg }}>
        {article.title}
      </AppText>
      <AppText variant="mono" tone="textMuted" style={{ marginTop: spacing.xs }}>
        {`${article.minutes} MIN`}
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

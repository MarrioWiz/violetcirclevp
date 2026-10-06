import { Share2 } from 'lucide-react-native';
import { Share, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { bundled } from '@/features/content/repository';
import { S } from '@/lib/strings.es';
import { spacing, useTheme } from '@/theme';

const guide = bundled.legal.howToSupport;

function asPlainText(): string {
  const parts = [guide.title, '', guide.intro, ''];
  guide.sections.forEach((s) => {
    parts.push(s.heading);
    s.items.forEach((i) => parts.push(`• ${i}`));
    parts.push('');
  });
  return parts.join('\n').trim();
}

export default function HowToSupport() {
  const { colors } = useTheme();
  return (
    <Screen
      nav="back"
      title={guide.title}
      subtitle={guide.intro}
      footer={
        <Button
          label={S.circle.share}
          icon={Share2}
          onPress={() => {
            // Se comparte solo esta guía genérica; no incluye nada de la usuaria.
            void Share.share({ message: asPlainText() }).catch(() => undefined);
          }}
        />
      }
    >
      <View style={{ gap: spacing.md }}>
        {guide.sections.map((s) => (
          <Card key={s.heading}>
            <AppText variant="heading" accessibilityRole="header" style={{ marginBottom: spacing.sm }}>
              {s.heading}
            </AppText>
            <View style={{ gap: spacing.sm }}>
              {s.items.map((i) => (
                <View key={i} style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginTop: 9 }} />
                  <AppText style={{ flex: 1 }}>{i}</AppText>
                </View>
              ))}
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

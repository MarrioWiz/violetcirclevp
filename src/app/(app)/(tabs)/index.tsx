import { router, type Href } from 'expo-router';
import {
  BookHeart,
  ChevronRight,
  Compass,
  LifeBuoy,
  ListChecks,
  NotebookPen,
  Siren,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { tabMeta } from '@/components/dock/tabs';
import { SectionTitle } from '@/components/Rows';
import { FileCard } from '@/components/ui/FileCard';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { IconBadge } from '@/components/IconBadge';
import { ScopeNotice } from '@/components/ScopeNotice';
import { HoldToHelpOrb } from '@/features/sos/HoldToHelpOrb';
import { Screen } from '@/components/Screen';
import { S } from '@/lib/strings.es';
import { useCircle } from '@/store/circleStore';
import { spacing, useTheme } from '@/theme';

interface Tile {
  key: keyof typeof S.home.tiles;
  icon: LucideIcon;
  href: Href;
}

const TILES: Tile[] = [
  { key: 'triage', icon: Compass, href: '/orientacion' },
  { key: 'firstSteps', icon: ListChecks, href: '/guia' },
  { key: 'circle', icon: Users, href: '/circulo' },
  { key: 'directory', icon: LifeBuoy, href: '/directorio' },
  { key: 'journal', icon: NotebookPen, href: '/bitacora' },
  { key: 'learn', icon: BookHeart, href: '/aprende' },
];

export default function Home() {
  const { accent } = useTheme();
  const meta = tabMeta('index');
  const circleCount = useCircle((s) => s.contacts.length);
  const greeting = useMemo(() => S.home.greeting[new Date().getDate() % S.home.greeting.length], []);

  return (
    <Screen
      dock
      title={meta.title}
      subtitle={meta.subtitle}
      eyebrow={`${greeting} · VioletCircleVP`}
      footer={<EmergencyBanner />}
    >
      {/* Llamado principal: tocar = opciones de ayuda; mantener 2 s = SMS con ubicación. */}
      <HoldToHelpOrb />

      {Platform.OS === 'android' ? (
        <FileCard
          name="pedir-ayuda.rápido"
          meta="CONFIGURAR"
          onPress={() => router.push('/ajustes/ayuda-rapida')}
          accessibilityLabel={`${S.sos.homeCard}. ${S.sos.homeCardBody}`}
          style={{ marginTop: spacing.md }}
        >
          <View style={styles.rowCenter}>
            <IconBadge icon={Siren} size={40} />
            <View style={{ flex: 1 }}>
              <AppText variant="subheading">{S.sos.homeCard}</AppText>
              <AppText variant="caption" tone="textMuted">
                {S.sos.homeCardBody}
              </AppText>
            </View>
            <ChevronRight size={18} color={accent} strokeWidth={1.75} />
          </View>
        </FileCard>
      ) : null}

      <SectionTitle>{S.home.sections}</SectionTitle>

      <View style={styles.grid}>
        {TILES.map((tile, i) => {
          const copy = S.home.tiles[tile.key];
          const body =
            tile.key === 'circle' && circleCount > 0
              ? `${circleCount} ${circleCount === 1 ? 'persona' : 'personas'}`
              : copy.body;
          return (
            <Card
              key={tile.key}
              onPress={() => router.push(tile.href)}
              accessibilityLabel={`${copy.title}. ${body}`}
              style={styles.tile}
            >
              <View style={styles.tileTop}>
                <IconBadge icon={tile.icon} />
                <AppText variant="mono" tone="textFaint" accessibilityElementsHidden>
                  {String(i + 1).padStart(2, '0')}
                </AppText>
              </View>
              <AppText variant="subheading" style={{ marginTop: spacing.lg }}>
                {copy.title}
              </AppText>
              <AppText variant="caption" tone="textMuted" style={{ marginTop: 2 }}>
                {body}
              </AppText>
            </Card>
          );
        })}
      </View>

      <View style={{ marginTop: spacing.x3 }}>
        <ScopeNotice />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: { width: '47.5%', minHeight: 156, flexGrow: 1 },
  tileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
});

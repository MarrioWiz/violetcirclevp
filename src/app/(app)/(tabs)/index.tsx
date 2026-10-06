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
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { IconBadge } from '@/components/IconBadge';
import { Logo } from '@/components/Logo';
import { ScopeNotice } from '@/components/ScopeNotice';
import { HoldToHelpOrb } from '@/features/sos/HoldToHelpOrb';
import { Screen } from '@/components/Screen';
import { S } from '@/lib/strings.es';
import { useCircle } from '@/store/circleStore';
import { radius, spacing, useTheme } from '@/theme';

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
  const { colors } = useTheme();
  const circleCount = useCircle((s) => s.contacts.length);
  const greeting = useMemo(() => S.home.greeting[new Date().getDate() % S.home.greeting.length], []);

  return (
    <Screen footer={<EmergencyBanner />}>
      <View style={styles.header}>
        <Logo size={44} />
        <View style={{ flex: 1 }}>
          <AppText variant="title" accessibilityRole="header">
            {greeting}
          </AppText>
          <AppText tone="textMuted">{S.home.subtitle}</AppText>
        </View>
      </View>

      {/* Llamado principal: tocar = opciones de ayuda (alerta rápida); mantener 2 s = SMS con ubicación. */}
      <HoldToHelpOrb />

      {Platform.OS === 'android' ? (
        <Card
          tone="soft"
          style={{ marginTop: spacing.md }}
          onPress={() => router.push('/ajustes/ayuda-rapida')}
          accessibilityLabel={`${S.sos.homeCard}. ${S.sos.homeCardBody}`}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <IconBadge icon={Siren} size={40} />
            <View style={{ flex: 1 }}>
              <AppText variant="subheading">{S.sos.homeCard}</AppText>
              <AppText variant="caption" tone="textMuted">
                {S.sos.homeCardBody}
              </AppText>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </View>
        </Card>
      ) : null}

      <AppText variant="label" tone="textMuted" style={{ marginTop: spacing.xxl, marginBottom: spacing.md }}>
        {S.home.sections}
      </AppText>

      <View style={styles.grid}>
        {TILES.map((tile) => {
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
              <IconBadge icon={tile.icon} />
              <AppText variant="subheading" style={{ marginTop: spacing.md }}>
                {copy.title}
              </AppText>
              <AppText variant="caption" tone="textMuted" style={{ marginTop: 2 }}>
                {body}
              </AppText>
              <ChevronRight size={18} color={colors.textMuted} style={styles.tileChevron} />
            </Card>
          );
        })}
      </View>

      <View style={{ marginTop: spacing.xxl }}>
        <ScopeNotice />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    minHeight: 132,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: { width: '47.5%', minHeight: 150, flexGrow: 1 },
  tileChevron: { position: 'absolute', top: spacing.lg, right: spacing.lg },
});

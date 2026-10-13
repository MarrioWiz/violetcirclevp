import { router, type Href } from 'expo-router';
import { BookHeart, NotebookPen, Settings, Siren, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { IconBadge } from '@/components/IconBadge';
import { tabMeta } from '@/components/dock/tabs';
import { Screen } from '@/components/Screen';
import { S } from '@/lib/strings.es';
import { useIncidents } from '@/store/incidentsStore';
import { spacing } from '@/theme';

interface Entry {
  icon: LucideIcon;
  title: string;
  body: string;
  href: Href;
}

/** Más: solo 4 lugares. Cada función vive en uno solo. */
export default function More() {
  const meta = tabMeta('mas');
  const count = useIncidents((s) => s.incidents.length);

  const entries: Entry[] = [
    {
      icon: NotebookPen,
      title: S.more.journal,
      body: count ? `${count} ${count === 1 ? 'entrada' : 'entradas'} · ${S.more.journalBody}` : S.more.journalBody,
      href: '/bitacora',
    },
    { icon: BookHeart, title: S.more.library, body: S.more.libraryBody, href: '/biblioteca' },
    // Visible en todas las plataformas; en web explica que se activa desde la app de Android.
    { icon: Siren, title: S.more.quickHelp, body: S.more.quickHelpBody, href: '/ajustes/ayuda-rapida' },
    { icon: Settings, title: S.more.settings, body: S.more.settingsBody, href: '/ajustes' },
  ];

  return (
    <Screen dock title={meta.title} subtitle={meta.subtitle}>
      <View style={{ gap: spacing.md }}>
        {entries.map((e) => (
          <Card key={e.title} onPress={() => router.push(e.href)} accessibilityLabel={`${e.title}. ${e.body}`}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
              <IconBadge icon={e.icon} size={48} />
              <View style={{ flex: 1 }}>
                <AppText variant="heading">{e.title}</AppText>
                <AppText variant="caption" tone="textMuted">
                  {e.body}
                </AppText>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

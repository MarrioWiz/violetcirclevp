import { router } from 'expo-router';
import { BookHeart, HeartHandshake, Info, ListChecks, NotebookPen, Settings, ShieldCheck } from 'lucide-react-native';

import { Card } from '@/components/Card';
import { Divider, ListRow, SectionTitle } from '@/components/Rows';
import { tabMeta } from '@/components/dock/tabs';
import { Screen } from '@/components/Screen';
import { S } from '@/lib/strings.es';
import { useIncidents } from '@/store/incidentsStore';
import { spacing } from '@/theme';

export default function More() {
  const meta = tabMeta('mas');
  const count = useIncidents((s) => s.incidents.length);
  const card = { paddingHorizontal: spacing.lg };
  return (
    <Screen dock title={meta.title} subtitle={meta.subtitle}>
      <Card padded={false} style={card}>
        <ListRow
          icon={NotebookPen}
          title={S.more.journal}
          body={count ? `${S.more.journalBody} · ${count} ${count === 1 ? 'entrada' : 'entradas'}` : S.more.journalBody}
          onPress={() => router.push('/bitacora')}
        />
        <Divider />
        <ListRow
          icon={BookHeart}
          title={S.more.learn}
          body={S.more.learnBody}
          onPress={() => router.push('/aprende')}
        />
        <Divider />
        <ListRow icon={ListChecks} title={S.more.firstSteps} onPress={() => router.push('/guia')} />
        <Divider />
        <ListRow icon={HeartHandshake} title={S.more.howToSupport} onPress={() => router.push('/circulo/acompanar')} />
      </Card>

      <SectionTitle>{S.settings.title}</SectionTitle>
      <Card padded={false} style={card}>
        <ListRow
          icon={Settings}
          title={S.more.settings}
          body={S.more.settingsBody}
          onPress={() => router.push('/ajustes')}
        />
        <Divider />
        <ListRow
          icon={ShieldCheck}
          title={S.more.privacy}
          onPress={() => router.push({ pathname: '/info/[doc]', params: { doc: 'privacidad' } })}
        />
        <Divider />
        <ListRow
          icon={Info}
          title={S.more.about}
          onPress={() => router.push({ pathname: '/info/[doc]', params: { doc: 'acerca' } })}
        />
      </Card>
    </Screen>
  );
}

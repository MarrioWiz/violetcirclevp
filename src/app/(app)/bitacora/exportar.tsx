import { useLocalSearchParams } from 'expo-router';
import { Eye, Share2, TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { notify } from '@/lib/dialog';
import { S, t } from '@/lib/strings.es';
import { buildReportHtml, previewReport, shareReport } from '@/services/pdf';
import { useIncidents } from '@/store/incidentsStore';
import { spacing, useTheme } from '@/theme';

export default function ExportJournal() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const allIncidents = useIncidents((s) => s.incidents);
  const allFiles = useIncidents((s) => s.files);
  const incidents = id ? allIncidents.filter((i) => i.id === id) : allIncidents;
  const ids = new Set(incidents.map((i) => i.id));
  const files = allFiles.filter((f) => ids.has(f.incidentId));
  const [busy, setBusy] = useState<'preview' | 'share' | null>(null);

  const run = async (kind: 'preview' | 'share') => {
    setBusy(kind);
    try {
      const html = await buildReportHtml(incidents, files);
      if (kind === 'preview') await previewReport(html);
      else await shareReport(html);
    } catch {
      notify(S.errors.generic);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen
      nav="back"
      title={S.journal.exportTitle}
      edges={['top', 'bottom']}
      footer={
        <>
          <Button label={busy === 'preview' ? S.journal.generating : S.journal.preview} icon={Eye} variant="secondary" loading={busy === 'preview'} disabled={!!busy || !incidents.length} onPress={() => void run('preview')} />
          <Button label={busy === 'share' ? S.journal.generating : S.journal.share} icon={Share2} size="lg" loading={busy === 'share'} disabled={!!busy || !incidents.length || Platform.OS === 'web'} onPress={() => void run('share')} />
        </>
      }
    >
      <Card tone="warning">
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <TriangleAlert size={22} color={colors.warning} />
          <AppText tone="warning" style={{ flex: 1 }}>
            {S.journal.exportWarning}
          </AppText>
        </View>
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <AppText variant="bodyStrong">{t(S.journal.exportCount, { n: incidents.length, f: files.length })}</AppText>
        <AppText tone="textMuted" style={{ marginTop: spacing.sm }}>
          El documento incluye la cronología, la descripción de cada entrada, las miniaturas de tus capturas y la huella SHA-256 de cada archivo.
        </AppText>
        {incidents.some((i) => i.locked) ? (
          <AppText variant="caption" tone="textMuted" style={{ marginTop: spacing.sm }}>
            Incluye también las entradas protegidas con PIN.
          </AppText>
        ) : null}
      </Card>
    </Screen>
  );
}

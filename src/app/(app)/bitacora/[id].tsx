import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, FileDown, FileQuestion, FolderOpen, History, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { SectionTitle } from '@/components/Rows';
import { Screen } from '@/components/Screen';
import { PinGate } from '@/features/auth/PinGate';
import { EvidenceItem } from '@/features/evidence/EvidenceItem';
import { KIND_LABEL, PLATFORM_LABEL } from '@/features/evidence/pdfHtml';
import { confirmDialog, notify } from '@/lib/dialog';
import { S } from '@/lib/strings.es';
import { attachEvidence, deleteEvidenceFile, type PickSource } from '@/services/evidenceFiles';
import { useIncidents } from '@/store/incidentsStore';
import { spacing } from '@/theme';

const fmt = (iso: string) => format(new Date(iso), "d 'de' MMMM yyyy, HH:mm", { locale: es });

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={{ gap: 2, marginTop: spacing.md }}>
      <AppText variant="label" tone="textMuted">
        {label}
      </AppText>
      <AppText selectable>{value}</AppText>
    </View>
  );
}

export default function IncidentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const incident = useIncidents((s) => s.incidents.find((i) => i.id === id));
  const files = useIncidents((s) => s.files.filter((f) => f.incidentId === id));
  const addFile = useIncidents((s) => s.addFile);
  const remove = useIncidents((s) => s.remove);
  const [unlocked, setUnlocked] = useState(false);
  const [attaching, setAttaching] = useState<PickSource | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  if (!incident) {
    return (
      <Screen nav="back">
        <EmptyState icon={FileQuestion} title={S.journal.noResults} />
      </Screen>
    );
  }

  if (incident.locked && !unlocked) {
    return (
      <Screen nav="back">
        <PinGate title={S.journal.lockedTitle} body={S.journal.lockedBody} onUnlock={() => setUnlocked(true)} />
      </Screen>
    );
  }

  const attach = async (source: PickSource) => {
    setAttaching(source);
    const res = await attachEvidence(incident.id, source);
    setAttaching(null);
    if (!res) return;
    if (res.ok) await addFile(res.file);
    else notify(res.reason === 'too-big' ? S.journal.tooBig : res.reason === 'denied' ? S.journal.photosDenied : S.errors.generic);
  };

  const onDelete = async () => {
    const ok = await confirmDialog({
      title: S.journal.deleteEntryTitle,
      message: S.journal.deleteEntryBody,
      confirmLabel: S.common.delete,
      destructive: true,
    });
    if (!ok) return;
    const removedFiles = await remove(incident.id);
    removedFiles.forEach(deleteEvidenceFile);
    router.back();
  };

  return (
    <Screen
      nav="back"
      footer={
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button
            label={S.common.edit}
            icon={Pencil}
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: '/bitacora/nueva', params: { id: incident.id } })}
          />
          <Button
            label="PDF"
            icon={FileDown}
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: '/bitacora/exportar', params: { id: incident.id } })}
          />
        </View>
      }
    >
      {incident.isAlertLog ? (
        <AppText variant="label" tone="primary">
          {S.journal.alertLog}
        </AppText>
      ) : null}
      <AppText variant="title" accessibilityRole="header" style={{ marginTop: spacing.xs }}>
        {incident.title}
      </AppText>
      <AppText tone="textMuted" style={{ marginTop: spacing.xs }}>
        {fmt(incident.occurredAt)} · {PLATFORM_LABEL[incident.platform]}
        {incident.type ? ` · ${KIND_LABEL[incident.type]}` : ''}
      </AppText>

      <Card style={{ marginTop: spacing.lg }}>
        <AppText selectable>{incident.description}</AppText>
        <Field label={S.journal.fields.involved} value={incident.involved} />
        <Field label={S.journal.fields.mood} value={incident.mood ? S.journal.moods[incident.mood - 1] : undefined} />
        <Field label={S.journal.fields.notes} value={incident.notes} />
        {incident.links.length > 0 && (
          <View style={{ gap: spacing.xs, marginTop: spacing.md }}>
            <AppText variant="label" tone="textMuted">
              {S.journal.fields.links}
            </AppText>
            {incident.links.map((l) => (
              <AppText key={l} tone="primary" onPress={() => void Linking.openURL(l).catch(() => undefined)} selectable>
                {l}
              </AppText>
            ))}
          </View>
        )}
      </Card>

      <SectionTitle>{S.journal.evidence}</SectionTitle>
      {Platform.OS === 'web' ? (
        <AppText tone="textMuted">{S.journal.webUnavailable}</AppText>
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button label={S.journal.addPhoto} icon={ImageIcon} variant="outline" style={{ flex: 1 }} loading={attaching === 'photos'} onPress={() => void attach('photos')} />
            <Button label={S.journal.addCamera} icon={Camera} variant="outline" style={{ flex: 1 }} loading={attaching === 'camera'} onPress={() => void attach('camera')} />
            <Button label={S.journal.addFile} icon={FolderOpen} variant="outline" style={{ flex: 1 }} loading={attaching === 'files'} onPress={() => void attach('files')} />
          </View>
          <AppText variant="caption" tone="textMuted" style={{ marginTop: spacing.sm }}>
            {S.journal.evidenceNote}
          </AppText>
          <View style={{ gap: spacing.md, marginTop: spacing.md }}>
            {files.length === 0 ? (
              <AppText tone="textMuted">{S.journal.evidenceEmpty}</AppText>
            ) : (
              files.map((f) => <EvidenceItem key={f.id} file={f} />)
            )}
          </View>
        </>
      )}

      {incident.history.length > 0 && (
        <>
          <SectionTitle>{S.journal.history}</SectionTitle>
          <Button
            label={showHistory ? S.common.close : `${S.journal.history} (${incident.history.length})`}
            icon={History}
            variant="ghost"
            onPress={() => setShowHistory((v) => !v)}
          />
          {showHistory && (
            <View style={{ gap: spacing.md }}>
              <AppText variant="caption" tone="textMuted">
                {S.journal.historyNote}
              </AppText>
              {incident.history.map((h) => (
                <Card key={h.savedAt} tone="soft">
                  <AppText variant="caption" tone="primaryDark">
                    {fmt(h.savedAt)}
                  </AppText>
                  <AppText style={{ marginTop: spacing.xs }}>{h.description}</AppText>
                  {h.notes ? (
                    <AppText variant="caption" tone="textMuted" style={{ marginTop: spacing.xs }}>
                      {h.notes}
                    </AppText>
                  ) : null}
                </Card>
              ))}
            </View>
          )}
        </>
      )}

      <AppText variant="caption" tone="textMuted" style={{ marginTop: spacing.xl }}>
        {S.journal.created}: {fmt(incident.createdAt)} · {S.journal.updated}: {fmt(incident.updatedAt)}
      </AppText>

      <Button label={S.common.delete} icon={Trash2} variant="ghost" onPress={() => void onDelete()} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}

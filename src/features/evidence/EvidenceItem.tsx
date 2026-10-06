import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Image } from 'expo-image';
import { FileText, Share2, ShieldCheck, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { confirmDialog, notify } from '@/lib/dialog';
import { S } from '@/lib/strings.es';
import { deleteEvidenceFile, evidenceDataUri, shareOriginal, verifyEvidence } from '@/services/evidenceFiles';
import { useIncidents } from '@/store/incidentsStore';
import { MIN_TOUCH, radius, spacing, useTheme } from '@/theme';
import type { EvidenceFile } from '@/types';

function Action({
  icon: Icon,
  label,
  onPress,
  danger,
}: {
  icon: typeof Share2;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minHeight: MIN_TOUCH - 4,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: danger ? colors.dangerSoft : colors.primarySoft,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon size={16} color={danger ? colors.danger : colors.primary} />
      <AppText variant="caption" tone={danger ? 'danger' : 'primary'} style={{ fontFamily: 'Inter_600SemiBold' }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function EvidenceItem({ file }: { file: EvidenceFile }) {
  const { colors } = useTheme();
  const removeFile = useIncidents((s) => s.removeFile);
  const [thumb, setThumb] = useState<string | null>(null);
  const isImage = file.mime.startsWith('image/');

  useEffect(() => {
    if (!isImage) return;
    let alive = true;
    // Se descifra solo en memoria para la miniatura.
    evidenceDataUri(file)
      .then((uri) => alive && setThumb(uri))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [file, isImage]);

  return (
    <Card>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View
          style={{
            width: 72,
            height: 96,
            borderRadius: radius.sm,
            backgroundColor: colors.surfaceAlt,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isImage ? (
            thumb ? (
              <Image
                source={{ uri: thumb }}
                style={{ width: 72, height: 96 }}
                contentFit="cover"
                accessibilityLabel={file.name}
              />
            ) : (
              <ActivityIndicator color={colors.primary} />
            )
          ) : (
            <FileText size={28} color={colors.primary} />
          )}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {file.name}
          </AppText>
          <AppText variant="caption" tone="textMuted">
            {format(new Date(file.addedAt), 'd MMM yyyy, HH:mm', { locale: es })} · {(file.size / 1024).toFixed(0)} KB
          </AppText>
          <AppText variant="caption" tone="textMuted" selectable style={{ fontFamily: 'Courier', fontSize: 10 }}>
            SHA-256: {file.sha256}
          </AppText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
        <Action
          icon={ShieldCheck}
          label={S.journal.verify}
          onPress={() => {
            void verifyEvidence(file)
              .then((ok) => notify(ok ? S.journal.verifyOk : S.journal.verifyFail))
              .catch(() => notify(S.journal.verifyFail));
          }}
        />
        <Action
          icon={Share2}
          label={S.journal.shareOriginal}
          onPress={() => void shareOriginal(file).catch(() => notify(S.errors.generic))}
        />
        <Action
          icon={Trash2}
          danger
          label={S.journal.deleteFile}
          onPress={async () => {
            const ok = await confirmDialog({
              title: S.journal.deleteFileTitle,
              confirmLabel: S.common.delete,
              destructive: true,
            });
            if (!ok) return;
            const removed = await removeFile(file.id);
            if (removed) deleteEvidenceFile(removed);
          }}
        />
      </View>
    </Card>
  );
}

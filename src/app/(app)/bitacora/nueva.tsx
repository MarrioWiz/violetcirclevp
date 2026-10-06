import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/Screen';
import { IncidentForm } from '@/features/evidence/IncidentForm';
import { parseLinks, type IncidentFormValues } from '@/features/evidence/schema';
import { notify } from '@/lib/dialog';
import { S } from '@/lib/strings.es';
import { useIncidents } from '@/store/incidentsStore';

export default function IncidentEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useIncidents((s) => s.incidents.find((i) => i.id === id));
  const create = useIncidents((s) => s.create);
  const update = useIncidents((s) => s.update);

  const defaults: IncidentFormValues = existing
    ? {
        title: existing.title,
        occurredAt: new Date(existing.occurredAt),
        platform: existing.platform,
        type: existing.type && existing.type !== 'riesgo' ? existing.type : undefined,
        description: existing.description,
        involved: existing.involved,
        linksText: existing.links.join('\n'),
        mood: existing.mood,
        notes: existing.notes,
        locked: !!existing.locked,
      }
    : { title: '', occurredAt: new Date(), platform: 'whatsapp', description: '', locked: false };

  const onSubmit = async (v: IncidentFormValues) => {
    const data = {
      title: v.title,
      occurredAt: v.occurredAt.toISOString(),
      platform: v.platform,
      type: v.type,
      description: v.description,
      involved: v.involved || undefined,
      links: parseLinks(v.linksText),
      mood: v.mood,
      notes: v.notes || undefined,
      locked: v.locked,
    };
    try {
      if (existing) {
        await update(existing.id, data);
        router.back();
      } else {
        const created = await create(data);
        router.replace({ pathname: '/bitacora/[id]', params: { id: created.id } });
      }
    } catch {
      notify(S.errors.generic);
    }
  };

  return (
    <Screen nav="back" title={existing ? S.journal.edit : S.journal.new} subtitle={S.journal.subtitle} edges={['top', 'bottom']}>
      <IncidentForm defaults={defaults} submitLabel={S.common.save} onSubmit={onSubmit} />
    </Screen>
  );
}

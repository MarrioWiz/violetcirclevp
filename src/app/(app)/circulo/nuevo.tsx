import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/Screen';
import { ContactFormView } from '@/features/circle/ContactFormView';
import { notify } from '@/lib/dialog';
import { S } from '@/lib/strings.es';
import { useCircle } from '@/store/circleStore';

export default function ContactEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useCircle((s) => s.contacts.find((c) => c.id === id));
  const add = useCircle((s) => s.add);
  const update = useCircle((s) => s.update);

  return (
    <Screen
      nav="close"
      title={existing ? `${S.common.edit} ${existing.name}` : S.circle.add}
      subtitle={S.circle.localOnly}
      edges={['top', 'bottom']}
    >
      <ContactFormView
        initial={existing}
        submitLabel={S.common.save}
        onSubmit={async (data) => {
          try {
            if (existing) await update(existing.id, data);
            else await add(data);
            router.back();
          } catch (e) {
            notify(e instanceof Error && e.message === 'circle-full' ? S.circle.full : S.errors.generic);
          }
        }}
      />
    </Screen>
  );
}

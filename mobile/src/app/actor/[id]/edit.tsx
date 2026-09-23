import { router, useLocalSearchParams } from 'expo-router';
import { Lock } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ActorForm, toFormValues } from '@/components/ActorForm';
import { useToast } from '@/components/overlays';
import { EmptyState, ErrorState } from '@/components/ui';
import { useActor, useUpdateActor } from '@/lib/queries';
import { colors, space } from '@/lib/theme';

// Update (PUT /api/actors/:id) — the form is pre-filled from GET /api/actors/:id
export default function EditActor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: actor, isPending, isError, error, refetch } = useActor(id);
  const update = useUpdateActor(id);
  const toast = useToast();

  if (isPending) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.maroon} />
      </View>
    );
  }
  if (isError || !actor) return <View style={{ paddingTop: space.huge }}><ErrorState message={error?.message ?? 'Not found.'} onRetry={refetch} /></View>;
  if (!actor.canEdit) {
    return (
      <View style={{ paddingTop: space.huge }}>
        <EmptyState icon={Lock} title="You can’t edit this star" body="Only the fan who added a profile (or an admin) can change it." cta="Go back" onCta={() => router.back()} />
      </View>
    );
  }

  return (
    <ActorForm
      title={`Edit ${actor.name.split(' ')[0]}`}
      submitLabel="Save changes"
      defaultValues={toFormValues(actor)}
      submitting={update.isPending}
      onCancel={() => router.back()}
      onSubmit={async (input) => {
        await update.mutateAsync(input);
        toast('Changes saved');
        router.back();
      }}
    />
  );
}

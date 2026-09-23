import { router } from 'expo-router';
import React from 'react';
import { ActorForm, emptyForm } from '@/components/ActorForm';
import { useToast } from '@/components/overlays';
import { useCreateActor } from '@/lib/queries';

// Create (POST /api/actors)
export default function NewActor() {
  const create = useCreateActor();
  const toast = useToast();
  return (
    <ActorForm
      title="Add a star"
      submitLabel="Add star"
      defaultValues={emptyForm}
      submitting={create.isPending}
      onCancel={() => router.back()}
      onSubmit={async (input) => {
        const actor = await create.mutateAsync(input);
        toast(`${actor.name} was added`);
        router.replace(`/actor/${actor.id}`);
      }}
    />
  );
}

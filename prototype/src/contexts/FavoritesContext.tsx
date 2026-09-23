import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface FavoritesValue {
  actorIds: string[];
  titleIds: string[];
  isFavoriteActor: (id: string) => boolean;
  toggleActor: (id: string) => void;
  isSavedTitle: (id: string) => boolean;
  toggleTitle: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({ children }: {children: React.ReactNode;}) {
  const [actorIds, setActorIds] = useState<string[]>([
  'amihan-reyes',
  'charing-villanueva',
  'bibi-manalo']
  );
  const [titleIds, setTitleIds] = useState<string[]>([
  'bituin-sa-maynila',
  'ang-huling-liham',
  'kalye-kings']
  );

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (id: string) =>
  setter((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]);

  const toggleActor = useCallback(toggle(setActorIds), []);
  const toggleTitle = useCallback(toggle(setTitleIds), []);

  const value = useMemo<FavoritesValue>(
    () => ({
      actorIds,
      titleIds,
      isFavoriteActor: (id) => actorIds.includes(id),
      toggleActor,
      isSavedTitle: (id) => titleIds.includes(id),
      toggleTitle
    }),
    [actorIds, titleIds, toggleActor, toggleTitle]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}
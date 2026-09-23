import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRequireAuth } from '@/lib/auth';
import { useFavorites, useToggleFavorite } from '@/lib/queries';
import { colors, fonts, radius, shadow, space } from '@/lib/theme';
import type { ActorSummary } from '@/lib/types';
import { useToast } from './overlays';
import { Press, Skeleton } from './ui';

export function useIsFavorite(id: string) {
  const { data } = useFavorites();
  return !!data?.some((a) => a.id === id);
}

export function FavoriteButton({ actor, size = 'md' }: { actor: ActorSummary; size?: 'sm' | 'md' }) {
  const active = useIsFavorite(actor.id);
  const toggle = useToggleFavorite();
  const requireAuth = useRequireAuth();
  const toast = useToast();
  const dim = size === 'sm' ? 32 : 40;
  return (
    <Press
      onPress={() =>
        requireAuth(() =>
          toggle.mutate(
            { actor, on: !active },
            { onError: (e) => toast(e.message, 'error') },
          ),
        )
      }
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={active ? `Remove ${actor.name} from favorites` : `Add ${actor.name} to favorites`}
      style={[styles.fav, { width: dim, height: dim }]}>
      <Heart
        size={size === 'sm' ? 16 : 18}
        color={active ? colors.pinoyRed : colors.cream}
        fill={active ? colors.pinoyRed : 'transparent'}
        strokeWidth={2}
      />
    </Press>
  );
}

/** grid = tile in a 2-col grid, rail = fixed-width card in a horizontal rail. */
export function ActorCard({ actor, variant = 'grid', showFavorite = true }: { actor: ActorSummary; variant?: 'grid' | 'rail'; showFavorite?: boolean }) {
  // The heart is a sibling overlay, not a child of the card's pressable: nested buttons are
  // invalid on web and make two tap targets fight on native.
  return (
    <View style={[styles.card, variant === 'rail' ? { width: 132 } : { flex: 1 }]}>
      <Press
        onPress={() => router.push(`/actor/${actor.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`${actor.name}, ${actor.network}, ${actor.generation}`}>
        <View style={styles.photoWrap}>
          {actor.photoUrl ? (
            <Image source={{ uri: actor.photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" transition={150} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.noPhoto]}>
              <Text style={styles.noPhotoText}>{actor.name.slice(0, 1)}</Text>
            </View>
          )}
        </View>
        {actor.isMine ? (
          <View style={styles.mine}>
            <Text style={styles.mineText}>Added by you</Text>
          </View>
        ) : null}
        <View style={styles.caption}>
          <Text numberOfLines={1} style={styles.name}>
            {actor.name}
          </Text>
          <Text numberOfLines={1} style={styles.meta}>
            {actor.network} · {actor.generation}
          </Text>
        </View>
      </Press>
      {showFavorite ? (
        <View style={styles.favSlot}>
          <FavoriteButton actor={actor} size="sm" />
        </View>
      ) : null}
    </View>
  );
}

export function ActorGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.skeletonGrid}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} style={{ width: '48%', aspectRatio: 3 / 4, borderRadius: radius.xxl }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xxl, backgroundColor: colors.maroonDeep, overflow: 'hidden', ...shadow.card },
  photoWrap: { width: '100%', aspectRatio: 3 / 4 },
  noPhoto: { backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center' },
  noPhotoText: { fontFamily: fonts.displayBlack, fontSize: 48, color: colors.goldLight },
  favSlot: { position: 'absolute', right: space.sm, top: space.sm },
  mine: { position: 'absolute', left: space.sm, top: space.sm, backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  mineText: { fontFamily: fonts.bold, fontSize: 10, color: colors.maroonDeep, letterSpacing: 0.4 },
  caption: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.overlay, paddingHorizontal: space.md, paddingVertical: 10 },
  name: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.cream },
  meta: { fontFamily: fonts.medium, fontSize: 11, color: colors.goldLight, marginTop: 1 },
  fav: { borderRadius: radius.pill, backgroundColor: 'rgba(43,7,14,0.6)', alignItems: 'center', justifyContent: 'center' },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.md, paddingHorizontal: space.xl },
});

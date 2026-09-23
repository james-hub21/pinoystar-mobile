import { router } from 'expo-router';
import { Bookmark, Heart, LogIn } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActorCard, ActorGridSkeleton } from '@/components/actors';
import { useToast } from '@/components/overlays';
import { EmptyState, ErrorState, Header, Poster, Press } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { plural } from '@/lib/format';
import { useFavorites, useToggleWatch, useWatchlist } from '@/lib/queries';
import { colors, fonts, radius, shadow, space } from '@/lib/theme';

const tabs = [
  { id: 'stars', label: 'Stars' },
  { id: 'titles', label: 'Shows & Movies' },
] as const;
type TabId = (typeof tabs)[number]['id'];

export default function Favorites() {
  const insets = useSafeAreaInsets();
  const { status } = useAuth();
  const [tab, setTab] = useState<TabId>('stars');
  const favorites = useFavorites();
  const watchlist = useWatchlist();
  const toggleWatch = useToggleWatch();
  const toast = useToast();

  const header = (
    <Header top={insets.top} title="My favorites" subtitle={status === 'signedIn' ? `${plural(favorites.data?.length ?? 0, 'star')} · ${plural(watchlist.data?.length ?? 0, 'title')} saved` : 'Sign in to keep your favorites'}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {tabs.map((t) => (
          <Press key={t.id} onPress={() => setTab(t.id)} accessibilityRole="tab" accessibilityState={{ selected: tab === t.id }} style={[styles.tab, tab === t.id && styles.tabActive]}>
            <Text style={[styles.tabText, { color: tab === t.id ? colors.maroonDeep : colors.cream300 }]}>{t.label}</Text>
          </Press>
        ))}
      </View>
    </Header>
  );

  if (status !== 'signedIn') {
    return (
      <View style={{ flex: 1 }}>
        {header}
        <EmptyState icon={LogIn} title="Your favorites live in your account" body="Sign in to follow stars and keep a watchlist on every device." cta="Sign in" onCta={() => router.push('/login')} />
      </View>
    );
  }

  const query = tab === 'stars' ? favorites : watchlist;
  return (
    <View style={{ flex: 1 }}>
      {header}
      {query.isPending ? (
        <View style={{ paddingTop: space.xl }}>
          <ActorGridSkeleton count={4} />
        </View>
      ) : query.isError ? (
        <ErrorState message={query.error.message} onRetry={query.refetch} />
      ) : tab === 'stars' ? (
        // Distinct keys: the two lists differ in numColumns, which FlatList can't change in place.
        <FlatList
          key="stars-grid"
          data={favorites.data}
          keyExtractor={(a) => a.id}
          numColumns={2}
          columnWrapperStyle={{ gap: space.md, paddingHorizontal: space.xl }}
          contentContainerStyle={{ gap: space.md, paddingTop: space.xl, paddingBottom: space.huge }}
          renderItem={({ item }) => (
            <View style={{ flex: 1, maxWidth: '50%' }}>
              <ActorCard actor={item} />
            </View>
          )}
          refreshControl={<RefreshControl refreshing={favorites.isRefetching} onRefresh={favorites.refetch} tintColor={colors.gold} />}
          ListEmptyComponent={<EmptyState icon={Heart} title="No stars saved yet" body="Tap the heart on any profile to keep your favorites here." cta="Browse stars" onCta={() => router.push('/search')} />}
        />
      ) : (
        <FlatList
          key="titles-list"
          data={watchlist.data}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ gap: space.md, padding: space.xl, paddingBottom: space.huge }}
          refreshControl={<RefreshControl refreshing={watchlist.isRefetching} onRefresh={watchlist.refetch} tintColor={colors.gold} />}
          ListEmptyComponent={<EmptyState icon={Bookmark} title="Your watchlist is empty" body="Save teleseryes and movies from any filmography to track them here." cta="Find something to watch" onCta={() => router.push('/search')} />}
          renderItem={({ item }) => (
            <View style={styles.titleRow}>
              <Poster uri={item.posterUrl} title={item.title} style={styles.poster} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.titleName}>
                  {item.title}
                </Text>
                <Text style={styles.titleMeta}>
                  {item.type} · {item.year}
                </Text>
                <Text style={styles.note}>{item.note ?? 'Watchlist'}</Text>
              </View>
              <Press
                onPress={() => toggleWatch.mutate({ title: item, on: false }, { onError: (e) => toast(e.message, 'error') })}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.title} from watchlist`}
                style={styles.unsave}>
                <Bookmark size={17} color={colors.maroon} fill={colors.maroon} />
              </Press>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 4, backgroundColor: colors.whiteGlass, borderRadius: radius.xl, padding: 4, marginTop: space.lg },
  tab: { flex: 1, borderRadius: radius.xl2, paddingVertical: 10, alignItems: 'center' },
  tabActive: { backgroundColor: colors.cream },
  tabText: { fontFamily: fonts.bold, fontSize: 13.5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.white, borderRadius: radius.xxl, padding: space.md, ...shadow.card },
  poster: { width: 58, height: 78, borderRadius: radius.xl },
  titleName: { fontFamily: fonts.displayBold, fontSize: 15.5, color: colors.ink },
  titleMeta: { fontFamily: fonts.body, fontSize: 12.5, color: colors.inkMuted, marginTop: 2 },
  note: { alignSelf: 'flex-start', marginTop: 6, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.maroon, backgroundColor: colors.cream200, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, overflow: 'hidden' },
  unsave: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.cream200, alignItems: 'center', justifyContent: 'center' },
});

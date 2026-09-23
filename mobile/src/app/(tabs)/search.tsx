import { router } from 'expo-router';
import { Plus, Search as SearchIcon, SlidersHorizontal, UserRound, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActorCard, ActorGridSkeleton } from '@/components/actors';
import { Sheet } from '@/components/overlays';
import { Button, Chip, EmptyState, ErrorState, Press } from '@/components/ui';
import { useAuth, useRequireAuth } from '@/lib/auth';
import { useActors } from '@/lib/queries';
import { colors, fonts, radius, shadow, space, type } from '@/lib/theme';
import { DECADES, GENDERS, GENERATIONS, GENRES, NETWORKS } from '@/lib/types';

type FilterKey = 'decade' | 'genre' | 'network' | 'gender' | 'generation';
type Filters = Record<FilterKey, string[]>;

const groups: { key: FilterKey; label: string; options: readonly string[] }[] = [
  { key: 'decade', label: 'Decade', options: DECADES },
  { key: 'genre', label: 'Genre', options: GENRES },
  { key: 'network', label: 'Network', options: NETWORKS },
  { key: 'gender', label: 'Gender', options: GENDERS },
  { key: 'generation', label: 'Generation', options: GENERATIONS },
];
const quick = ['Legends', 'Gen Z', 'ABS-CBN', 'GMA', 'Drama', '1990s'];
const empty: Filters = { decade: [], genre: [], network: [], gender: [], generation: [] };

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function Search() {
  const insets = useSafeAreaInsets();
  const { status } = useAuth();
  const requireAuth = useRequireAuth();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(empty);
  const [mine, setMine] = useState(false);
  const [sheet, setSheet] = useState(false);
  const q = useDebounced(query);

  const params = useMemo(() => ({ q, ...filters, mine: mine || undefined, sort: 'trending' as const, limit: 100 }), [q, filters, mine]);
  const { data, isPending, isError, error, refetch, isRefetching, isPlaceholderData } = useActors(params);
  const activeCount = Object.values(filters).reduce((n, v) => n + v.length, 0) + (mine ? 1 : 0);

  const toggle = (key: FilterKey, option: string) =>
    setFilters((prev) => ({ ...prev, [key]: prev[key].includes(option) ? prev[key].filter((o) => o !== option) : [...prev[key], option] }));
  const groupOf = (v: string) => groups.find((g) => g.options.includes(v));
  const results = data?.data ?? [];

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Text style={styles.title} accessibilityRole="header">
          Browse stars
        </Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <SearchIcon size={18} color={colors.maroonSoft} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search actors, shows, hometowns"
              placeholderTextColor="rgba(168,64,76,0.7)"
              accessibilityLabel="Search actors, shows and hometowns"
              returnKeyType="search"
              autoCorrect={false}
              style={styles.searchInput}
            />
            {query ? (
              <Press onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search">
                <X size={18} color={colors.maroonSoft} />
              </Press>
            ) : null}
          </View>
          <Press onPress={() => setSheet(true)} accessibilityRole="button" accessibilityLabel={`Open filters${activeCount ? `, ${activeCount} active` : ''}`} style={styles.filterBtn}>
            <SlidersHorizontal size={20} color={colors.cream} />
            {activeCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeCount}</Text>
              </View>
            ) : null}
          </Press>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingTop: space.md }}>
          {status === 'signedIn' ? <Chip label="Added by me" tone="dark" selected={mine} onPress={() => setMine((m) => !m)} /> : null}
          {quick.map((f) => {
            const g = groupOf(f)!;
            return <Chip key={f} label={f} tone="dark" selected={filters[g.key].includes(f)} onPress={() => toggle(g.key, f)} />;
          })}
        </ScrollView>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.count}>
          {isPending ? 'Loading…' : `${data?.total ?? 0} ${data?.total === 1 ? 'star' : 'stars'}`}
          {isPlaceholderData ? ' · updating' : ''}
        </Text>
        {activeCount > 0 ? (
          <Press onPress={() => { setFilters(empty); setMine(false); }} accessibilityRole="button">
            <Text style={styles.clear}>Clear filters</Text>
          </Press>
        ) : null}
      </View>

      {isPending ? (
        <ActorGridSkeleton />
      ) : isError ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(a) => a.id}
          numColumns={2}
          columnWrapperStyle={{ gap: space.md, paddingHorizontal: space.xl }}
          contentContainerStyle={{ gap: space.md, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1, maxWidth: '50%' }}>
              <ActorCard actor={item} />
            </View>
          )}
          refreshControl={<RefreshControl refreshing={isRefetching && !isPlaceholderData} onRefresh={refetch} tintColor={colors.gold} />}
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            mine && !q && activeCount === 1 ? (
              <EmptyState icon={UserRound} title="You haven’t added a star yet" body="Tap Add star to create your first profile." cta="Add a star" onCta={() => router.push('/actor/new')} />
            ) : (
              <EmptyState icon={SearchIcon} title="No stars match that" body="Try a different spelling, or loosen a filter or two." />
            )
          }
        />
      )}

      <Press
        onPress={() => requireAuth(() => router.push('/actor/new'), '/actor/new')}
        accessibilityRole="button"
        accessibilityLabel="Add a new star"
        style={styles.fab}>
        <Plus size={20} color={colors.maroonDeep} strokeWidth={2.6} />
        <Text style={styles.fabText}>Add star</Text>
      </Press>

      <Sheet
        visible={sheet}
        title="Filters"
        onClose={() => setSheet(false)}
        footer={
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button label="Reset" variant="secondary" onPress={() => { setFilters(empty); setMine(false); }} style={{ flex: 1 }} />
            <Button label={`Show ${data?.total ?? 0} results`} onPress={() => setSheet(false)} style={{ flex: 2 }} />
          </View>
        }>
        {groups.map((g) => (
          <View key={g.key} style={{ marginTop: space.lg }}>
            <Text style={type.label}>{g.label}</Text>
            <View style={styles.sheetChips}>
              {g.options.map((o) => (
                <Chip key={o} label={o} selected={filters[g.key].includes(o)} onPress={() => toggle(g.key, o)} />
              ))}
            </View>
          </View>
        ))}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.maroonDeep, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl, paddingHorizontal: space.xl, paddingBottom: space.lg },
  title: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.cream },
  searchRow: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.cream, borderRadius: radius.xl, paddingHorizontal: 14, minHeight: 48 },
  searchInput: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.ink, paddingVertical: 12 },
  filterBtn: { width: 48, height: 48, borderRadius: radius.xl, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: -4, top: -4, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { fontFamily: fonts.displayBlack, fontSize: 11, color: colors.maroonDeep },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.md },
  count: { fontFamily: fonts.semibold, fontSize: 13, color: colors.inkMuted },
  clear: { fontFamily: fonts.bold, fontSize: 13, color: colors.maroon },
  fab: { position: 'absolute', right: space.xl, bottom: space.xl, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: space.xl, height: 52, ...shadow.lift },
  fabText: { fontFamily: fonts.display, fontSize: 15, color: colors.maroonDeep },
  sheetChips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: 10 },
});

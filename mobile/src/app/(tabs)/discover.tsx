import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { BookOpen, ExternalLink, Globe, Search as SearchIcon, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet } from '@/components/overlays';
import { Button, Chip, EmptyState, ErrorState, Press, Skeleton } from '@/components/ui';
import { colors, fonts, radius, shadow, space, type } from '@/lib/theme';
import { useWikiSearch, useWikiSummary } from '@/lib/wikipedia';

const topics = ['Philippine cinema', 'Teleserye', 'Metro Manila Film Festival', 'Gawad Urian Award', 'FAMAS Award', 'Cinemalaya'];

function useDebounced(value: string, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function Discover() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ page?: string }>();
  const [query, setQuery] = useState(topics[0]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const q = useDebounced(query);
  const search = useWikiSearch(q);

  // A tapped search result wins; otherwise honour a deep link from the Home "Born on this day" rail.
  const shownKey = openKey ?? params.page ?? null;
  const closeSummary = () => {
    setOpenKey(null);
    if (params.page) router.setParams({ page: undefined });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Text style={styles.title} accessibilityRole="header">
          Discover
        </Text>
        <View style={styles.source}>
          <Globe size={13} color={colors.goldLight} />
          <Text style={styles.sourceText}>Live search powered by the Wikipedia REST API</Text>
        </View>
        <View style={styles.searchBox}>
          <SearchIcon size={18} color={colors.maroonSoft} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search Wikipedia"
            placeholderTextColor="rgba(168,64,76,0.7)"
            accessibilityLabel="Search Wikipedia"
            returnKeyType="search"
            autoCorrect={false}
            style={styles.searchInput}
          />
          {search.isFetching ? <ActivityIndicator size="small" color={colors.maroonSoft} /> : null}
          {query && !search.isFetching ? (
            <Press onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search">
              <X size={18} color={colors.maroonSoft} />
            </Press>
          ) : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingTop: space.md }}>
          {topics.map((t) => (
            <Chip key={t} label={t} tone="dark" selected={query === t} onPress={() => setQuery(t)} />
          ))}
        </ScrollView>
      </View>

      {q.trim().length < 2 ? (
        <EmptyState icon={BookOpen} title="Search the free encyclopedia" body="Type at least two letters, or pick a topic above." />
      ) : search.isPending ? (
        <View style={{ padding: space.xl, gap: space.md }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} style={{ height: 88, borderRadius: radius.xxl }} />
          ))}
        </View>
      ) : search.isError ? (
        <ErrorState message={search.error.message} onRetry={search.refetch} />
      ) : (
        <FlatList
          data={search.data}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={{ padding: space.xl, gap: space.md, paddingBottom: space.huge }}
          keyboardDismissMode="on-drag"
          ListEmptyComponent={<EmptyState icon={SearchIcon} title="No articles found" body="Try a broader search term." />}
          renderItem={({ item }) => (
            <Press onPress={() => setOpenKey(item.key)} accessibilityRole="button" accessibilityLabel={`${item.title}. ${item.description}`} style={styles.result}>
              {item.thumbnail ? (
                <Image source={{ uri: item.thumbnail }} style={styles.thumb} contentFit="cover" transition={150} />
              ) : (
                <View style={[styles.thumb, styles.thumbEmpty]}>
                  <BookOpen size={22} color={colors.cream400} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.resultTitle}>
                  {item.title}
                </Text>
                {item.description ? (
                  <Text numberOfLines={1} style={styles.resultDesc}>
                    {item.description}
                  </Text>
                ) : null}
                <Text numberOfLines={2} style={styles.resultExcerpt}>
                  {item.excerpt}
                </Text>
              </View>
            </Press>
          )}
        />
      )}

      <SummarySheet pageKey={shownKey} onClose={closeSummary} />
    </View>
  );
}

function SummarySheet({ pageKey, onClose }: { pageKey: string | null; onClose: () => void }) {
  const summary = useWikiSummary(pageKey);
  const s = summary.data;
  return (
    <Sheet
      visible={!!pageKey}
      title={s?.title ?? 'Wikipedia'}
      onClose={onClose}
      footer={s ? <Button label="Open on Wikipedia" icon={ExternalLink} onPress={() => WebBrowser.openBrowserAsync(s.url)} /> : undefined}>
      {summary.isPending ? (
        <View style={{ gap: space.md }}>
          <Skeleton style={{ height: 200, borderRadius: radius.xxl }} />
          <Skeleton style={{ height: 16, width: '70%' }} />
          <Skeleton style={{ height: 80 }} />
        </View>
      ) : summary.isError ? (
        <Text style={type.body}>{summary.error.message}</Text>
      ) : s ? (
        <View>
          {s.image ? <Image source={{ uri: s.image }} style={styles.summaryImage} contentFit="cover" contentPosition="top" transition={150} /> : null}
          {s.description ? <Text style={[type.eyebrow, { marginTop: space.lg }]}>{s.description}</Text> : null}
          <Text style={[type.body, { marginTop: space.sm, fontSize: 15, lineHeight: 24 }]}>{s.extract}</Text>
          <Text style={styles.attribution}>Text from Wikipedia, available under CC BY-SA 4.0.</Text>
        </View>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.maroonDeep, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl, paddingHorizontal: space.xl, paddingBottom: space.lg },
  title: { fontFamily: fonts.displayBlack, fontSize: 24, letterSpacing: -0.4, color: colors.cream },
  source: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  sourceText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.cream300 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.cream, borderRadius: radius.xl, paddingHorizontal: 14, minHeight: 48, marginTop: space.md },
  searchInput: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.ink, paddingVertical: 12 },
  result: { flexDirection: 'row', gap: space.md, backgroundColor: colors.white, borderRadius: radius.xxl, padding: space.md, ...shadow.card },
  thumb: { width: 64, height: 64, borderRadius: radius.xl2 },
  thumbEmpty: { backgroundColor: colors.cream200, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontFamily: fonts.displayBold, fontSize: 15, color: colors.ink },
  resultDesc: { fontFamily: fonts.semibold, fontSize: 12, color: colors.maroonSoft, marginTop: 1 },
  resultExcerpt: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17, color: colors.inkMuted, marginTop: 4 },
  summaryImage: { width: '100%', height: 220, borderRadius: radius.xxl, backgroundColor: colors.cream200 },
  attribution: { fontFamily: fonts.body, fontSize: 11.5, color: colors.inkSubtle, marginTop: space.lg },
});

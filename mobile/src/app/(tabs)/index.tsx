import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Bell, Globe, Play, Star } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FavoriteButton } from '@/components/actors';
import { Chip, ErrorState, Press, Rail, SectionHeading, Skeleton } from '@/components/ui';
import { greeting, plural, timeAgo } from '@/lib/format';
import { useActors, useNews, useTrivia } from '@/lib/queries';
import { colors, fonts, radius, shadow, space, type } from '@/lib/theme';
import type { ActorFilters } from '@/lib/types';
import { useBornToday, wikiImage } from '@/lib/wikipedia';

const categories = ['Movies', 'Teleserye', 'New Generation', 'Legends'] as const;
type Category = (typeof categories)[number];

const categoryFilter: Record<Category, ActorFilters> = {
  Movies: { creditType: ['Movie'] },
  Teleserye: { creditType: ['Teleserye', 'Series'] },
  'New Generation': { generation: ['Gen Z'] },
  Legends: { generation: ['Legends'] },
};

export default function Home() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<Category>('Movies');
  const spotlight = useActors({ spotlight: true, limit: 8 });
  const trending = useActors({ ...categoryFilter[category], sort: 'trending', limit: 12 });
  const news = useNews();
  const trivia = useTrivia();
  const born = useBornToday();
  const [lead, ...rest] = news.data ?? [];

  const refreshing = spotlight.isRefetching || trending.isRefetching || news.isRefetching;
  const onRefresh = () => {
    spotlight.refetch();
    trending.refetch();
    news.refetch();
    born.refetch();
  };
  const hello = useMemo(() => greeting(), []);

  if (spotlight.isError && trending.isError) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top + space.xxl }}>
        <ErrorState message={spotlight.error.message} onRetry={onRefresh} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: space.xxxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{hello}</Text>
            <Text style={styles.brand} accessibilityRole="header">
              Pino<Text style={{ color: colors.gold }}>y</Text>Stars
            </Text>
          </View>
          <Press onPress={() => router.push('/profile')} accessibilityRole="button" accessibilityLabel="Profile and settings" style={styles.bell}>
            <Bell size={20} color={colors.cream} />
            <View style={styles.bellDot} />
          </Press>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categories.map((c) => (
            <Chip key={c} label={c} tone="dark" selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>
      </View>

      {/* Spotlight — the reason people open the app, so it gets the most surface. */}
      <View style={{ marginTop: -40 }}>
        <Rail>
          {spotlight.isPending
            ? [0, 1].map((i) => <Skeleton key={i} style={{ width: 290, aspectRatio: 4 / 5, borderRadius: radius.xxxl }} />)
            : spotlight.data?.data.map((actor) => (
                <View key={actor.id} style={styles.spot}>
                  <Press onPress={() => router.push(`/actor/${actor.id}`)} accessibilityRole="button" accessibilityLabel={`Spotlight: ${actor.name}`}>
                    <View style={{ width: '100%', aspectRatio: 4 / 5 }}>
                      {actor.photoUrl ? <Image source={{ uri: actor.photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" transition={150} /> : null}
                    </View>
                    <View style={styles.spotCaption}>
                      <Text style={[type.eyebrow, { color: colors.gold }]}>Spotlight</Text>
                      <Text style={styles.spotName}>{actor.name}</Text>
                      <Text numberOfLines={2} style={styles.spotTagline}>
                        {actor.tagline}
                      </Text>
                    </View>
                  </Press>
                  <View style={{ position: 'absolute', right: 12, top: 12 }}>
                    <FavoriteButton actor={actor} />
                  </View>
                </View>
              ))}
        </Rail>
      </View>

      <View style={{ marginTop: space.xxxl }}>
        <SectionHeading title={`Trending in ${category}`} action="See all" onAction={() => router.push('/search')} />
        <Rail>
          {trending.isPending
            ? [0, 1, 2].map((i) => <Skeleton key={i} style={{ width: 118, aspectRatio: 3 / 4, borderRadius: radius.xxl }} />)
            : trending.data?.data.map((actor, i) => (
                <Press key={actor.id} onPress={() => router.push(`/actor/${actor.id}`)} accessibilityRole="button" accessibilityLabel={`Number ${i + 1}, ${actor.name}`} style={{ width: 118 }}>
                  <View style={styles.trendPhoto}>
                    {actor.photoUrl ? <Image source={{ uri: actor.photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" transition={150} /> : null}
                    <View style={styles.rank}>
                      <Text style={styles.rankText}>{i + 1}</Text>
                    </View>
                  </View>
                  <Text numberOfLines={1} style={styles.trendName}>
                    {actor.name}
                  </Text>
                  <View style={styles.fansRow}>
                    <Star size={12} color={colors.gold} fill={colors.gold} />
                    <Text style={styles.fans}>{actor.fansLabel} fans</Text>
                  </View>
                </Press>
              ))}
        </Rail>
      </View>

      {/* Live data from the third-party Wikipedia REST API */}
      <View style={{ marginTop: space.xxxl }}>
        <View style={styles.wikiHeading}>
          <View style={{ flex: 1 }}>
            <Text style={type.h2}>Born on this day</Text>
            <View style={styles.wikiSource}>
              <Globe size={12} color={colors.maroonSoft} />
              <Text style={styles.wikiSourceText}>Live from Wikipedia</Text>
            </View>
          </View>
          <Press onPress={() => router.push('/discover')} accessibilityRole="button">
            <Text style={styles.link}>Discover</Text>
          </Press>
        </View>
        {born.isError ? (
          <Text style={[type.small, { paddingHorizontal: space.xl }]}>{born.error.message}</Text>
        ) : (
          <Rail>
            {born.isPending
              ? [0, 1, 2].map((i) => <Skeleton key={i} style={{ width: 150, height: 188, borderRadius: radius.xxl }} />)
              : born.data?.map((b) => (
                  <Press
                    key={b.key}
                    onPress={() => router.push({ pathname: '/discover', params: { page: b.key } })}
                    accessibilityRole="button"
                    accessibilityLabel={`${b.name}, born ${b.year}, ${b.description}`}
                    style={styles.born}>
                    {b.image ? (
                      <Image source={wikiImage(b.image)} style={styles.bornPhoto} contentFit="cover" contentPosition="top" transition={150} />
                    ) : (
                      <View style={[styles.bornPhoto, { backgroundColor: colors.cream300 }]} />
                    )}
                    <View style={{ padding: 10 }}>
                      <Text style={styles.bornYear}>{b.filipino ? `🇵🇭 ${b.year}` : b.year}</Text>
                      <Text numberOfLines={1} style={styles.bornName}>
                        {b.name}
                      </Text>
                      <Text numberOfLines={2} style={styles.bornDesc}>
                        {b.description}
                      </Text>
                    </View>
                  </Press>
                ))}
          </Rail>
        )}
      </View>

      <View style={{ marginTop: space.xxxl }}>
        <SectionHeading title="Latest showbiz" />
        {news.isPending ? (
          <Skeleton style={{ marginHorizontal: space.xl, height: 320, borderRadius: radius.xxl }} />
        ) : lead ? (
          <>
            <Press onPress={() => router.push(`/news/${lead.id}`)} accessibilityRole="button" style={styles.lead}>
              {lead.imageUrl ? <Image source={{ uri: lead.imageUrl }} style={{ width: '100%', aspectRatio: 16 / 9 }} contentFit="cover" transition={150} /> : null}
              <View style={{ padding: space.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <Text style={styles.tag}>{lead.tag}</Text>
                  <Text style={[type.label, { fontSize: 11 }]}>{timeAgo(lead.publishedAt)}</Text>
                </View>
                <Text style={styles.leadHeadline}>{lead.headline}</Text>
                <Text style={[type.body, { marginTop: 6 }]}>{lead.excerpt}</Text>
                <Text style={styles.leadSource}>
                  {lead.source} · {lead.minutesRead} min read
                </Text>
              </View>
            </Press>
            <View style={{ paddingHorizontal: space.xl, marginTop: space.sm }}>
              {rest.map((item, i) => (
                <Press
                  key={item.id}
                  onPress={() => router.push(`/news/${item.id}`)}
                  accessibilityRole="button"
                  style={[styles.newsRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.cream300 }]}>
                  {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.newsThumb} contentFit="cover" transition={150} /> : null}
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={2} style={styles.newsHeadline}>
                      {item.headline}
                    </Text>
                    <Text style={styles.newsMeta}>
                      {item.source} · {timeAgo(item.publishedAt)}
                    </Text>
                  </View>
                </Press>
              ))}
            </View>
          </>
        ) : null}
      </View>

      <Press onPress={() => router.push('/trivia')} accessibilityRole="button" accessibilityLabel="Play Guess the Actor" style={styles.trivia}>
        <View style={styles.triviaIcon}>
          <Play size={20} color={colors.maroonDeep} fill={colors.maroonDeep} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.triviaTitle}>Guess the Actor</Text>
          <Text style={styles.triviaSub}>{trivia.data ? `${plural(trivia.data.length, 'round')} ready today` : 'New rounds every day'}</Text>
        </View>
        <View style={styles.play}>
          <Text style={styles.playText}>Play</Text>
        </View>
      </Press>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.maroonDeep, borderBottomLeftRadius: radius.xxxl, borderBottomRightRadius: radius.xxxl, paddingHorizontal: space.xl, paddingBottom: 64 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { ...type.eyebrow, fontFamily: fonts.semibold, fontSize: 12, color: colors.gold },
  brand: { fontFamily: fonts.displayBlack, fontSize: 30, color: colors.cream, marginTop: 4 },
  bell: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.whiteGlass, alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', right: 11, top: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.pinoyYellow },
  chips: { gap: space.sm, paddingTop: space.xl, paddingRight: space.xl },
  spot: { width: 290, borderRadius: radius.xxxl, overflow: 'hidden', backgroundColor: colors.maroon, ...shadow.lift },
  spotCaption: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(43,7,14,0.82)', paddingHorizontal: space.lg, paddingVertical: 14 },
  spotName: { fontFamily: fonts.display, fontSize: 22, color: colors.cream, marginTop: 4 },
  spotTagline: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17, color: colors.cream300, marginTop: 4 },
  trendPhoto: { width: 118, aspectRatio: 3 / 4, borderRadius: radius.xxl, overflow: 'hidden', backgroundColor: colors.cream300, ...shadow.card },
  rank: { position: 'absolute', left: 8, top: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontFamily: fonts.displayBlack, fontSize: 13, color: colors.maroonDeep },
  trendName: { fontFamily: fonts.displayBold, fontSize: 13.5, color: colors.ink, marginTop: space.sm },
  fansRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  fans: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.maroonSoft },
  wikiHeading: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: space.xl, marginBottom: space.md },
  wikiSource: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  wikiSourceText: { fontFamily: fonts.medium, fontSize: 12, color: colors.maroonSoft },
  link: { fontFamily: fonts.semibold, fontSize: 13, color: colors.maroon },
  born: { width: 150, backgroundColor: colors.white, borderRadius: radius.xxl, overflow: 'hidden', ...shadow.card },
  bornPhoto: { width: '100%', height: 110 },
  bornYear: { fontFamily: fonts.bold, fontSize: 11, color: colors.goldDeep, letterSpacing: 0.6 },
  bornName: { fontFamily: fonts.displayBold, fontSize: 13.5, color: colors.ink, marginTop: 2 },
  bornDesc: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 15, color: colors.inkMuted, marginTop: 2 },
  lead: { marginHorizontal: space.xl, backgroundColor: colors.white, borderRadius: radius.xxl, overflow: 'hidden', ...shadow.card },
  tag: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.cream, backgroundColor: colors.pinoyRed, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, overflow: 'hidden' },
  leadHeadline: { fontFamily: fonts.display, fontSize: 18, lineHeight: 24, color: colors.ink, marginTop: 10 },
  leadSource: { fontFamily: fonts.semibold, fontSize: 12, color: colors.maroon, marginTop: space.md },
  newsRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 14 },
  newsThumb: { width: 62, height: 62, borderRadius: radius.xl },
  newsHeadline: { fontFamily: fonts.displayBold, fontSize: 14.5, lineHeight: 19, color: colors.ink },
  newsMeta: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.maroonSoft, marginTop: 4 },
  trivia: { marginHorizontal: space.xl, marginTop: space.xxl, backgroundColor: colors.maroon, borderRadius: radius.xxl, padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md },
  triviaIcon: { width: 44, height: 44, borderRadius: radius.xl, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  triviaTitle: { fontFamily: fonts.displayBold, fontSize: 15, color: colors.cream },
  triviaSub: { fontFamily: fonts.body, fontSize: 12.5, color: colors.cream300, marginTop: 2 },
  play: { backgroundColor: colors.cream, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: space.sm },
  playText: { fontFamily: fonts.bold, fontSize: 13, color: colors.maroonDeep },
});

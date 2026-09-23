import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import {
  AtSign, Award, Bookmark, Cake, ChevronLeft, MapPin, Music, Pencil, Share2, ShieldCheck, Trash, Tv,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActorCard, FavoriteButton, useIsFavorite } from '@/components/actors';
import { ConfirmDialog, useToast } from '@/components/overlays';
import { Button, Card, ErrorState, IconButton, Poster, Press, Rail, SectionHeading, Skeleton } from '@/components/ui';
import { useRequireAuth } from '@/lib/auth';
import { initials, longDate } from '@/lib/format';
import { useActor, useActors, useDeleteActor, useToggleFavorite, useToggleWatch, useWatchlist } from '@/lib/queries';
import { colors, fonts, radius, shadow, space, type } from '@/lib/theme';
import type { Credit } from '@/lib/types';

export default function ActorProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: actor, isPending, isError, error, refetch } = useActor(id);
  const related = useActors({ generation: actor ? [actor.generation] : undefined, limit: 8 });
  const watchlist = useWatchlist();
  const toggleFav = useToggleFavorite();
  const toggleWatch = useToggleWatch();
  const del = useDeleteActor();
  const requireAuth = useRequireAuth();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const favorited = useIsFavorite(id ?? '');
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const topBar = (
    <View style={[styles.topBar, { paddingTop: insets.top + space.sm }]}>
      <IconButton icon={ChevronLeft} label="Go back" onPress={back} />
      {actor ? (
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <IconButton
            icon={Share2}
            label={`Share ${actor.name}'s profile`}
            onPress={() => Share.share({ message: `${actor.name} — ${actor.tagline} · on PinoyStars` })}
          />
          <FavoriteButton actor={actor} />
        </View>
      ) : null}
    </View>
  );

  if (isPending) {
    return (
      <View style={{ flex: 1 }}>
        <Skeleton style={{ height: 420, borderRadius: 0 }} />
        {topBar}
        <View style={{ padding: space.xl, gap: space.md }}>
          <Skeleton style={{ height: 14, width: '40%' }} />
          <Skeleton style={{ height: 32, width: '75%' }} />
          <Skeleton style={{ height: 120 }} />
        </View>
      </View>
    );
  }
  if (isError || !actor) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top + 64 }}>
        {topBar}
        <ErrorState message={error?.message ?? 'This profile may have been removed.'} onRetry={refetch} />
      </View>
    );
  }

  const saved = new Set(watchlist.data?.map((t) => t.id));
  const recommendations = (related.data?.data ?? []).filter((a) => a.id !== actor.id).slice(0, 6);
  const facts = [
    { Icon: Cake, label: 'Born', value: longDate(actor.birthdate) },
    { Icon: MapPin, label: 'Hometown', value: actor.hometown || '—' },
    { Icon: Tv, label: 'Network', value: [actor.network, actor.agency].filter(Boolean).join(' · ') },
  ];
  const socials = [
    actor.socials.instagram && { Icon: AtSign, handle: actor.socials.instagram, label: 'Instagram' },
    actor.socials.x && { Icon: AtSign, handle: actor.socials.x, label: 'X' },
    actor.socials.tiktok && { Icon: Music, handle: actor.socials.tiktok, label: 'TikTok' },
  ].filter(Boolean) as { Icon: typeof AtSign; handle: string; label: string }[];

  const onDelete = () =>
    del.mutate(actor.id, {
      onSuccess: () => {
        setConfirm(false);
        toast(`${actor.name} was deleted`);
        back();
      },
      onError: (e) => {
        setConfirm(false);
        toast(e.message, 'error');
      },
    });

  const toggleCredit = (c: Credit) =>
    requireAuth(() =>
      toggleWatch.mutate(
        { title: { id: c.titleId, title: c.title, year: c.year, type: c.type, posterUrl: c.posterUrl, note: null }, on: !saved.has(c.titleId) },
        { onError: (e) => toast(e.message, 'error') },
      ),
    );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.huge + insets.bottom }}>
        <View style={styles.hero}>
          {actor.photoUrl ? (
            <Image source={{ uri: actor.photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" transition={200} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.monogram]}>
              <Text style={styles.monogramText}>{initials(actor.name)}</Text>
              <Text style={styles.monogramHint}>No photo yet</Text>
            </View>
          )}
        </View>

        <View style={styles.sheet}>
          <Text style={type.eyebrow}>{actor.stageName || actor.network}</Text>
          <Text style={[type.h1, { marginTop: 4 }]} accessibilityRole="header">
            {actor.name}
          </Text>
          <Text style={[type.body, { marginTop: space.sm, fontSize: 13.5 }]}>{actor.tagline}</Text>

          <View style={styles.followRow}>
            <Button
              label={favorited ? 'Following' : 'Follow'}
              variant={favorited ? 'secondary' : 'primary'}
              onPress={() => requireAuth(() => toggleFav.mutate({ actor, on: !favorited }, { onError: (e) => toast(e.message, 'error') }))}
              style={{ flex: 1 }}
            />
            <View style={styles.fansPill}>
              <Text style={styles.fansValue}>{actor.fansLabel}</Text>
              <Text style={styles.fansLabel}>fans</Text>
            </View>
          </View>

          {actor.canEdit ? (
            <View style={styles.ownerRow}>
              <Button label="Edit" icon={Pencil} variant="secondary" onPress={() => router.push(`/actor/${actor.id}/edit`)} style={{ flex: 1 }} />
              <Button label="Delete" icon={Trash} variant="secondary" onPress={() => setConfirm(true)} style={{ flex: 1 }} />
            </View>
          ) : actor.isOfficial ? (
            <View style={styles.official}>
              <ShieldCheck size={14} color={colors.goldDeep} />
              <Text style={styles.officialText}>Official PinoyStars profile</Text>
            </View>
          ) : null}

          <Card style={{ marginTop: space.xl, paddingHorizontal: space.lg }}>
            {facts.map(({ Icon, label, value }, i) => (
              <View key={label} style={[styles.fact, i > 0 && styles.divider]}>
                <Icon size={18} color={colors.maroon} />
                <Text style={styles.factLabel}>{label}</Text>
                <Text style={styles.factValue}>{value}</Text>
              </View>
            ))}
          </Card>

          {actor.bio ? (
            <View style={{ marginTop: space.xxl }}>
              <Text style={type.h2}>Biography</Text>
              <Text style={[type.body, { marginTop: space.sm, lineHeight: 23 }]}>{actor.bio}</Text>
            </View>
          ) : null}

          <View style={{ marginTop: space.xxl }}>
            <View style={styles.rowBetween}>
              <Text style={type.h2}>Filmography</Text>
              <Text style={styles.count}>
                {actor.credits.length} {actor.credits.length === 1 ? 'credit' : 'credits'}
              </Text>
            </View>
            {actor.credits.length === 0 ? <Text style={[type.body, { marginTop: space.sm }]}>No credits listed yet.</Text> : null}
            <View style={{ gap: 10, marginTop: space.md }}>
              {[...actor.credits].sort((a, b) => b.year - a.year).map((c) => {
                const isSaved = saved.has(c.titleId);
                return (
                  <View key={c.id} style={styles.credit}>
                    <Poster uri={c.posterUrl} title={c.title} style={styles.poster} />
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={styles.creditTitle}>
                        {c.title}
                      </Text>
                      <Text numberOfLines={1} style={[type.small, { marginTop: 2 }]}>
                        as {c.role}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 6 }}>
                        <Text style={styles.typePill}>{c.type}</Text>
                        <Text style={[type.label, { fontSize: 11 }]}>{c.year}</Text>
                      </View>
                    </View>
                    <Press
                      onPress={() => toggleCredit(c)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSaved }}
                      accessibilityLabel={isSaved ? `Remove ${c.title} from watchlist` : `Add ${c.title} to watchlist`}
                      style={[styles.bookmark, isSaved && { backgroundColor: colors.maroon }]}>
                      <Bookmark size={17} color={isSaved ? colors.cream : colors.maroon} fill={isSaved ? colors.cream : 'transparent'} />
                    </Press>
                  </View>
                );
              })}
            </View>
          </View>

          {actor.awards.length ? (
            <View style={{ marginTop: space.xxl }}>
              <Text style={type.h2}>Awards &amp; recognition</Text>
              <Card style={{ marginTop: space.md, paddingHorizontal: space.lg }}>
                {actor.awards.map((a, i) => (
                  <View key={a.id} style={[styles.fact, { paddingVertical: 14 }, i > 0 && styles.divider]}>
                    <Award size={20} color={a.won ? colors.gold : colors.cream400} />
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={type.title}>
                        {a.title}
                      </Text>
                      <Text numberOfLines={1} style={type.small}>
                        {a.org} · {a.year}
                      </Text>
                    </View>
                    <Text style={[styles.awardPill, a.won ? { backgroundColor: colors.goldPale, color: colors.goldDeep } : null]}>{a.won ? 'Won' : 'Nominated'}</Text>
                  </View>
                ))}
              </Card>
            </View>
          ) : null}

          {socials.length ? (
            <View style={{ marginTop: space.xxl }}>
              <Text style={type.h2}>Follow online</Text>
              <View style={styles.socials}>
                {socials.map(({ Icon, handle, label }) => (
                  <View key={label} style={styles.social} accessible accessibilityLabel={`${label}: ${handle}`}>
                    <Icon size={15} color={colors.maroon} />
                    <Text style={styles.socialText}>{handle}</Text>
                    <Text style={styles.socialNet}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {recommendations.length ? (
          <View style={{ marginTop: space.xxxl }}>
            <SectionHeading title="Fans also liked" />
            <Rail>
              {recommendations.map((r) => (
                <ActorCard key={r.id} actor={r} variant="rail" showFavorite={false} />
              ))}
            </Rail>
          </View>
        ) : null}
      </ScrollView>
      {topBar}

      <ConfirmDialog
        visible={confirm}
        title={`Delete ${actor.name}?`}
        body="This removes the profile, its filmography and awards for everyone. This can’t be undone."
        confirmLabel="Delete"
        destructive
        loading={del.isPending}
        onConfirm={onDelete}
        onCancel={() => setConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.lg },
  hero: { height: 420, backgroundColor: colors.maroonDeep },
  monogram: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.maroon },
  monogramText: { fontFamily: fonts.displayBlack, fontSize: 96, color: colors.goldLight },
  monogramHint: { fontFamily: fonts.medium, fontSize: 13, color: colors.cream300, marginTop: 4 },
  sheet: { marginTop: -32, backgroundColor: colors.cream, borderTopLeftRadius: radius.xxxl, borderTopRightRadius: radius.xxxl, paddingHorizontal: space.xl, paddingTop: space.xxl },
  followRow: { flexDirection: 'row', gap: 10, marginTop: space.lg },
  fansPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.cream200, borderRadius: radius.xl, paddingHorizontal: space.lg },
  fansValue: { fontFamily: fonts.displayBlack, fontSize: 15, color: colors.ink },
  fansLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.maroonSoft },
  ownerRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  official: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md },
  officialText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.goldDeep },
  fact: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  divider: { borderTopWidth: 1, borderTopColor: colors.cream300 },
  factLabel: { width: 90, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.maroonSoft },
  factValue: { flex: 1, textAlign: 'right', fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  count: { fontFamily: fonts.semibold, fontSize: 12, color: colors.maroonSoft },
  credit: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.white, borderRadius: radius.xl, padding: 10, ...shadow.card },
  poster: { width: 50, height: 68, borderRadius: radius.md },
  creditTitle: { fontFamily: fonts.displayBold, fontSize: 15, color: colors.ink },
  typePill: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.maroon, backgroundColor: colors.cream200, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  bookmark: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cream200, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  awardPill: { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.maroonSoft, backgroundColor: colors.cream200, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, overflow: 'hidden' },
  socials: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  social: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 10, ...shadow.card },
  socialText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  socialNet: { fontFamily: fonts.medium, fontSize: 11, color: colors.maroonSoft },
});

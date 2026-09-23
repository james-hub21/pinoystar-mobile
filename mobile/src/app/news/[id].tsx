import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState, IconButton, Press, Skeleton } from '@/components/ui';
import { timeAgo } from '@/lib/format';
import { useNewsItem } from '@/lib/queries';
import { colors, fonts, radius, shadow, space, type } from '@/lib/theme';

export default function NewsStory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: n, isPending, isError, error, refetch } = useNewsItem(id);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.huge + insets.bottom }}>
        {isPending ? (
          <>
            <Skeleton style={{ height: 260, borderRadius: 0 }} />
            <View style={{ padding: space.xl, gap: space.md }}>
              <Skeleton style={{ height: 28 }} />
              <Skeleton style={{ height: 160 }} />
            </View>
          </>
        ) : isError || !n ? (
          <View style={{ paddingTop: insets.top + 64 }}>
            <ErrorState message={error?.message ?? 'This story is no longer available.'} onRetry={refetch} />
          </View>
        ) : (
          <>
            {n.imageUrl ? <Image source={{ uri: n.imageUrl }} style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.maroonDeep }} contentFit="cover" /> : null}
            <View style={{ padding: space.xl }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <Text style={styles.tag}>{n.tag}</Text>
                <Text style={[type.label, { fontSize: 11 }]}>{timeAgo(n.publishedAt)}</Text>
              </View>
              <Text style={[type.h1, { fontSize: 26, lineHeight: 30, marginTop: space.md }]} accessibilityRole="header">
                {n.headline}
              </Text>
              <Text style={styles.source}>
                {n.source} · {n.minutesRead} min read
              </Text>
              <Text style={[type.body, { fontSize: 16, lineHeight: 26, marginTop: space.lg, color: colors.ink }]}>{n.excerpt}</Text>
              {n.body.split('\n\n').map((p, i) => (
                <Text key={i} style={[type.body, { fontSize: 15, lineHeight: 25, marginTop: space.md }]}>
                  {p}
                </Text>
              ))}

              {n.actor ? (
                <Press onPress={() => router.push(`/actor/${n.actor!.id}`)} accessibilityRole="button" accessibilityLabel={`View ${n.actor.name}'s profile`} style={styles.actor}>
                  {n.actor.photoUrl ? <Image source={{ uri: n.actor.photoUrl }} style={styles.actorPhoto} contentFit="cover" contentPosition="top" /> : null}
                  <View style={{ flex: 1 }}>
                    <Text style={type.eyebrow}>In this story</Text>
                    <Text style={[type.title, { marginTop: 2 }]}>{n.actor.name}</Text>
                    <Text numberOfLines={1} style={type.small}>
                      {n.actor.tagline}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.cream400} />
                </Press>
              ) : null}
              <Text style={styles.disclaimer}>PinoyStars stories are fictional and written for this fan app.</Text>
            </View>
          </>
        )}
      </ScrollView>
      <View style={{ position: 'absolute', top: insets.top + space.sm, left: space.lg }}>
        <IconButton icon={ChevronLeft} label="Go back" onPress={back} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.cream, backgroundColor: colors.pinoyRed, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, overflow: 'hidden' },
  source: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.maroon, marginTop: space.sm },
  actor: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.white, borderRadius: radius.xxl, padding: space.md, marginTop: space.xxl, ...shadow.card },
  actorPhoto: { width: 52, height: 64, borderRadius: radius.md },
  disclaimer: { fontFamily: fonts.body, fontSize: 11.5, color: colors.inkSubtle, marginTop: space.xl },
});

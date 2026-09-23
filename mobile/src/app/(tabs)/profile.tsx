import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { LogOut, Pencil, Sparkles, UserRound } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextField } from '@/components/fields';
import { Sheet, useToast } from '@/components/overlays';
import { Button, Card, Chip, EmptyState, ErrorState, Header, Press, Skeleton } from '@/components/ui';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { initials, memberSince } from '@/lib/format';
import { useMe, useUpdateMe } from '@/lib/queries';
import { colors, fonts, radius, space, type } from '@/lib/theme';
import { GENRES, type Genre } from '@/lib/types';
import { profileForm } from '@/lib/validation';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { status, signOut } = useAuth();
  const me = useMe();
  const update = useUpdateMe();
  const toast = useToast();
  const [editing, setEditing] = useState(false);

  if (status === 'loading') return null;
  if (status === 'signedOut') {
    return (
      <View style={{ flex: 1 }}>
        <Header top={insets.top} title="Profile" subtitle="Join the PinoyStars fan community" />
        <EmptyState icon={UserRound} title="You’re browsing as a guest" body="Sign in to follow stars, save a watchlist, add your own star profiles and keep your trivia score." cta="Sign in or create account" onCta={() => router.push('/login')} />
      </View>
    );
  }
  if (me.isError) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top + space.xxl }}>
        <ErrorState message={me.error.message} onRetry={me.refetch} />
      </View>
    );
  }

  const m = me.data;
  const toggleGenre = (g: Genre) => {
    if (!m) return;
    const favoriteGenres = m.favoriteGenres.includes(g) ? m.favoriteGenres.filter((x) => x !== g) : [...m.favoriteGenres, g];
    update.mutate({ displayName: m.displayName, city: m.city, favoriteGenres }, { onError: (e) => toast(e.message, 'error') });
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: space.huge }} refreshControl={<RefreshControl refreshing={me.isRefetching} onRefresh={me.refetch} tintColor={colors.gold} />}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{m ? initials(m.displayName) : ''}</Text>
          </View>
          <View style={{ flex: 1 }}>
            {m ? (
              <>
                <Text numberOfLines={1} style={styles.name} accessibilityRole="header">
                  {m.displayName}
                </Text>
                <Text numberOfLines={1} style={styles.sub}>
                  {[m.city, `Member since ${memberSince(m.memberSince)}`].filter(Boolean).join(' · ')}
                </Text>
              </>
            ) : (
              <Skeleton style={{ height: 40, backgroundColor: colors.whiteGlass }} />
            )}
          </View>
          <Press onPress={() => setEditing(true)} disabled={!m} accessibilityRole="button" accessibilityLabel="Edit profile" style={styles.edit}>
            <Pencil size={17} color={colors.cream} />
          </Press>
        </View>
        <View style={styles.stats}>
          {[
            { label: 'Following', value: m?.stats.following },
            { label: 'Watchlist', value: m?.stats.watchlist },
            { label: 'Trivia wins', value: m?.stats.triviaWins },
          ].map((s) => (
            <View key={s.label} style={styles.stat} accessible accessibilityLabel={`${s.label}: ${s.value ?? 0}`}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value ?? '–'}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={type.h2}>Genres you love</Text>
        <Text style={[type.body, { fontSize: 13, marginTop: 2 }]}>Saved to your account as you tap.</Text>
        <View style={styles.chips}>
          {GENRES.map((g) => (
            <Chip key={g} label={g} selected={!!m?.favoriteGenres.includes(g)} onPress={() => toggleGenre(g)} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Card style={{ padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Sparkles size={20} color={colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={type.title}>{m?.stats.starsAdded ?? 0} stars added by you</Text>
            <Text style={type.small}>
              {m?.stats.roundsPlayed ?? 0} trivia rounds played · best streak {m?.stats.bestStreak ?? 0}
            </Text>
          </View>
        </Card>
        {m?.email ? <Text style={[type.small, { marginTop: space.lg, textAlign: 'center' }]}>Signed in as {m.email}</Text> : null}
        <Button
          label="Sign out"
          icon={LogOut}
          variant="secondary"
          onPress={async () => {
            await signOut();
            toast('Signed out. Paalam!');
          }}
          style={{ marginTop: space.md }}
        />
        <Text style={styles.footer}>PinoyStars v1.0 · Profiles shown are fictional</Text>
      </View>

      {m ? <EditProfileSheet visible={editing} onClose={() => setEditing(false)} initial={{ displayName: m.displayName, city: m.city }} favoriteGenres={m.favoriteGenres} /> : null}
    </ScrollView>
  );
}

function EditProfileSheet({
  visible, onClose, initial, favoriteGenres,
}: { visible: boolean; onClose: () => void; initial: { displayName: string; city: string }; favoriteGenres: Genre[] }) {
  const update = useUpdateMe();
  const toast = useToast();
  const { control, handleSubmit, reset, setError, formState: { errors } } = useForm({ resolver: zodResolver(profileForm), defaultValues: initial });

  const { displayName, city } = initial;
  useEffect(() => {
    if (visible) reset({ displayName, city });
  }, [visible, displayName, city, reset]);

  const save = handleSubmit((values) =>
    update.mutate(
      { ...values, favoriteGenres },
      {
        onSuccess: () => {
          toast('Profile updated');
          onClose();
        },
        onError: (e) => {
          if (e instanceof ApiError && e.fields) {
            for (const [k, msg] of Object.entries(e.fields)) setError(k as 'displayName' | 'city', { message: msg });
          } else toast(e.message, 'error');
        },
      },
    ),
  );

  return (
    <Sheet visible={visible} title="Edit profile" onClose={onClose} footer={<Button label="Save changes" onPress={save} loading={update.isPending} />}>
      <Controller
        control={control}
        name="displayName"
        render={({ field }) => <TextField label="Display name" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.displayName?.message} autoCapitalize="words" />}
      />
      <Controller
        control={control}
        name="city"
        render={({ field }) => <TextField label="City" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.city?.message} placeholder="e.g. Quezon City" />}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.maroonDeep, borderBottomLeftRadius: radius.xxxl, borderBottomRightRadius: radius.xxxl, paddingHorizontal: space.xl, paddingBottom: space.xxl },
  avatar: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.displayBlack, fontSize: 26, color: colors.maroonDeep },
  name: { fontFamily: fonts.displayBlack, fontSize: 22, color: colors.cream },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.cream400, marginTop: 2 },
  edit: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.whiteGlass, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 10, marginTop: space.xl },
  stat: { flex: 1, backgroundColor: colors.whiteGlass, borderRadius: radius.xl, paddingVertical: 10, alignItems: 'center' },
  statLabel: { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.cream400 },
  statValue: { fontFamily: fonts.displayBlack, fontSize: 20, color: colors.cream, marginTop: 2 },
  section: { paddingHorizontal: space.xl, paddingTop: space.xxl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  footer: { fontFamily: fonts.body, fontSize: 11.5, color: colors.inkSubtle, textAlign: 'center', marginTop: space.xl },
});

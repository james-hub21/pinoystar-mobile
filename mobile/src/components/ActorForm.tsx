import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Award, Camera, Film, Plus, Trash, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch, type DefaultValues, type FieldPath } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '@/lib/api';
import { uploadPhoto } from '@/lib/queries';
import { colors, fonts, radius, shadow, space, type } from '@/lib/theme';
import { CREDIT_TYPES, DECADES, GENDERS, GENERATIONS, GENRES, NETWORKS, type ActorDetail, type ActorInput } from '@/lib/types';
import { actorForm, type ActorFormValues } from '@/lib/validation';
import { ChipPicker, MultiChipPicker, TextField } from './fields';
import { useToast } from './overlays';
import { Button, FieldError, IconButton, Press } from './ui';

export function toFormValues(a: ActorDetail): ActorFormValues {
  return {
    name: a.name,
    stageName: a.stageName,
    tagline: a.tagline,
    birthdate: a.birthdate ?? '',
    hometown: a.hometown,
    network: a.network,
    agency: a.agency,
    generation: a.generation,
    gender: a.gender,
    decades: a.decades,
    genres: a.genres,
    baseFans: String(a.baseFans),
    bio: a.bio,
    photoUrl: a.photoUrl ?? '',
    instagram: a.socials.instagram ?? '',
    x: a.socials.x ?? '',
    tiktok: a.socials.tiktok ?? '',
    credits: [...a.credits].sort((x, y) => y.year - x.year).map((c) => ({ title: c.title, year: String(c.year), type: c.type, role: c.role })),
    awards: a.awards.map((w) => ({ title: w.title, org: w.org, year: String(w.year), won: w.won })),
  };
}

export const emptyForm: DefaultValues<ActorFormValues> = {
  name: '', stageName: '', tagline: '', birthdate: '', hometown: '', agency: '', bio: '', photoUrl: '',
  baseFans: '', instagram: '', x: '', tiktok: '', decades: [], genres: [], credits: [], awards: [],
};

function toInput(v: ActorFormValues): ActorInput {
  return {
    name: v.name,
    stageName: v.stageName,
    tagline: v.tagline,
    birthdate: v.birthdate,
    hometown: v.hometown,
    network: v.network,
    agency: v.agency,
    generation: v.generation,
    gender: v.gender,
    decades: v.decades,
    genres: v.genres,
    baseFans: Number(v.baseFans.replace(/,/g, '') || 0),
    bio: v.bio,
    photoUrl: v.photoUrl,
    socials: { instagram: v.instagram || undefined, x: v.x || undefined, tiktok: v.tiktok || undefined },
    credits: v.credits.map((c) => ({ ...c, year: Number(c.year) })),
    awards: v.awards.map((a) => ({ ...a, year: Number(a.year) })),
  };
}

/** Map server field paths ("socials.instagram", "credits.0.year") onto form field names. */
const toFieldPath = (key: string) => key.replace(/^socials\./, '') as FieldPath<ActorFormValues>;

export function ActorForm({
  title, submitLabel, defaultValues, onSubmit, onCancel, submitting,
}: {
  title: string;
  submitLabel: string;
  defaultValues: DefaultValues<ActorFormValues>;
  onSubmit: (input: ActorInput) => Promise<unknown>;
  onCancel: () => void;
  submitting: boolean;
}) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const scroll = useRef<ScrollView>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const { control, handleSubmit, setValue, setError, formState: { errors } } = useForm<ActorFormValues>({
    resolver: zodResolver(actorForm),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
  const credits = useFieldArray({ control, name: 'credits' });
  const awards = useFieldArray({ control, name: 'awards' });
  const photoUrl = useWatch({ control, name: 'photoUrl' });

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [3, 4], quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      toast('Photos must be 5 MB or smaller.', 'error');
      return;
    }
    setPreview(asset.uri);
    setUploading(true);
    try {
      const url = await uploadPhoto(asset);
      setValue('photoUrl', url, { shouldDirty: true });
      toast('Photo uploaded');
    } catch (e) {
      setPreview(null);
      toast((e as Error).message, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Built inside the press handler so refs are only touched in event handlers, never during render.
  const submit = () =>
    handleSubmit(
      async (values) => {
        try {
          await onSubmit(toInput(values));
        } catch (e) {
          if (e instanceof ApiError && e.fields) {
            for (const [k, msg] of Object.entries(e.fields)) setError(toFieldPath(k), { message: msg });
            toast('Please fix the highlighted fields.', 'error');
          } else toast((e as Error).message, 'error');
        }
      },
      () => {
        toast('Please fix the highlighted fields.', 'error');
        scroll.current?.scrollTo({ y: 0, animated: true });
      },
    )();

  const image = preview ?? (photoUrl || null);
  const thisYear = String(new Date().getFullYear());

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.topBar, { paddingTop: Platform.OS === 'ios' ? space.lg : insets.top + space.md }]}>
        <IconButton icon={X} label="Cancel" onPress={onCancel} filled color={colors.maroonDeep} size={38} />
        <Text style={[type.h2, { fontSize: 18 }]} accessibilityRole="header">
          {title}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView ref={scroll} contentContainerStyle={{ padding: space.xl, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        <View style={styles.photoRow}>
          <Press onPress={pickPhoto} disabled={uploading} accessibilityRole="button" accessibilityLabel={image ? 'Change photo' : 'Add photo'} style={styles.photo}>
            {image ? <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" /> : <Camera size={28} color={colors.maroonSoft} />}
            {uploading ? (
              <View style={[StyleSheet.absoluteFill, styles.uploading]}>
                <ActivityIndicator color={colors.cream} />
              </View>
            ) : null}
          </Press>
          <View style={{ flex: 1 }}>
            <Text style={type.title}>Profile photo</Text>
            <Text style={[type.small, { marginTop: 2 }]}>JPEG, PNG or WebP up to 5 MB. Portrait crops look best.</Text>
            <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
              <Button label={image ? 'Change' : 'Choose photo'} variant="secondary" onPress={pickPhoto} disabled={uploading} style={{ minHeight: 40, paddingHorizontal: 14 }} />
              {image ? (
                <Button label="Remove" variant="secondary" onPress={() => { setPreview(null); setValue('photoUrl', ''); }} disabled={uploading} style={{ minHeight: 40, paddingHorizontal: 14 }} />
              ) : null}
            </View>
          </View>
        </View>

        <Text style={styles.group}>Basics</Text>
        <Controller control={control} name="name" render={({ field }) => (
          <TextField label="Full name" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.name?.message} placeholder="e.g. Maria Luisa Santos" autoCapitalize="words" />
        )} />
        <Controller control={control} name="stageName" render={({ field }) => (
          <TextField label="Stage name" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.stageName?.message} placeholder="e.g. Isay" autoCapitalize="words" />
        )} />
        <Controller control={control} name="tagline" render={({ field }) => (
          <TextField label="Tagline" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.tagline?.message} placeholder="One line fans will remember" hint="5–140 characters" maxLength={140} />
        )} />
        <Controller control={control} name="birthdate" render={({ field }) => (
          <TextField label="Birthdate" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.birthdate?.message} placeholder="YYYY-MM-DD" hint="Optional, e.g. 1995-08-21" keyboardType="numbers-and-punctuation" maxLength={10} />
        )} />
        <Controller control={control} name="hometown" render={({ field }) => (
          <TextField label="Hometown" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.hometown?.message} placeholder="e.g. Cebu City, Cebu" autoCapitalize="words" />
        )} />

        <Text style={styles.group}>Career</Text>
        <Controller control={control} name="network" render={({ field }) => (
          <ChipPicker label="Network" required options={NETWORKS} value={field.value} onChange={field.onChange} error={errors.network?.message} />
        )} />
        <Controller control={control} name="agency" render={({ field }) => (
          <TextField label="Agency" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.agency?.message} placeholder="e.g. Star Magic" autoCapitalize="words" />
        )} />
        <Controller control={control} name="generation" render={({ field }) => (
          <ChipPicker label="Generation" required options={GENERATIONS} value={field.value} onChange={field.onChange} error={errors.generation?.message} />
        )} />
        <Controller control={control} name="gender" render={({ field }) => (
          <ChipPicker label="Gender" required options={GENDERS} value={field.value} onChange={field.onChange} error={errors.gender?.message} />
        )} />
        <Controller control={control} name="genres" render={({ field }) => (
          <MultiChipPicker label="Genres" required options={GENRES} value={field.value ?? []} onChange={field.onChange} error={errors.genres?.message} hint="Pick all that apply" />
        )} />
        <Controller control={control} name="decades" render={({ field }) => (
          <MultiChipPicker label="Active decades" options={DECADES} value={field.value ?? []} onChange={field.onChange} error={errors.decades?.message} />
        )} />
        <Controller control={control} name="baseFans" render={({ field }) => (
          <TextField label="Fan base" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.baseFans?.message} placeholder="e.g. 250000" hint="Followers across social media" keyboardType="number-pad" />
        )} />
        <Controller control={control} name="bio" render={({ field }) => (
          <TextField label="Biography" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.bio?.message} placeholder="How did they get their start? What are they known for?" multiline maxLength={3000} />
        )} />

        <Text style={styles.group}>Socials</Text>
        {(['instagram', 'x', 'tiktok'] as const).map((k) => (
          <Controller key={k} control={control} name={k} render={({ field }) => (
            <TextField label={k === 'x' ? 'X (Twitter)' : k === 'tiktok' ? 'TikTok' : 'Instagram'} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors[k]?.message} placeholder="@handle" autoCapitalize="none" autoCorrect={false} />
          )} />
        ))}

        <View style={styles.groupRow}>
          <Text style={[styles.group, { marginTop: 0 }]}>Filmography</Text>
          <Text style={type.small}>{credits.fields.length} / 30</Text>
        </View>
        {credits.fields.map((f, i) => (
          <View key={f.id} style={styles.row}>
            <View style={styles.rowHead}>
              <Film size={16} color={colors.maroon} />
              <Text style={[type.title, { flex: 1 }]}>Credit {i + 1}</Text>
              <Press onPress={() => credits.remove(i)} accessibilityRole="button" accessibilityLabel={`Remove credit ${i + 1}`}>
                <Trash size={18} color={colors.pinoyRed} />
              </Press>
            </View>
            <Controller control={control} name={`credits.${i}.title`} render={({ field }) => (
              <TextField label="Title" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.credits?.[i]?.title?.message} placeholder="e.g. Bituin sa Maynila" />
            )} />
            <View style={{ flexDirection: 'row', gap: space.md }}>
              <View style={{ flex: 1 }}>
                <Controller control={control} name={`credits.${i}.role`} render={({ field }) => (
                  <TextField label="Role" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.credits?.[i]?.role?.message} placeholder="Character" />
                )} />
              </View>
              <View style={{ width: 96 }}>
                <Controller control={control} name={`credits.${i}.year`} render={({ field }) => (
                  <TextField label="Year" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.credits?.[i]?.year?.message} keyboardType="number-pad" maxLength={4} placeholder={thisYear} />
                )} />
              </View>
            </View>
            <Controller control={control} name={`credits.${i}.type`} render={({ field }) => (
              <ChipPicker label="Type" required options={CREDIT_TYPES} value={field.value} onChange={field.onChange} error={errors.credits?.[i]?.type?.message} />
            )} />
          </View>
        ))}
        <FieldError message={errors.credits?.message ?? errors.credits?.root?.message} />
        {credits.fields.length < 30 ? (
          <Button label="Add credit" icon={Plus} variant="secondary" onPress={() => credits.append({ title: '', role: '', year: thisYear, type: 'Movie' })} />
        ) : null}

        <View style={[styles.groupRow, { marginTop: space.xxl }]}>
          <Text style={[styles.group, { marginTop: 0 }]}>Awards</Text>
          <Text style={type.small}>{awards.fields.length} / 30</Text>
        </View>
        {awards.fields.map((f, i) => (
          <View key={f.id} style={styles.row}>
            <View style={styles.rowHead}>
              <Award size={16} color={colors.gold} />
              <Text style={[type.title, { flex: 1 }]}>Award {i + 1}</Text>
              <Press onPress={() => awards.remove(i)} accessibilityRole="button" accessibilityLabel={`Remove award ${i + 1}`}>
                <Trash size={18} color={colors.pinoyRed} />
              </Press>
            </View>
            <Controller control={control} name={`awards.${i}.title`} render={({ field }) => (
              <TextField label="Award" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.awards?.[i]?.title?.message} placeholder="e.g. Best Actress" />
            )} />
            <View style={{ flexDirection: 'row', gap: space.md }}>
              <View style={{ flex: 1 }}>
                <Controller control={control} name={`awards.${i}.org`} render={({ field }) => (
                  <TextField label="Organization" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.awards?.[i]?.org?.message} placeholder="e.g. Gawad Urian" />
                )} />
              </View>
              <View style={{ width: 96 }}>
                <Controller control={control} name={`awards.${i}.year`} render={({ field }) => (
                  <TextField label="Year" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.awards?.[i]?.year?.message} keyboardType="number-pad" maxLength={4} placeholder={thisYear} />
                )} />
              </View>
            </View>
            <Controller control={control} name={`awards.${i}.won`} render={({ field }) => (
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{field.value ? 'Won' : 'Nominated'}</Text>
                <Switch value={field.value} onValueChange={field.onChange} trackColor={{ true: colors.maroon, false: colors.cream300 }} thumbColor={colors.white} accessibilityLabel="Won this award" />
              </View>
            )} />
          </View>
        ))}
        {awards.fields.length < 30 ? (
          <Button label="Add award" icon={Plus} variant="secondary" onPress={() => awards.append({ title: '', org: '', year: thisYear, won: false })} />
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        <Button label={submitLabel} onPress={submit} loading={submitting} disabled={uploading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingBottom: space.md, borderBottomWidth: 1, borderBottomColor: colors.cream300, backgroundColor: colors.cream },
  photoRow: { flexDirection: 'row', gap: space.lg, alignItems: 'center' },
  photo: { width: 96, height: 128, borderRadius: radius.xxl, backgroundColor: colors.cream200, borderWidth: 1.5, borderColor: colors.cream300, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  uploading: { backgroundColor: 'rgba(43,7,14,0.55)', alignItems: 'center', justifyContent: 'center' },
  group: { ...type.label, marginTop: space.xxl, marginBottom: space.md },
  groupRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space.xxl, marginBottom: space.md },
  row: { backgroundColor: colors.white, borderRadius: radius.xxl, padding: space.lg, paddingBottom: 0, marginBottom: space.md, ...shadow.card },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: space.lg },
  switchLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.maroonDeep },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.xl, paddingTop: space.md, backgroundColor: colors.cream, borderTopWidth: 1, borderTopColor: colors.cream300 },
});

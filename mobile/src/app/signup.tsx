import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { MailCheck, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextField } from '@/components/fields';
import { useToast } from '@/components/overlays';
import { Button, EmptyState, FieldError, IconButton, Press } from '@/components/ui';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { colors, fonts, space, type } from '@/lib/theme';
import { signupForm } from '@/lib/validation';

export default function Signup() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const toast = useToast();
  const [formError, setFormError] = useState<string>();
  const [confirmSent, setConfirmSent] = useState(false);
  const { control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signupForm),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  const submit = handleSubmit(async ({ displayName, email, password }) => {
    setFormError(undefined);
    try {
      const { needsConfirmation } = await signUp(email, password, displayName);
      if (needsConfirmation) {
        setConfirmSent(true);
        return;
      }
      toast(`Welcome, ${displayName.split(' ')[0]}!`);
      if (next) router.replace(next as Href);
      else router.replace('/');
    } catch (e) {
      if (e instanceof ApiError && e.fields) {
        for (const [k, msg] of Object.entries(e.fields)) setError(k as 'email' | 'password' | 'displayName', { message: msg });
      }
      setFormError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    }
  });

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (confirmSent) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream, paddingTop: insets.top + space.huge }}>
        <EmptyState icon={MailCheck} title="Check your inbox" body="We sent a confirmation link to your email. Open it, then come back and sign in." cta="Go to sign in" onCta={() => router.replace('/login')} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingTop: (Platform.OS === 'ios' ? 0 : insets.top) + space.lg }} keyboardShouldPersistTaps="handled">
        <IconButton icon={X} label="Close" onPress={close} filled color={colors.maroonDeep} size={38} />
        <Text style={styles.brand}>
          Pino<Text style={{ color: colors.gold }}>y</Text>Stars
        </Text>
        <Text style={[type.h1, { marginTop: space.sm }]} accessibilityRole="header">
          Create your account
        </Text>
        <Text style={[type.body, { marginTop: 4, marginBottom: space.xxl }]}>It’s free. Your favorites follow you to any phone.</Text>

        <Controller control={control} name="displayName" render={({ field }) => (
          <TextField label="Your name" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.displayName?.message} autoCapitalize="words" autoComplete="name" placeholder="e.g. Maria Clara" />
        )} />
        <Controller control={control} name="email" render={({ field }) => (
          <TextField label="Email" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.email?.message} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="you@example.com" />
        )} />
        <Controller control={control} name="password" render={({ field }) => (
          <TextField label="Password" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.password?.message} secureTextEntry autoComplete="new-password" hint="At least 8 characters" onSubmitEditing={submit} returnKeyType="go" />
        )} />
        <FieldError message={formError} />

        <Button label="Create account" onPress={submit} loading={isSubmitting} style={{ marginTop: space.md }} />
        <View style={styles.switch}>
          <Text style={type.body}>Already have an account?</Text>
          <Press onPress={() => router.replace({ pathname: '/login', params: next ? { next } : {} })} accessibilityRole="button">
            <Text style={styles.link}>Sign in</Text>
          </Press>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  brand: { fontFamily: fonts.displayBlack, fontSize: 18, color: colors.maroon, marginTop: space.xxl },
  switch: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: space.xl },
  link: { fontFamily: fonts.bold, fontSize: 14, color: colors.maroon },
});

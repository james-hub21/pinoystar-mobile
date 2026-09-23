import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextField } from '@/components/fields';
import { useToast } from '@/components/overlays';
import { Button, FieldError, IconButton, Press } from '@/components/ui';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { colors, fonts, space, type } from '@/lib/theme';
import { loginForm } from '@/lib/validation';

export default function Login() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const toast = useToast();
  const [formError, setFormError] = useState<string>();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginForm),
    defaultValues: { email: '', password: '' },
  });

  const done = () => {
    if (next) router.replace(next as Href);
    else if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const submit = handleSubmit(async ({ email, password }) => {
    setFormError(undefined);
    try {
      await signIn(email, password);
      toast('Welcome back!');
      done();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    }
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingTop: (Platform.OS === 'ios' ? 0 : insets.top) + space.lg }} keyboardShouldPersistTaps="handled">
        <IconButton icon={X} label="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} filled color={colors.maroonDeep} size={38} />
        <Text style={styles.brand}>
          Pino<Text style={{ color: colors.gold }}>y</Text>Stars
        </Text>
        <Text style={[type.h1, { marginTop: space.sm }]} accessibilityRole="header">
          Sign in
        </Text>
        <Text style={[type.body, { marginTop: 4, marginBottom: space.xxl }]}>Follow stars, keep a watchlist and add your own profiles.</Text>

        <Controller control={control} name="email" render={({ field }) => (
          <TextField label="Email" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.email?.message} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" placeholder="you@example.com" />
        )} />
        <Controller control={control} name="password" render={({ field }) => (
          <TextField label="Password" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.password?.message} secureTextEntry autoComplete="password" textContentType="password" onSubmitEditing={submit} returnKeyType="go" />
        )} />
        <FieldError message={formError} />

        <Button label="Sign in" onPress={submit} loading={isSubmitting} style={{ marginTop: space.md }} />
        <View style={styles.switch}>
          <Text style={type.body}>New to PinoyStars?</Text>
          <Press onPress={() => router.replace({ pathname: '/signup', params: next ? { next } : {} })} accessibilityRole="button">
            <Text style={styles.link}>Create an account</Text>
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

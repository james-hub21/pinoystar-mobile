import { Archivo_700Bold, Archivo_800ExtraBold, Archivo_900Black } from '@expo-google-fonts/archivo';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '@/components/overlays';
import { ApiError } from '@/lib/api';
import { AuthProvider } from '@/lib/auth';
import { colors } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            // Retry flaky networks once; never retry 4xx answers from our API.
            retry: (count, error) => count < 1 && !(error instanceof ApiError && error.status >= 400 && error.status < 500),
          },
        },
      }),
  );
  const [loaded, fontError] = useFonts({
    Archivo_700Bold, Archivo_800ExtraBold, Archivo_900Black,
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || fontError) SplashScreen.hideAsync();
  }, [loaded, fontError]);

  if (!loaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="actor/[id]/index" />
              <Stack.Screen name="actor/new" options={{ presentation: 'modal' }} />
              <Stack.Screen name="actor/[id]/edit" options={{ presentation: 'modal' }} />
              <Stack.Screen name="news/[id]" />
              <Stack.Screen name="trivia" options={{ contentStyle: { backgroundColor: colors.maroonDeep } }} />
              <Stack.Screen name="login" options={{ presentation: 'modal' }} />
              <Stack.Screen name="signup" options={{ presentation: 'modal' }} />
            </Stack>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

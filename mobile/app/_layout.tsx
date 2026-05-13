import * as Sentry from '@sentry/react-native';
import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { queryClient } from '@/lib/queryClient';

SplashScreen.preventAutoHideAsync();

// Init Sentry at module level — no-ops gracefully when DSN is absent.
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,
  debug: false,
});

function RouteGuard() {
  const { user, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth     = segments[0] === '(auth)';
    const inTabs     = segments[0] === '(tabs)';
    const inProvider = segments[0] === '(provider)';
    const isProvider = user?.role === 'provider_owner';

    if (!user && !inAuth) {
      router.replace('/(auth)/login');
      return;
    }
    if (user && inAuth) {
      router.replace(isProvider ? '/(provider)' : '/(tabs)');
      return;
    }
    // Cross-role guard: provider landing in traveler tabs or vice-versa
    if (user && isProvider && inTabs)     router.replace('/(provider)');
    if (user && !isProvider && inProvider) router.replace('/(tabs)');
  }, [user, isLoading, segments]);

  return null;
}

function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => { hydrate(); }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <RouteGuard />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: { backgroundColor: '#EFF7FD' },
        }}
      >
        <Stack.Screen name="(tabs)"     options={{ animation: 'none' }} />
        <Stack.Screen name="(provider)" options={{ animation: 'none' }} />
        <Stack.Screen name="(auth)"     options={{ animation: 'fade' }} />
        <Stack.Screen name="search" options={{ animation: 'fade' }} />
        <Stack.Screen name="destination/[slug]" />
        <Stack.Screen name="tour/[slug]" />
        <Stack.Screen name="stay/[slug]" />
        <Stack.Screen name="vehicle/[slug]" />
        <Stack.Screen name="booking" options={{ gestureEnabled: false }} />
        <Stack.Screen name="conversation/[id]" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="wishlist" />
        <Stack.Screen name="account" />
        <Stack.Screen name="provider/booking/[code]" />
        <Stack.Screen name="provider/tour/[id]" />
        <Stack.Screen name="provider/tour/create" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="provider/accommodation/[id]" />
      </Stack>
      <StatusBar style="dark" />
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);

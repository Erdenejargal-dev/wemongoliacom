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

function RouteGuard() {
  const { user, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) router.replace('/(auth)/login');
    if (user && inAuth) router.replace('/(tabs)');
  }, [user, isLoading, segments]);

  return null;
}

export default function RootLayout() {
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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="search" options={{ animation: 'fade' }} />
        <Stack.Screen name="destination/[slug]" />
        <Stack.Screen name="tour/[slug]" />
        <Stack.Screen name="stay/[slug]" />
        <Stack.Screen name="vehicle/[slug]" />
        <Stack.Screen name="booking" />
        <Stack.Screen name="conversation/[id]" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="wishlist" />
        <Stack.Screen name="account" />
      </Stack>
      <StatusBar style="dark" />
    </QueryClientProvider>
  );
}

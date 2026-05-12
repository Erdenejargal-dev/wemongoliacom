import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="select-dates" />
      <Stack.Screen name="travelers" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="request" />
    </Stack>
  );
}

// Design.md §7.4 — AI Assistant Banner Card
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C } from '@/constants/Colors';

export function AIBanner({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>AI ASSISTANT</Text>
          </View>
          <Text style={styles.headline}>Plan your Mongolia trip with AI</Text>
          <Text style={styles.sub}>Get personalized tours, routes & tips</Text>
          <Pressable
            onPress={onPress}
            style={styles.cta}
            accessibilityRole="button"
            accessibilityLabel="Open AI assistant"
          >
            <Text style={styles.ctaText}>Start planning</Text>
          </Pressable>
        </View>
        {/* AI avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>✦</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.navy,
    borderRadius: 16,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  left: { flex: 1, marginRight: 12 },
  chip: {
    backgroundColor: C.blue,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    marginBottom: 4,
  },
  sub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Manrope_400Regular',
    marginBottom: 14,
  },
  cta: {
    backgroundColor: C.blue,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  avatarIcon: {
    color: '#FFFFFF',
    fontSize: 20,
  },
});

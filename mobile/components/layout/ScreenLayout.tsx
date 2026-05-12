import { ReactNode } from 'react';
import { SafeAreaView, StyleSheet, View, ViewStyle } from 'react-native';
import { C } from '@/constants/Colors';
import { PAGE_H_PAD } from '@/constants/Spacing';

export function ScreenLayout({
  children,
  noPadding = false,
  style,
}: {
  children: ReactNode;
  noPadding?: boolean;
  style?: ViewStyle;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.content, noPadding && styles.noPad, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bgPage,
  },
  content: {
    flex: 1,
    paddingHorizontal: PAGE_H_PAD,
  },
  noPad: {
    paddingHorizontal: 0,
  },
});

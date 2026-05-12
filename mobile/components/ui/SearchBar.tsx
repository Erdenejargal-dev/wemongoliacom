import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { C } from '@/constants/Colors';
import { IconSymbol } from './icon-symbol';

export function SearchBar({
  value,
  onChangeText,
  onFilterPress,
  placeholder = 'Search destinations...',
  autoFocus = false,
}: {
  value: string;
  onChangeText: (v: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.inputWrap}>
        <IconSymbol name="magnifyingglass" size={18} color={C.textSubtle} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.textSubtle}
          autoFocus={autoFocus}
          style={styles.input}
          accessibilityLabel="Search"
        />
      </View>
      {onFilterPress && (
        <TouchableOpacity
          onPress={onFilterPress}
          style={styles.filter}
          accessibilityLabel="Open filters"
          accessibilityRole="button"
        >
          <IconSymbol name="slider.horizontal.3" size={18} color={C.textAccent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputWrap: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: C.textPrimary,
    fontFamily: 'Manrope_400Regular',
  },
  filter: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

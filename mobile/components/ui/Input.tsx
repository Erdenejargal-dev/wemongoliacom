import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { C } from '@/constants/Colors';

type Props = TextInputProps & {
  label?: string;
  containerStyle?: ViewStyle;
};

export function Input({ label, containerStyle, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={C.textSubtle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
        style={[styles.input, focused && styles.focused, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: C.textMuted,
    marginBottom: 6,
    fontFamily: 'Manrope_400Regular',
  },
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 13,
    color: C.textPrimary,
    fontFamily: 'Manrope_400Regular',
  },
  focused: {
    borderWidth: 1,
    borderColor: C.blue,
  },
});

import React, { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius, space } from '@/lib/theme';
import { Chip, FieldError } from './ui';

interface FieldProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

/** Label above, calm focus ring, inline error below (never placeholder-as-label). */
export const TextField = forwardRef<TextInput, FieldProps>(function TextField(
  { label, hint, error, required, style, onFocus, onBlur, multiline, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={{ color: colors.pinoyRed }}> *</Text> : null}
      </Text>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.cream400}
        accessibilityLabel={label}
        accessibilityHint={hint}
        multiline={multiline}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          multiline && { minHeight: 110, textAlignVertical: 'top', paddingTop: 12 },
          focused && styles.inputFocused,
          !!error && styles.inputError,
          style,
        ]}
      />
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      <FieldError message={error} />
    </View>
  );
});

export function ChipPicker<T extends string>({
  label, options, value, onChange, error, required,
}: {
  label: string;
  options: readonly T[];
  value: T | undefined;
  onChange: (v: T) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <View style={styles.field} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={{ color: colors.pinoyRed }}> *</Text> : null}
      </Text>
      <View style={styles.chips}>
        {options.map((o) => (
          <Chip key={o} label={o} selected={value === o} onPress={() => onChange(o)} />
        ))}
      </View>
      <FieldError message={error} />
    </View>
  );
}

export function MultiChipPicker<T extends string>({
  label, options, value, onChange, error, required, hint,
}: {
  label: string;
  options: readonly T[];
  value: T[];
  onChange: (v: T[]) => void;
  error?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <View style={styles.field} accessibilityLabel={label}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={{ color: colors.pinoyRed }}> *</Text> : null}
      </Text>
      <View style={styles.chips}>
        {options.map((o) => (
          <Chip
            key={o}
            label={o}
            selected={value.includes(o)}
            onPress={() => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])}
          />
        ))}
      </View>
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      <FieldError message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: space.lg },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.maroonDeep, marginBottom: 6 },
  input: {
    minHeight: 48,
    borderRadius: radius.xl2,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.cream300,
    paddingHorizontal: 14,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ink,
  },
  inputFocused: { borderColor: colors.gold },
  inputError: { borderColor: colors.pinoyRed },
  hint: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSubtle, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});

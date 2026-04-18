import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
  prefix?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, containerStyle, prefix, style, ...rest },
  ref,
) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, error && styles.inputError]}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.gray400}
          style={[styles.input, style]}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : hint ? <Text style={styles.hintText}>{hint}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  label: {
    ...typography.caption,
    color: colors.gray700,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  inputError: { borderColor: colors.danger },
  prefix: {
    ...typography.body,
    color: colors.gray500,
    marginRight: spacing.sm,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    ...typography.body,
    color: colors.gray900,
  },
  errorText: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
  hintText: { ...typography.caption, color: colors.gray500, marginTop: spacing.xs },
});

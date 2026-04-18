import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing } from '../../lib/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  leftIcon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant].base,
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && variantStyles[variant].pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles[variant].textColor} />
      ) : (
        <View style={styles.row}>
          {leftIcon}
          <Text style={[styles.text, { color: variantStyles[variant].textColor, fontSize: sizeText[size] }]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const variantStyles: Record<Variant, { base: ViewStyle; pressed: ViewStyle; textColor: string }> = {
  primary: {
    base: { backgroundColor: colors.primary },
    pressed: { backgroundColor: colors.primaryDark },
    textColor: '#fff',
  },
  secondary: {
    base: { backgroundColor: colors.primarySoft },
    pressed: { backgroundColor: '#F8DCC4' },
    textColor: colors.primary,
  },
  outline: {
    base: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary },
    pressed: { backgroundColor: colors.primarySoft },
    textColor: colors.primary,
  },
  ghost: {
    base: { backgroundColor: 'transparent' },
    pressed: { backgroundColor: colors.gray100 },
    textColor: colors.gray700,
  },
  danger: {
    base: { backgroundColor: colors.danger },
    pressed: { backgroundColor: '#DC2626' },
    textColor: '#fff',
  },
};

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  md: { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.lg },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
};

const sizeText: Record<Size, number> = {
  sm: 13,
  md: 15,
  lg: 17,
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

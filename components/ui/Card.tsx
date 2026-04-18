import { Pressable, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing } from '../../lib/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof spacing | number;
}

export function Card({ children, onPress, style, padding = 'lg' }: CardProps) {
  const pad = typeof padding === 'number' ? padding : spacing[padding];
  const content = (
    <View style={[styles.card, { padding: pad }, style]}>{children}</View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: { opacity: 0.85 },
});

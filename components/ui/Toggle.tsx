import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface ToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Toggle({ label, description, value, onValueChange }: ToggleProps) {
  return (
    <Pressable style={styles.row} onPress={() => onValueChange(!value)}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: { flex: 1 },
  label: { ...typography.body, fontWeight: '600', color: colors.gray800 },
  description: { ...typography.caption, color: colors.gray500, marginTop: 2 },
  track: {
    width: 48,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.gray200,
    padding: 2,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: colors.primary },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  thumbOn: { alignSelf: 'flex-end' },
});

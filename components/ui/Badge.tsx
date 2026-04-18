import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../lib/theme';

type Tone = 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'brand';

interface BadgeProps {
  label: string;
  tone?: Tone;
}

const TONES: Record<Tone, { bg: string; fg: string }> = {
  info: { bg: colors.infoSoft, fg: colors.info },
  success: { bg: colors.successSoft, fg: '#047857' },
  warning: { bg: colors.warningSoft, fg: '#B45309' },
  danger: { bg: colors.dangerSoft, fg: '#B91C1C' },
  neutral: { bg: colors.gray100, fg: colors.gray700 },
  brand: { bg: colors.primarySoft, fg: colors.primary },
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  text: {
    ...typography.tiny,
    fontWeight: '600',
  },
});

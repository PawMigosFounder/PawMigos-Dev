import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../lib/theme';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  image?: ImageSourcePropType;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, image, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.root}>
      {image ? <Image source={image} style={styles.image} resizeMode="contain" /> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} fullWidth={false} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  image: { width: 140, height: 140, marginBottom: spacing.lg },
  title: { ...typography.h3, color: colors.gray800, textAlign: 'center' },
  desc: { ...typography.body, color: colors.gray500, textAlign: 'center', marginTop: spacing.sm },
  action: { marginTop: spacing.xl },
});

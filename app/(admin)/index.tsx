import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { useAuth } from '../../lib/auth-context';
import { colors, spacing, typography } from '../../lib/theme';

export default function AdminHome() {
  const { logout } = useAuth();
  return (
    <Screen>
      <View style={styles.c}>
        <Text style={styles.title}>Admin</Text>
        <Text style={styles.body}>Use the web dashboard for admin moderation.</Text>
        <Button title="Log out" variant="outline" onPress={logout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  c: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h1, color: colors.gray900 },
  body: { ...typography.body, color: colors.gray600 },
});

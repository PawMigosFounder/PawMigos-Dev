import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { colors, spacing, typography } from '../../lib/theme';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pending: 0, accepted: 0, completed: 0 });
  const load = useCallback(async () => {
    const res = await api.get<any[]>('/api/bookings?role=provider');
    if (res.success && res.data) {
      setStats({
        pending: res.data.filter((b) => b.status === 'PENDING').length,
        accepted: res.data.filter((b) => b.status === 'ACCEPTED').length,
        completed: res.data.filter((b) => b.status === 'COMPLETED').length,
      });
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <View>
          <Text style={styles.hi}>Hi {user?.name?.split(' ')[0] || 'there'}</Text>
          <Text style={styles.sub}>Here's your business at a glance.</Text>
        </View>
        <View style={styles.statsRow}>
          <Card style={styles.stat}><Text style={styles.statNum}>{stats.pending}</Text><Text style={styles.statLabel}>Pending</Text></Card>
          <Card style={styles.stat}><Text style={styles.statNum}>{stats.accepted}</Text><Text style={styles.statLabel}>Accepted</Text></Card>
          <Card style={styles.stat}><Text style={styles.statNum}>{stats.completed}</Text><Text style={styles.statLabel}>Completed</Text></Card>
        </View>
        <Card>
          <View style={styles.headerRow}>
            <Text style={styles.h3}>Verification</Text>
            <Badge tone="success" label="Verified" />
          </View>
          <Text style={styles.caption}>Your profile is live on the marketplace.</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hi: { ...typography.h2, color: colors.gray900 },
  sub: { ...typography.body, color: colors.gray600, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { ...typography.h1, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.gray600, marginTop: 4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  h3: { ...typography.h3, color: colors.gray900 },
  caption: { ...typography.caption, color: colors.gray600, marginTop: 4 },
});

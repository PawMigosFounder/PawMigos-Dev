import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/ui/Screen';
import { api } from '../../lib/api';
import { BOOKING_STATUS_LABELS } from '../../lib/constants';
import { colors, spacing, typography } from '../../lib/theme';

export default function ProviderBookings() {
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    const res = await api.get<any[]>('/api/bookings?role=provider');
    if (res.success && res.data) setItems(res.data);
    setRefreshing(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (id: string, action: 'accept' | 'reject') => {
    await api.post(`/api/bookings/${id}/${action}`, {});
    load();
  };

  return (
    <Screen>
      <View style={{ padding: spacing.lg }}><Text style={styles.title}>Requests</Text></View>
      <FlatList
        data={items}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState title="No requests" description="New booking requests will appear here." />}
        renderItem={({ item }) => {
          const status = BOOKING_STATUS_LABELS[item.status] || { label: item.status, tone: 'neutral' as const };
          return (
            <Card>
              <View style={styles.row}>
                <Text style={styles.service}>{item.service?.title}</Text>
                <Badge tone={status.tone} label={status.label} />
              </View>
              <Text style={styles.meta}>{item.user?.name} · {item.pet?.name}</Text>
              <Text style={styles.meta}>{new Date(item.date).toDateString()} · {item.startTime}</Text>
              {item.status === 'PENDING' && (
                <View style={styles.actions}>
                  <Button title="Decline" variant="outline" size="sm" onPress={() => act(item.id, 'reject')} />
                  <View style={{ flex: 1 }}>
                    <Button title="Accept" size="sm" onPress={() => act(item.id, 'accept')} />
                  </View>
                </View>
              )}
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.gray900 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  service: { ...typography.body, fontWeight: '700', color: colors.gray900, flex: 1 },
  meta: { ...typography.caption, color: colors.gray600, marginTop: 4 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, alignItems: 'center' },
});

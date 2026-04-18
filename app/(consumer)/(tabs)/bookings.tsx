import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Screen } from '../../../components/ui/Screen';
import { api } from '../../../lib/api';
import { BOOKING_STATUS_LABELS } from '../../../lib/constants';
import { colors, spacing, typography } from '../../../lib/theme';
import type { Booking } from '../../../lib/types';

export default function Bookings() {
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get<any[]>('/api/bookings');
    if (res.success && res.data) setItems(res.data);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen>
      <View style={styles.header}><Text style={styles.title}>My Bookings</Text></View>
      <FlatList
        data={items}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState title="No bookings yet" description="Explore providers and book your first service." />}
        renderItem={({ item }) => {
          const status = BOOKING_STATUS_LABELS[item.status] || { label: item.status, tone: 'neutral' as const };
          return (
            <Card>
              <View style={styles.row}>
                <Text style={styles.service}>{item.service?.title}</Text>
                <Badge tone={status.tone} label={status.label} />
              </View>
              <Text style={styles.meta}>{item.provider?.name} · {item.pet?.name}</Text>
              <Text style={styles.meta}>{new Date(item.date).toDateString()} · {item.startTime}</Text>
              <Text style={styles.price}>₹{item.price}</Text>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.gray900 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  service: { ...typography.body, fontWeight: '700', color: colors.gray900, flex: 1 },
  meta: { ...typography.caption, color: colors.gray600, marginTop: 4 },
  price: { ...typography.body, color: colors.primary, fontWeight: '700', marginTop: spacing.xs },
});

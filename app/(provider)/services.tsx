import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/ui/Screen';
import { api } from '../../lib/api';
import { colors, spacing, typography } from '../../lib/theme';

export default function ProviderServices() {
  const [services, setServices] = useState<any[]>([]);
  const load = useCallback(async () => {
    const res = await api.get<any>('/api/providers/me/services');
    if (res.success && res.data) setServices(res.data);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <Screen>
      <View style={{ padding: spacing.lg }}><Text style={styles.title}>My Services</Text></View>
      <FlatList
        data={services}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        ListEmptyComponent={<EmptyState title="No services yet" description="Add a service from your web dashboard." />}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.name}>{item.title}</Text>
              <Badge tone={item.isActive ? 'success' : 'neutral'} label={item.isActive ? 'Active' : 'Off'} />
            </View>
            <Text style={styles.meta}>{item.category} · ₹{item.price}</Text>
            {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.gray900 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { ...typography.body, fontWeight: '700', color: colors.gray900, flex: 1 },
  meta: { ...typography.caption, color: colors.gray600, marginTop: 4 },
  desc: { ...typography.body, color: colors.gray700, marginTop: spacing.xs },
});

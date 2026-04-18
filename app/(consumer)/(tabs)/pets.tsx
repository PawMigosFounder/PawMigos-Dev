import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Screen } from '../../../components/ui/Screen';
import { api } from '../../../lib/api';
import { colors, spacing, typography } from '../../../lib/theme';
import type { Pet } from '../../../lib/types';

export default function Pets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    const res = await api.get<Pet[]>('/api/pets');
    if (res.success && res.data) setPets(res.data);
    setRefreshing(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <Screen>
      <View style={styles.header}><Text style={styles.title}>My Pets</Text></View>
      <FlatList
        data={pets}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState title="No pets yet" description="Add a pet to start booking services." />}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.placeholder]}>
                  <Ionicons name="paw" size={28} color={colors.primary} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.breed || item.type} · {item.ageGroup} · {item.sex}</Text>
              </View>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.gray900 },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gray100 },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  name: { ...typography.body, fontWeight: '700', color: colors.gray900 },
  meta: { ...typography.caption, color: colors.gray600, marginTop: 4 },
});

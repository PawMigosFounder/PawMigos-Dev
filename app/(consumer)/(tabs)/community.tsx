import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Screen } from '../../../components/ui/Screen';
import { api } from '../../../lib/api';
import { colors, spacing, typography } from '../../../lib/theme';

export default function Community() {
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    const res = await api.get<{ posts: any[] }>('/api/community');
    if (res.success && res.data) setPosts(res.data.posts);
    setRefreshing(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <Screen>
      <View style={styles.header}><Text style={styles.title}>Community</Text></View>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState title="No posts yet" description="Be the first to share a moment." />}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              {item.user?.profilePhoto ? (
                <Image source={{ uri: item.user.profilePhoto }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.placeholder]}>
                  <Ionicons name="person" size={20} color={colors.primary} />
                </View>
              )}
              <Text style={styles.author}>{item.user?.name}</Text>
            </View>
            <Text style={styles.content}>{item.content}</Text>
            {item.mediaUrl ? <Image source={{ uri: item.mediaUrl }} style={styles.media} /> : null}
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.gray900 },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray100 },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  author: { ...typography.body, fontWeight: '600', color: colors.gray900 },
  content: { ...typography.body, color: colors.gray800, marginTop: spacing.sm },
  media: { width: '100%', height: 200, borderRadius: 12, marginTop: spacing.sm, backgroundColor: colors.gray100 },
});

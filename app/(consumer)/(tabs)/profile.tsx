import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { useAuth } from '../../../lib/auth-context';
import { colors, spacing, typography } from '../../../lib/theme';

export default function Profile() {
  const { user, logout } = useAuth();
  return (
    <Screen>
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Card>
          <View style={styles.row}>
            {user?.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.placeholder]}>
                <Ionicons name="person" size={28} color={colors.primary} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.meta}>{user?.phone}</Text>
              <Text style={styles.meta}>{user?.city}</Text>
            </View>
          </View>
        </Card>
        <Card>
          <Pressable style={styles.item}><Ionicons name="heart-outline" size={20} color={colors.gray700} /><Text style={styles.itemText}>Saved providers</Text></Pressable>
          <Pressable style={styles.item}><Ionicons name="card-outline" size={20} color={colors.gray700} /><Text style={styles.itemText}>Payment methods</Text></Pressable>
          <Pressable style={styles.item}><Ionicons name="settings-outline" size={20} color={colors.gray700} /><Text style={styles.itemText}>Settings</Text></Pressable>
          <Pressable style={styles.item}><Ionicons name="help-circle-outline" size={20} color={colors.gray700} /><Text style={styles.itemText}>Help & Support</Text></Pressable>
        </Card>
        <Button title="Log out" variant="outline" onPress={logout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.gray100 },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  name: { ...typography.h3, color: colors.gray900 },
  meta: { ...typography.caption, color: colors.gray600, marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  itemText: { ...typography.body, color: colors.gray800 },
});

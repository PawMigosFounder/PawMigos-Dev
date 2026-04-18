// Phone entry screen. Posts to /api/auth/send-otp, then routes to OTP screen.

import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../lib/api';
import { colors, spacing, typography } from '../../lib/theme';

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    const full = `+91${digits}`;
    const res = await api.post<{ sent: boolean; devCode?: string }>(
      '/api/auth/send-otp',
      { phone: full },
      { skipAuth: true },
    );
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Failed to send OTP');
      return;
    }
    router.push({ pathname: '/(auth)/otp', params: { phone: full, devCode: res.data?.devCode || '' } });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.tagline}>Care Worth Wagging About</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Enter your mobile number to get started.</Text>

          <Input
            label="Mobile Number"
            placeholder="10-digit number"
            keyboardType="number-pad"
            maxLength={10}
            prefix="+91"
            value={phone}
            onChangeText={setPhone}
            error={error || undefined}
            autoFocus
          />

          <Button title="Send OTP" onPress={onSubmit} loading={loading} disabled={loading} />

          <Text style={styles.legal}>
            By continuing you agree to our Terms and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  hero: { alignItems: 'center', marginBottom: spacing['2xl'] },
  logo: { width: 200, height: 72 },
  tagline: { ...typography.body, color: colors.gray600, marginTop: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  title: { ...typography.h2, color: colors.gray900 },
  subtitle: { ...typography.body, color: colors.gray600, marginBottom: spacing.sm },
  legal: { ...typography.caption, color: colors.gray500, textAlign: 'center', marginTop: spacing.sm },
});

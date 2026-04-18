// OTP entry screen. Verifies via auth-context.login(), then routes by role.

import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { colors, radius, spacing, typography } from '../../lib/theme';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const { phone, devCode } = useLocalSearchParams<{ phone: string; devCode?: string }>();
  const { login } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (devCode) {
      setDigits(devCode.padEnd(OTP_LENGTH, '').slice(0, OTP_LENGTH).split(''));
    }
  }, [devCode]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const setDigit = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = clean;
    setDigits(next);
    if (clean && idx < OTP_LENGTH - 1) inputs.current[idx + 1]?.focus();
  };

  const onKeyPress = (idx: number, key: string) => {
    if (key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const submit = async () => {
    const code = digits.join('');
    if (code.length !== OTP_LENGTH) {
      setError('Enter the 6-digit code');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await login(phone as string, code);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Invalid OTP');
      return;
    }
    // Index gate at / will redirect based on role/onboarding state.
    router.replace('/');
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    const res = await api.post<{ sent: boolean; devCode?: string }>(
      '/api/auth/send-otp',
      { phone },
      { skipAuth: true },
    );
    setResending(false);
    if (res.success) {
      setCooldown(30);
      if (res.data?.devCode) {
        setDigits(res.data.devCode.padEnd(OTP_LENGTH, '').slice(0, OTP_LENGTH).split(''));
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to <Text style={styles.phone}>{phone}</Text>
        </Text>

        <View style={styles.otpRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(r) => {
                inputs.current[i] = r;
              }}
              style={[styles.otpBox, d && styles.otpBoxFilled, error && styles.otpBoxError]}
              keyboardType="number-pad"
              maxLength={1}
              value={d}
              onChangeText={(v) => setDigit(i, v)}
              onKeyPress={(e) => onKeyPress(i, e.nativeEvent.key)}
              autoFocus={i === 0}
              returnKeyType="done"
            />
          ))}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button title="Verify & Continue" onPress={submit} loading={loading} disabled={loading} />

        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't get it?</Text>
          <Pressable onPress={resend} disabled={cooldown > 0 || resending}>
            <Text style={[styles.resendLink, (cooldown > 0 || resending) && styles.resendDisabled]}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending...' : 'Resend OTP'}
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Change number</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  title: { ...typography.h2, color: colors.gray900 },
  subtitle: { ...typography.body, color: colors.gray600 },
  phone: { color: colors.gray900, fontWeight: '600' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.md },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: colors.gray900,
  },
  otpBoxFilled: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  otpBoxError: { borderColor: colors.danger },
  errorText: { ...typography.caption, color: colors.danger },
  resendRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.sm },
  resendLabel: { ...typography.caption, color: colors.gray600 },
  resendLink: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  resendDisabled: { color: colors.gray400 },
  back: { ...typography.caption, color: colors.gray600, textAlign: 'center', marginTop: spacing.sm },
});

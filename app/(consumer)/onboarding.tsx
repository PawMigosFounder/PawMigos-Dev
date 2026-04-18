// Consumer onboarding — 3 step flow (intent, profile, optional pet).
// Posts to /api/users/onboarding, then optionally /api/pets. Mirrors the web app.

import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { AGE_GROUPS, PET_SEX, PET_TYPES, SUPPORTED_CITIES } from '../../lib/constants';
import { colors, radius, spacing, typography } from '../../lib/theme';

type Step = 'intent' | 'profile' | 'pet';
type Intent = 'HAS_PET' | 'PROVIDER';

const CITY_OPTIONS = SUPPORTED_CITIES.map((c) => ({ value: c, label: c }));

export default function Onboarding() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [step, setStep] = useState<Step>('intent');
  const [intent, setIntent] = useState<Intent | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [pet, setPet] = useState({ name: '', type: 'DOG', breed: '', ageGroup: 'ADULT', sex: 'MALE' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chooseIntent = (v: Intent) => {
    setIntent(v);
    setStep('profile');
  };

  const submitProfile = async () => {
    if (!name.trim() || !city) {
      setError('Name and city are required');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await api.post('/api/users/onboarding', {
      name: name.trim(),
      city,
      onboardingIntent: intent,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Could not save profile');
      return;
    }
    if (intent === 'HAS_PET') {
      setStep('pet');
      return;
    }
    await refresh();
    router.replace('/');
  };

  const submitPet = async () => {
    if (!pet.name.trim()) {
      setError('Pet name is required');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await api.post('/api/pets', pet);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Could not add pet');
      return;
    }
    await refresh();
    router.replace('/');
  };

  const skipPet = async () => {
    await refresh();
    router.replace('/');
  };

  const steps: Step[] = intent === 'HAS_PET' ? ['intent', 'profile', 'pet'] : ['intent', 'profile'];
  const idx = steps.indexOf(step);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Welcome to PawMigos</Text>
        <Text style={styles.subtitle}>Let's set you up in a minute.</Text>
        <View style={styles.steps}>
          {steps.map((s, i) => (
            <View key={s} style={[styles.stepBar, i <= idx && styles.stepBarActive]} />
          ))}
        </View>
      </View>

      <View style={styles.card}>
        {step === 'intent' && (
          <View style={{ gap: spacing.md }}>
            <Text style={styles.h2}>How will you use PawMigos?</Text>
            <Pressable
              style={[styles.choice, intent === 'HAS_PET' && styles.choiceActive]}
              onPress={() => chooseIntent('HAS_PET')}
            >
              <Text style={styles.choiceEmoji}>🐾</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.choiceTitle}>I'm a pet parent</Text>
                <Text style={styles.choiceBody}>Book trusted hosts, groomers, walkers and more.</Text>
              </View>
            </Pressable>
            <Pressable
              style={[styles.choice, intent === 'PROVIDER' && styles.choiceActive]}
              onPress={() => chooseIntent('PROVIDER')}
            >
              <Text style={styles.choiceEmoji}>🏪</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.choiceTitle}>I'm a service provider</Text>
                <Text style={styles.choiceBody}>List services, manage availability, grow your business.</Text>
              </View>
            </Pressable>
          </View>
        )}

        {step === 'profile' && (
          <View style={{ gap: spacing.md }}>
            <Text style={styles.h2}>Your profile</Text>
            <Input label="Full name" placeholder="Your name" value={name} onChangeText={setName} />
            <Select label="City" placeholder="Choose your city" value={city} options={CITY_OPTIONS} onChange={setCity} />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.row}>
              <Button title="Back" variant="ghost" onPress={() => setStep('intent')} />
              <View style={{ flex: 1 }}>
                <Button
                  title={intent === 'HAS_PET' ? 'Next: Add pet' : 'Complete setup'}
                  onPress={submitProfile}
                  loading={loading}
                />
              </View>
            </View>
          </View>
        )}

        {step === 'pet' && (
          <View style={{ gap: spacing.md }}>
            <Text style={styles.h2}>Add your pet</Text>
            <Input label="Pet name" placeholder="e.g., Buddy" value={pet.name} onChangeText={(v) => setPet({ ...pet, name: v })} />
            <Select label="Species" value={pet.type} options={PET_TYPES} onChange={(v) => setPet({ ...pet, type: v })} />
            <Input label="Breed" placeholder="e.g., Golden Retriever" value={pet.breed} onChangeText={(v) => setPet({ ...pet, breed: v })} />
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Select label="Age" value={pet.ageGroup} options={AGE_GROUPS} onChange={(v) => setPet({ ...pet, ageGroup: v })} />
              </View>
              <View style={{ flex: 1 }}>
                <Select label="Sex" value={pet.sex} options={PET_SEX} onChange={(v) => setPet({ ...pet, sex: v })} />
              </View>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.row}>
              <Button title="Skip" variant="ghost" onPress={skipPet} />
              <View style={{ flex: 1 }}>
                <Button title="Complete setup" onPress={submitPet} loading={loading} />
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, backgroundColor: colors.background, flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { width: 160, height: 56 },
  title: { ...typography.h1, color: colors.gray900, marginTop: spacing.md },
  subtitle: { ...typography.body, color: colors.gray600, marginTop: spacing.xs },
  steps: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.lg, width: '100%' },
  stepBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.gray200 },
  stepBarActive: { backgroundColor: colors.primary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  h2: { ...typography.h3, color: colors.gray900 },
  choice: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  choiceActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  choiceEmoji: { fontSize: 28 },
  choiceTitle: { ...typography.body, fontWeight: '700', color: colors.gray900 },
  choiceBody: { ...typography.caption, color: colors.gray600, marginTop: 2 },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  errorText: { ...typography.caption, color: colors.danger },
});

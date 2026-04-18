// Root gate: decides where the user lands based on auth + role + onboarding state.
// Runs after AuthProvider hydrates.

import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { Splash } from '../components/Splash';
import { useAuth } from '../lib/auth-context';

const MIN_SPLASH_MS = 1400;

export default function Index() {
  const { user, loading } = useAuth();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  if (loading || !minElapsed) {
    return <Splash />;
  }

  if (!user) return <Redirect href="/(auth)/phone" />;
  if (user.role === 'ADMIN') return <Redirect href="/(admin)" />;
  if (user.role === 'PROVIDER') return <Redirect href="/(provider)" />;
  if (!user.onboardingCompleted) return <Redirect href="/(consumer)/onboarding" />;
  return <Redirect href="/(consumer)/marketplace" />;
}

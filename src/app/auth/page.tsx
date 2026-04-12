'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';

type Step = 'phone' | 'otp';

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await api.post<any>('/api/auth/send-otp', { phone });
    setLoading(false);

    if (res.success) {
      setStep('otp');
    } else {
      setError(res.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(phone, otp);
    setLoading(false);

    if (result.success) {
      if (result.isNew) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    } else {
      setError(result.error || 'Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-transparent relative z-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/images/app-icon.png"
            alt="PawMigos"
            width={100}
            height={100}
            className="mx-auto mb-3 w-auto h-auto mix-blend-multiply"
            priority
          />
          <h1 className="text-3xl font-bold text-[#F26F28] mb-2">PawMigos</h1>
          <p className="text-gray-600">Care Worth Wagging About</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-3xl shadow-xl shadow-[#F26F28]/5 p-8">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Welcome</h2>
              <p className="text-sm text-gray-500">Enter your phone number to get started</p>

              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-300">+91</span>
                <Input
                  type="tel"
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  required
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" fullWidth loading={loading} disabled={phone.length !== 10}>
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Verify OTP</h2>
              <p className="text-sm text-gray-500">
                Enter the 6-digit code sent to +91 {phone}
              </p>

              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em]"
                required
              />

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" fullWidth loading={loading} disabled={otp.length !== 6}>
                Verify & Continue
              </Button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                className="w-full text-sm text-[#F26F28] hover:underline"
              >
                Change phone number
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

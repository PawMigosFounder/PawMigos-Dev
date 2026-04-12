'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Step = 'status' | 'aadhaar' | 'otp' | 'selfie';

export default function VerificationPage() {
  const [step, setStep] = useState<Step>('status');
  const [status, setStatus] = useState<any>(null);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [requestId, setRequestId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<any>('/api/providers/verification').then((res) => {
      if (res.success) {
        setStatus(res.data);
        if (res.data?.verificationStatus === 'VERIFIED') setStep('status');
      }
      setLoading(false);
    });
  }, []);

  const handleInitVerification = async () => {
    if (aadhaarNumber.length < 12) { setError('Enter valid Aadhaar number (12 digits)'); return; }
    setSubmitting(true); setError('');
    const res = await api.post<any>('/api/providers/verification', { aadhaarNumber });
    setSubmitting(false);
    if (res.success) {
      setRequestId(res.data.requestId);
      setStep('otp');
    } else {
      setError(res.error || 'Failed to initiate verification');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError('Enter 6-digit OTP'); return; }
    setSubmitting(true); setError('');
    const res = await api.post<any>('/api/providers/verification', {
      action: 'complete', requestId, otp, selfieBase64: 'dev-selfie-placeholder',
    });
    setSubmitting(false);
    if (res.success) {
      setStatus({ ...status, verificationStatus: 'VERIFIED' });
      setStep('status');
    } else {
      setError(res.error || 'Verification failed');
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Loading...</div>;

  return (
    <div className="px-4 py-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Identity Verification</h1>

      {step === 'status' && (
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Verification Status</span>
              <Badge variant={status?.verificationStatus === 'VERIFIED' ? 'success' : status?.verificationStatus === 'FAILED' ? 'error' : 'warning'}>
                {status?.verificationStatus || 'Not started'}
              </Badge>
            </div>
            {status?.verificationStatus === 'VERIFIED' ? (
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-green-700 font-medium">Your identity is verified!</p>
                <p className="text-sm text-green-600 mt-1">Your profile is active and visible to consumers.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Identity verification is required to activate your provider profile. We use Aadhaar OTP e-KYC through Signzy for secure verification.
                </p>
                <Button fullWidth onClick={() => setStep('aadhaar')}>
                  {status?.verificationStatus === 'FAILED' ? 'Retry Verification' : 'Start Verification'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'aadhaar' && (
        <Card>
          <CardHeader><h2 className="font-semibold">Aadhaar Verification</h2></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">Enter your 12-digit Aadhaar number or VID. An OTP will be sent to your Aadhaar-linked mobile number.</p>
            <Input
              label="Aadhaar Number / VID"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              placeholder="Enter 12-digit Aadhaar number"
              maxLength={16}
            />
            <p className="text-xs text-gray-400">In dev mode, use any 12-digit number. OTP will be &quot;123456&quot;.</p>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep('status')}>Back</Button>
              <Button fullWidth loading={submitting} onClick={handleInitVerification}>Send OTP</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'otp' && (
        <Card>
          <CardHeader><h2 className="font-semibold">Enter Aadhaar OTP</h2></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">Enter the 6-digit OTP sent to your Aadhaar-linked mobile number.</p>
            <Input
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
            <p className="text-xs text-gray-400">In dev mode, use OTP: 123456</p>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep('aadhaar')}>Back</Button>
              <Button fullWidth loading={submitting} onClick={handleVerifyOtp}>Verify & Complete</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

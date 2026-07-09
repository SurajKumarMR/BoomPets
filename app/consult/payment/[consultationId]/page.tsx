'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const consultationId = params.consultationId as string;

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [consultation, setConsultation] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadConsultation() {
      if (!supabase) {
        setError('Database service is not configured.');
        setLoading(false);
        return;
      }

      const { data, error: consultError } = await supabase
        .from('consultations')
        .select(`
          *,
          specialist:specialists(*),
          pet:pets(*)
        `)
        .eq('id', consultationId)
        .single();

      if (consultError) {
        setError('Consultation not found');
      } else {
        setConsultation(data);
      }

      setLoading(false);
    }

    loadConsultation();
  }, [consultationId]);

  async function handlePayment() {
    setError('');
    setProcessing(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId,
          amount: consultation.specialist.rate,
          specialistId: consultation.specialist_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Consultation not found</p>
      </div>
    );
  }

  const platformFee = consultation.specialist.rate * 0.15;
  const specialistEarnings = consultation.specialist.rate * 0.85;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white px-4 py-6">
        <button
          onClick={() => router.back()}
          className="text-white mb-2"
        >
          ‹ Back
        </button>
        <h1 className="text-2xl font-bold">Payment</h1>
        <p className="text-amber-100 text-sm mt-1">Complete your booking</p>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Consultation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Specialist</span>
              <span className="font-semibold">Dr. {consultation.specialist.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pet</span>
              <span className="font-semibold">{consultation.pet.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type</span>
              <span className="font-semibold capitalize">{consultation.consultation_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time</span>
              <span className="font-semibold">
                {new Date(consultation.scheduled_at).toLocaleDateString()}{' '}
                {new Date(consultation.scheduled_at).toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Consultation Fee</span>
              <span className="font-semibold">${consultation.specialist.rate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Platform Fee (15%)</span>
              <span>${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Specialist receives (85%)</span>
              <span>${specialistEarnings.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-amber-700">${consultation.specialist.rate.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-600 text-center" role="alert">
            {error}
          </p>
        )}

        <Button
          variant="primary"
          className="w-full"
          onClick={handlePayment}
          disabled={processing}
        >
          {processing ? <><LoadingSpinner size="sm" /> Processing…</> : 'Pay with Stripe'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Secure payment powered by Stripe. Your payment information is encrypted and secure.
        </p>
      </div>
    </main>
  );
}

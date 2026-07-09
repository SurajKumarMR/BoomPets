'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function BookConsultationPage() {
  const router = useRouter();
  const params = useParams();
  const specialistId = params.specialistId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [specialist, setSpecialist] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [consultationType, setConsultationType] = useState('video');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!supabase) {
        setError('Database service is not configured.');
        setLoading(false);
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        router.push('/auth/login');
        return;
      }

      // Load specialist
      const { data: specialistData, error: specialistError } = await supabase
        .from('specialists')
        .select('*')
        .eq('id', specialistId)
        .single();

      if (specialistError) {
        setError('Specialist not found');
        setLoading(false);
        return;
      }

      setSpecialist(specialistData);

      // Load user's pets
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id);

      if (!petsError && petsData) {
        setPets(petsData);
        if (petsData.length > 0) {
          setSelectedPet(petsData[0].id);
        }
      }

      setLoading(false);
    }

    loadData();
  }, [router, specialistId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (!supabase) {
      setError('Database service is not configured.');
      setSaving(false);
      return;
    }

    if (!selectedPet) {
      setError('Please select a pet');
      setSaving(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`);

    const { data, error: bookingError } = await supabase
      .from('consultations')
      .insert({
        user_id: user.id,
        specialist_id: specialistId,
        pet_id: selectedPet,
        consultation_type: consultationType,
        scheduled_at: scheduledAt.toISOString(),
        notes,
        status: 'pending',
      })
      .select()
      .single();

    if (bookingError) {
      setError(bookingError.message);
      setSaving(false);
      return;
    }

    // Redirect to payment
    router.push(`/consult/payment/${data.id}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Specialist not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white px-4 py-6">
        <button
          onClick={() => router.back()}
          className="text-white mb-2"
        >
          ‹ Back
        </button>
        <h1 className="text-2xl font-bold">Book Consultation</h1>
        <p className="text-amber-100 text-sm mt-1">with Dr. {specialist.name}</p>
      </div>

      <div className="px-4 -mt-6">
        <Card className="mb-4">
          <CardContent className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
              👨‍⚕️
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Dr. {specialist.name}</h3>
              <p className="text-sm text-gray-600">{specialist.specialty}</p>
              <p className="text-sm font-semibold text-amber-700">${specialist.rate}/session</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consultation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {pets.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Please add a pet profile first before booking.
                  </p>
                  <Button
                    variant="primary"
                    className="mt-2"
                    onClick={() => router.push('/pets/add')}
                  >
                    Add Pet
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Pet
                    </label>
                    <select
                      value={selectedPet}
                      onChange={(e) => setSelectedPet(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                      required
                    >
                      {pets.map((pet) => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name} ({pet.species})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consultation Type
                    </label>
                    <select
                      value={consultationType}
                      onChange={(e) => setConsultationType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                      required
                    >
                      <option value="video">Video Call</option>
                      <option value="chat">Chat Only</option>
                      <option value="in-person">In-Person</option>
                    </select>
                  </div>

                  <Input
                    label="Preferred Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />

                  <Input
                    label="Preferred Time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                      placeholder="Describe your pet's symptoms or concerns..."
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving || pets.length === 0}
                      variant="primary"
                      className="flex-1"
                    >
                      {saving ? <><LoadingSpinner size="sm" /> Booking…</> : 'Continue to Payment'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

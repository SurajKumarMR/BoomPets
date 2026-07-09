'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FileUpload } from '@/components/ui/FileUpload';
import { Card, CardContent } from '@/components/ui/Card';

export default function AddPetPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('male');
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (!supabase) {
      setError('Database service is not configured.');
      setSaving(false);
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      router.push('/auth/login');
      return;
    }

    const { error: insertError } = await supabase
      .from('pets')
      .insert({
        owner_id: user.id,
        name,
        species,
        breed: breed || null,
        age: age ? parseInt(age) : null,
        weight: weight ? parseFloat(weight) : null,
        gender,
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push('/pets');
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
        <h1 className="text-2xl font-bold">Add New Pet</h1>
        <p className="text-amber-100 text-sm mt-1">Create a profile for your pet</p>
      </div>

      <div className="px-4 -mt-6">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FileUpload
                label="Upload Pet Photo"
                accept="image/*"
                onFileSelect={(file) => setPhoto(file)}
                preview={true}
              />

              <Input
                label="Pet Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Species
                </label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                  required
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="rabbit">Rabbit</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <Input
                label="Breed (optional)"
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <Input
                label="Age (years)"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="0"
                step="0.1"
              />

              <Input
                label="Weight (kg)"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="0"
                step="0.1"
              />

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
                  disabled={saving}
                  variant="primary"
                  className="flex-1"
                >
                  {saving ? <><LoadingSpinner size="sm" /> Saving…</> : 'Add Pet'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

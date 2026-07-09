'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  photo_url?: string;
}

export default function PetsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPets() {
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

      const { data, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (petsError) {
        setError(petsError.message);
      } else {
        setPets(data || []);
      }

      setLoading(false);
    }

    loadPets();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white px-4 py-6">
          <h1 className="text-2xl font-bold">My Pets</h1>
        </div>
        <div className="px-4 mt-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white px-4 py-6">
        <h1 className="text-2xl font-bold">My Pets</h1>
        <p className="text-amber-100 text-sm mt-1">Manage your pet profiles</p>
      </div>

      <div className="px-4 mt-4">
        <Button
          variant="primary"
          className="w-full mb-4"
          onClick={() => router.push('/pets/add')}
        >
          + Add New Pet
        </Button>

        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}

        {pets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets yet</h3>
              <p className="text-gray-600 mb-4">Add your first pet to get started</p>
              <Button
                variant="primary"
                onClick={() => router.push('/pets/add')}
              >
                Add Pet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pets.map((pet) => (
              <Card key={pet.id} onClick={() => router.push(`/pets/${pet.id}`)}>
                <CardContent className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {pet.photo_url ? (
                      <img
                        src={pet.photo_url}
                        alt={pet.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                    <p className="text-sm text-gray-600">
                      {pet.breed || pet.species}
                      {pet.age ? ` • ${pet.age} years old` : ''}
                    </p>
                    {pet.weight && (
                      <p className="text-xs text-gray-500">{pet.weight} kg</p>
                    )}
                  </div>
                  <div className="text-gray-400">›</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

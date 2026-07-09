'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FileUpload } from '@/components/ui/FileUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadUser() {
      if (!supabase) {
        setError('Authentication service is not configured.');
        setLoading(false);
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);
      setName(user.user_metadata?.name || '');
      setPhone(user.user_metadata?.phone || '');
      setAddress(user.user_metadata?.address || '');
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!supabase || !user) {
      setError('Unable to update profile.');
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { name, phone, address },
    });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSuccess('Profile updated successfully!');
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white px-4 py-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-amber-100 text-sm mt-1">Manage your account information</p>
      </div>

      <div className="px-4 -mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center text-3xl">
                  {name ? name[0].toUpperCase() : '👤'}
                </div>
              </div>

              <FileUpload
                label="Upload Profile Photo"
                accept="image/*"
                onFileSelect={(file) => setAvatar(file)}
                preview={true}
              />

              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email"
                type="email"
                value={user?.email || ''}
                disabled
                helperText="Email cannot be changed"
              />

              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Input
                label="Address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-green-600" role="alert">
                  {success}
                </p>
              )}

              <Button
                type="submit"
                disabled={saving}
                variant="primary"
                className="w-full"
              >
                {saving ? <><LoadingSpinner size="sm" /> Saving…</> : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/auth/reset-password')}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../supabase-provider';

export default function ProfilePage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/login');
        return;
      }
      setUserEmail(data.user.email ?? null);
      setLoading(false);
    }

    load();
  }, [supabase, router]);

  if (loading) {
    return (
      <main>
        <h1>Profile</h1>
        <div className="loading"></div>
      </main>
    );
  }

  return (
    <main>
      <h1>Profile</h1>
      <p>Email: <strong>{userEmail}</strong></p>
    </main>
  );
}

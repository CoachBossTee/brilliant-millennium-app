'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from './supabase-provider';

export default function HomePage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserEmail(data.user.email || null);
      }
      setLoading(false);
    }
    checkUser();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <main>
        <h1>Welcome</h1>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Brilliant Millennium</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Infinite Possibilities. One Vision.
      </p>
      
      {userEmail ? (
        <>
          <p>Signed in as: <strong>{userEmail}</strong></p>
          <button onClick={handleSignOut} style={{ marginTop: '1rem' }}>
            Sign Out
          </button>
        </>
      ) : (
        <p>Please sign in to access your projects and tasks.</p>
      )}
    </main>
  );
}

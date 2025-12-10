'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from './supabase-provider';

export default function HomePage() {
  const supabase = useSupabase();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email || null);
      setLoading(false);
    }
    checkUser();
  }, [supabase]);

  if (loading) {
    return (
      <main>
        <div className="page-header">
          <h1>Welcome</h1>
        </div>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main>
      <div className="page-header">
        <h1>Brilliant Millennium</h1>
        <p className="page-description">
          Infinite Possibilities. One Vision.
        </p>
      </div>
      
      {userEmail ? (
        <div>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            Welcome back! Use the sidebar to navigate to your projects and tasks.
          </p>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            Sign in to access your projects and tasks.
          </p>
        </div>
      )}
    </main>
  );
}

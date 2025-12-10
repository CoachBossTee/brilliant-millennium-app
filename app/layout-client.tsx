'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SupabaseProvider, useSupabase } from './supabase-provider';
import { 
  Home, 
  LayoutDashboard, 
  CheckSquare, 
  User, 
  LogIn,
  LogOut
} from 'lucide-react';

function Sidebar() {
  const pathname = usePathname();
  const supabase = useSupabase();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email || null);
    }
    getUser();
  }, [supabase]);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Projects', icon: LayoutDashboard },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">Brilliant Millennium</div>
        <div className="sidebar-tagline">Infinite Possibilities. One Vision.</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        {!userEmail && (
          <Link href="/login" className={`sidebar-link ${isActive('/login') ? 'active' : ''}`}>
            <LogIn size={20} />
            <span>Login</span>
          </Link>
        )}
      </nav>

      {userEmail && (
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-email">{userEmail}</div>
            </div>
            <button
              onClick={handleSignOut}
              style={{
                background: 'transparent',
                padding: '0.5rem',
                boxShadow: 'none',
              }}
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function LayoutGroup({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          {children}
        </div>
      </div>
    </SupabaseProvider>
  );
}

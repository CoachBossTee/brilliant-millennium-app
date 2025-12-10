'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../supabase-provider';

type Project = {
  id: number;
  name: string;
  user_id: string;
};

export default function DashboardPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    async function load() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        router.replace('/login');
        return;
      }

      setUserId(userData.user.id);

      const { data, error } = await supabase.from('projects').select('*');
      if (error) {
        setErrorMsg(error.message);
      } else {
        setProjects(data ?? []);
      }

      setLoading(false);
    }

    load();
  }, [supabase, router]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!newName.trim() || !userId) return;

    const { data, error } = await supabase
      .from('projects')
      .insert({ name: newName, user_id: userId })
      .select();

    if (error) {
      setErrorMsg(error.message);
    } else if (data && data.length > 0) {
      setProjects(prev => [...prev, data[0] as Project]);
      setSuccessMsg('Project added!');
      setTimeout(() => setSuccessMsg(null), 3000);
      setNewName('');
    }
  }

  async function handleUpdate(id: number) {
    if (!editingName.trim()) return;
    setErrorMsg(null);

    const { data, error } = await supabase
      .from('projects')
      .update({ name: editingName })
      .eq('id', id)
      .select();

    if (error) {
      setErrorMsg(error.message);
    } else if (data && data.length > 0) {
      setProjects(prev => prev.map(p => (p.id === id ? data[0] as Project : p)));
      setSuccessMsg('Project updated!');
      setTimeout(() => setSuccessMsg(null), 3000);
      setEditingId(null);
      setEditingName('');
    }
  }

  async function handleDelete(id: number) {
    setErrorMsg(null);

    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setProjects(prev => prev.filter(p => p.id !== id));
      setSuccessMsg('Project deleted!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  }

  if (loading) {
    return (
      <main>
        <h1>Dashboard</h1>
        <div className="loading"></div>
      </main>
    );
  }

  return (
    <main>
      <h1>Dashboard</h1>

      {errorMsg && <div className="error">{errorMsg}</div>}
      {successMsg && <div className="success">{successMsg}</div>}

      <form onSubmit={handleAdd} style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="New project name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button type="submit" style={{ marginLeft: '0.5rem' }}>Add Project</button>
      </form>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Create your first one above!</p>
        </div>
      ) : (
        <>
          <p style={{ marginBottom: '1rem' }}>Projects: {projects.length}</p>
          <ul>
            {projects.map(project => (
              <li key={project.id}>
                {editingId === project.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button onClick={() => handleUpdate(project.id)}>Save</button>
                    <button onClick={() => { setEditingId(null); setEditingName(''); }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>{project.name}</span>
                    <button onClick={() => { setEditingId(project.id); setEditingName(project.name); }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(project.id)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../supabase-provider';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

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
      setProjects(prev => [...prev, data as Project]);
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
      setProjects(prev => prev.map(p => (p.id === id ? data as Project : p)));
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
        <div className="page-header">
          <h1>Projects</h1>
          <p className="page-description">Manage your projects</p>
        </div>
        <div className="loading"></div>
      </main>
    );
  }

  return (
    <main>
      <div className="page-header">
        <h1>Projects</h1>
        <p className="page-description">Create and manage your projects</p>
      </div>

      {errorMsg && <div className="error">{errorMsg}</div>}
      {successMsg && <div className="success">{successMsg}</div>}

      <form onSubmit={handleAdd} style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="New project name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          style={{ flex: 1, marginBottom: 0 }}
        />
        <button type="submit">
          <Plus size={18} />
          Add Project
        </button>
      </form>

      {projects.length === 0 ? (
        <div className="empty-state">
          <h3>No projects yet</h3>
          <p>Create your first project to get started!</p>
        </div>
      ) : (
        <>
          <p style={{ marginBottom: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
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
                    <button onClick={() => handleUpdate(project.id)} className="secondary">
                      <Check size={16} />
                    </button>
                    <button onClick={() => { setEditingId(null); setEditingName(''); }} className="secondary">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>{project.name}</span>
                    <button 
                      onClick={() => { setEditingId(project.id); setEditingName(project.name); }}
                      className="secondary"
                    >
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(project.id)}>
                      <Trash2 size={16} />
                    </button>
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

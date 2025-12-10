'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../supabase-provider';
import { Plus, Pencil, Trash2, Check, X, FolderOpen, CheckSquare, TrendingUp, Clock } from 'lucide-react';

type Project = {
  id: number;
  name: string;
  user_id: string;
  created_at?: string;
};

export default function DashboardPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskCount, setTaskCount] = useState(0);
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

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) {
        setErrorMsg(projectsError.message);
      } else {
        setProjects(projectsData ?? []);
      }

      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });

      setTaskCount(count || 0);
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
      setProjects(prev => [data[0] as Project, ...prev]);
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

  function formatDate(dateString?: string) {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <main>
        <div className="page-header">
          <h1>Dashboard</h1>
          <p className="page-description">Overview of your projects and tasks</p>
        </div>
        <div className="loading"></div>
      </main>
    );
  }

  return (
    <main>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-description">Overview of your projects and tasks</p>
      </div>

      {errorMsg && <div className="error">{errorMsg}</div>}
      {successMsg && <div className="success">{successMsg}</div>}

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
          border: '1px solid rgba(233, 30, 99, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FolderOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{projects.length}</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Projects</div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(0, 188, 212, 0.1) 100%)',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2196f3, #00bcd4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckSquare size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{taskCount}</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Tasks</div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(103, 58, 183, 0.1) 100%)',
          border: '1px solid rgba(156, 39, 176, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #9c27b0, #673ab7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{projects.length + taskCount}</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Total Items</div>
          </div>
        </div>
      </div>

      {/* Add Project Form */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          marginBottom: '1rem',
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          Create New Project
        </h2>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Project name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            style={{ flex: 1, marginBottom: 0 }}
          />
          <button type="submit">
            <Plus size={18} />
            Add Project
          </button>
        </form>
      </div>

      {/* Projects Grid */}
      <div>
        <h2 style={{ 
          fontSize: '1.25rem', 
          marginBottom: '1rem',
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          Your Projects
        </h2>

        {projects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects yet</h3>
            <p>Create your first project above to get started!</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <div key={project.id} className="project-card">
                {editingId === project.id ? (
                  <div className="project-card-edit">
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      autoFocus
                    />
                    <div className="project-card-edit-actions">
                      <button onClick={() => handleUpdate(project.id)} className="secondary">
                        <Check size={16} />
                        Save
                      </button>
                      <button onClick={() => { setEditingId(null); setEditingName(''); }} className="secondary">
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="project-card-icon">
                      <FolderOpen size={24} />
                    </div>
                    <div className="project-card-title">{project.name}</div>
                    <div className="project-card-meta">
                      <Clock size={14} />
                      {formatDate(project.created_at)}
                    </div>
                    <div className="project-card-actions">
                      <button 
                        onClick={() => { setEditingId(project.id); setEditingName(project.name); }}
                        className="secondary"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button onClick={() => handleDelete(project.id)}>
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

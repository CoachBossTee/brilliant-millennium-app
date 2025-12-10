'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../supabase-provider';

type Task = {
  id: number;
  title: string;
  user_id: string;
};

export default function TasksPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    async function load() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        router.replace('/login');
        return;
      }

      setUserId(userData.user.id);

      const { data, error } = await supabase.from('tasks').select('*');
      if (error) {
        setErrorMsg(error.message);
      } else {
        setTasks(data ?? []);
      }

      setLoading(false);
    }

    load();
  }, [supabase, router]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!newTitle.trim() || !userId) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({ title: newTitle, user_id: userId })
      .select();

    if (error) {
      setErrorMsg(error.message);
    } else if (data && data.length > 0) {
      setTasks(prev => [...prev, data[0] as Task]);
      setSuccessMsg('Task added!');
      setTimeout(() => setSuccessMsg(null), 3000);
      setNewTitle('');
    }
  }

  async function handleUpdate(id: number) {
    if (!editingTitle.trim()) return;
    setErrorMsg(null);

    const { data, error } = await supabase
      .from('tasks')
      .update({ title: editingTitle })
      .eq('id', id)
      .select();

    if (error) {
      setErrorMsg(error.message);
    } else if (data && data.length > 0) {
      setTasks(prev => prev.map(t => (t.id === id ? data[0] as Task : t)));
      setSuccessMsg('Task updated!');
      setTimeout(() => setSuccessMsg(null), 3000);
      setEditingId(null);
      setEditingTitle('');
    }
  }

  async function handleDelete(id: number) {
    setErrorMsg(null);

    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
      setSuccessMsg('Task deleted!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  }

  if (loading) {
    return (
      <main>
        <h1>Tasks</h1>
        <div className="loading"></div>
      </main>
    );
  }

  return (
    <main>
      <h1>Tasks</h1>

      {errorMsg && <div className="error">{errorMsg}</div>}
      {successMsg && <div className="success">{successMsg}</div>}

      <form onSubmit={handleAdd} style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="New task title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
        />
        <button type="submit" style={{ marginLeft: '0.5rem' }}>Add Task</button>
      </form>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks yet. Create your first one above!</p>
        </div>
      ) : (
        <>
          <p style={{ marginBottom: '1rem' }}>Tasks: {tasks.length}</p>
          <ul>
            {tasks.map(task => (
              <li key={task.id}>
                {editingId === task.id ? (
                  <>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button onClick={() => handleUpdate(task.id)}>Save</button>
                    <button onClick={() => { setEditingId(null); setEditingTitle(''); }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>{task.title}</span>
                    <button onClick={() => { setEditingId(task.id); setEditingTitle(task.title); }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(task.id)}>Delete</button>
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

import { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';

const AdminUsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ email: '', password: '' });
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadUsers = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data || []);
    } catch (error) {
      setUsers([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = ({ clearFeedback = true } = {}) => {
    setEditing(null);
    setForm({ email: '', password: '' });
    if (clearFeedback) setFeedback('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await usersAPI.update(editing, form);
        setFeedback('User updated successfully.');
      } else {
        await usersAPI.create(form);
        setFeedback('User created successfully.');
      }
      resetForm({ clearFeedback: false });
      loadUsers();
      const bc = new BroadcastChannel('portfolio-cms');
      bc.postMessage({ type: 'cms:update', resource: 'users' });
      bc.close();
    } catch (error) {
      setFeedback('Unable to save user.');
      console.error(error);
    }
  };

  const handleEdit = (user) => {
    setEditing(user.id);
    setForm({ email: user.email || '', password: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await usersAPI.delete(id);
      setUsers((current) => current.filter((user) => user.id !== id));
      setFeedback('User deleted successfully.');
      try {
        const bc = new BroadcastChannel('portfolio-cms');
        bc.postMessage({ type: 'cms:update', resource: 'users' });
        bc.close();
      } catch (broadcastError) {
        console.warn('BroadcastChannel not available:', broadcastError);
      }
    } catch (error) {
      console.error(error);
      setFeedback(error.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8 rounded border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Users</h2>
            <p className="mt-2 text-slate-600">Create and manage administrator accounts for the CMS.</p>
          </div>
          <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
            {editing ? 'Create New User' : 'Reset'}
          </button>
        </div>

        {feedback && <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="username"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                required
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete={editing ? 'new-password' : 'new-password'}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder={editing ? 'Leave empty to keep current password' : 'Enter a secure password'}
                required={!editing}
              />
            </label>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Admin accounts</p>
              <p className="mt-3 text-slate-700">Use this panel to add or update administrator access to the backend CMS.</p>
            </div>
            <button type="submit" className="rounded-full bg-violet-600 px-5 py-3 text-white shadow-sm shadow-violet-400/20">
              {editing ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <h3 className="text-xl font-semibold mb-4">Administrator accounts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-3 font-medium text-slate-900">{user.email}</td>
                  <td className="py-3 px-3 text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleEdit(user)} className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersAdmin;

import { useEffect, useState } from 'react';
import { experienceAPI } from '../utils/api';

const AdminExperienceAdmin = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ role: '', company: '', duration: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadExperience = async () => {
    try {
      const res = await experienceAPI.getAll();
      setItems(res.data || []);
    } catch (error) {
      setItems([]);
    }
  };

  useEffect(() => {
    loadExperience();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ role: '', company: '', duration: '', description: '' });
    setFeedback('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await experienceAPI.update(editing, form);
        setFeedback('Experience updated successfully.');
      } else {
        await experienceAPI.create(form);
        setFeedback('Experience added successfully.');
      }
      resetForm();
      loadExperience();
      const bc = new BroadcastChannel('portfolio-cms');
      bc.postMessage({ type: 'cms:update', resource: 'experience' });
      bc.close();
    } catch (error) {
      setFeedback('Unable to save experience.');
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setForm({
      role: item.role || '',
      company: item.company || '',
      duration: item.duration || '',
      description: item.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this experience item?')) {
      return;
    }

    try {
      await experienceAPI.delete(id);
      setItems((current) => current.filter((item) => item.id !== id));
      setFeedback('Experience item deleted successfully.');
      try {
        const bc = new BroadcastChannel('portfolio-cms');
        bc.postMessage({ type: 'cms:update', resource: 'experience' });
        bc.close();
      } catch (broadcastError) {
        console.warn('BroadcastChannel not available:', broadcastError);
      }
    } catch (error) {
      console.error(error);
      setFeedback(error.response?.data?.message || 'Failed to delete experience item.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8 rounded border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Experience</h2>
            <p className="mt-2 text-slate-600">Manage industry experience entries and keep timeline content synced with the homepage.</p>
          </div>
          <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
            {editing ? 'Create New Entry' : 'Reset'}
          </button>
        </div>

        {feedback && <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Role</span>
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                required
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Company</span>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Duration</span>
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="2023 - Present"
              />
            </label>
          </div>

          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none resize-none"
                rows={8}
                required
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-full bg-violet-600 px-5 py-3 text-white shadow-sm shadow-violet-400/20">
                {editing ? 'Update Experience' : 'Add Experience'}
              </button>
              <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-slate-700">
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="rounded border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <h3 className="text-xl font-semibold mb-4">Timeline entries</h3>
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-slate-500">No experience entries added yet.</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:flex sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{item.role} — {item.company}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.duration}</div>
                  <p className="mt-3 text-slate-600">{item.description}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
                  <button onClick={() => handleEdit(item)} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminExperienceAdmin;

import { useEffect, useState } from 'react';
import { projectsAPI } from '../services/api';

const AdminPortfolioItems = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', image: '', link: '', tech_stack: '' });
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadProjects = async () => {
    try {
      const res = await projectsAPI.getAll();
      setProjects(res.data || []);
    } catch (error) {
      setProjects([]);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const resetForm = ({ clearFeedback = true } = {}) => {
    setEditing(null);
    setForm({ title: '', description: '', image: '', link: '', tech_stack: '' });
    if (clearFeedback) setFeedback('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await projectsAPI.update(editing, form);
        setFeedback('Portfolio item updated successfully.');
      } else {
        await projectsAPI.create(form);
        setFeedback('Portfolio item created successfully.');
      }
      resetForm({ clearFeedback: false });
      loadProjects();
      const bc = new BroadcastChannel('portfolio-cms');
      bc.postMessage({ type: 'cms:update', resource: 'projects' });
      bc.close();
    } catch (error) {
      setFeedback('Unable to save portfolio item.');
      console.error(error);
    }
  };

  const handleEdit = (project) => {
    setEditing(project.id);
    setForm({
      title: project.title || '',
      description: project.description || '',
      image: project.image || '',
      link: project.link || '',
      tech_stack: project.tech_stack || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this portfolio item?')) {
      return;
    }

    try {
      await projectsAPI.delete(id);
      setProjects((current) => current.filter((project) => project.id !== id));
      setFeedback('Portfolio item deleted successfully.');
      try {
        const bc = new BroadcastChannel('portfolio-cms');
        bc.postMessage({ type: 'cms:update', resource: 'projects' });
        bc.close();
      } catch (broadcastError) {
        console.warn('BroadcastChannel not available:', broadcastError);
      }
    } catch (error) {
      console.error(error);
      setFeedback(error.response?.data?.message || 'Failed to delete portfolio item.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8 rounded border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Portfolio Items</h2>
            <p className="mt-2 text-slate-600">Manage the projects shown on the homepage and keep the portfolio section current.</p>
          </div>
          <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
            {editing ? 'Create New Item' : 'Reset'}
          </button>
        </div>

        {feedback && <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Title</span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                required
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none resize-none"
                rows={5}
                required
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Tech stack</span>
              <input
                value={form.tech_stack}
                onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="React,Node.js,MySQL"
              />
            </label>
          </div>

          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Image URL</span>
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="https://..."
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Demo / Repository Link</span>
              <input
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="https://..."
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-full bg-violet-600 px-5 py-3 text-white shadow-sm shadow-violet-400/20">
                {editing ? 'Update Item' : 'Create Item'}
              </button>
              <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-slate-700">
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="rounded border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <h3 className="text-xl font-semibold mb-4">Portfolio list</h3>
        {projects.length === 0 ? (
          <div className="text-slate-500">No portfolio items yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Tech Stack</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-4 py-4 font-semibold text-slate-900">{project.title}</td>
                    <td className="px-4 py-4 text-slate-600 max-w-xl">{project.description}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {(project.tech_stack || '').split(',').map((tag) => tag.trim()).filter(Boolean).join(', ')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => handleEdit(project)} className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(project.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortfolioItems;

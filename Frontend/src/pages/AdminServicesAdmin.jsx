import { useEffect, useState } from 'react';
import { servicesAPI } from '../services/api';

const AdminServicesAdmin = () => {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', icon: '', position: 0 });
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState('');

  const load = async () => {
    try {
      const res = await servicesAPI.getAll();
      setServices(res.data || []);
    } catch (error) {
      console.error('Unable to load services', error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ title: '', description: '', icon: '', position: 0 });
    setFeedback('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await servicesAPI.update(editing, form);
        setFeedback('Service updated successfully');
      } else {
        await servicesAPI.create(form);
        setFeedback('Service created successfully');
      }
      resetForm();
      load();
      const bc = new BroadcastChannel('portfolio-cms');
      bc.postMessage({ type: 'cms:update', resource: 'services' });
      bc.close();
    } catch (error) {
      setFeedback('Unable to save service');
      console.error(error);
    }
  };

  const handleEdit = (service) => {
    setEditing(service.id);
    setForm({
      title: service.title,
      description: service.description,
      icon: service.icon,
      position: service.position,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const serviceToDelete = services.find((s) => s.id === id);
      const res = await servicesAPI.delete(id);

      const deletedCount = res.data?.deleted ?? 0;

      // Optimistically update local list: remove only the specific id
      if (deletedCount > 0) {
        setServices((prev) => prev.filter((s) => s.id !== id));
      } else {
        // If backend reports 0 deletions, reload to pick up any server-side state
        await load();
      }

      setFeedback(deletedCount ? `Deleted ${deletedCount} record(s).` : 'Service deleted successfully');
      try {
        const bc = new BroadcastChannel('portfolio-cms');
        bc.postMessage({ type: 'cms:update', resource: 'services' });
        bc.close();
      } catch (broadcastError) {
        console.warn('BroadcastChannel not available:', broadcastError);
      }
    } catch (error) {
      console.error('Delete failed', error);
      const serverMessage = error.response?.data?.message || error.message;
      setFeedback(serverMessage || 'Failed to delete service');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8 rounded border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50">
        <h2 className="text-2xl font-semibold mb-4">Services</h2>
        <p className="text-slate-600 mb-6">Manage homepage service cards and have updates reflected immediately across the site.</p>
        {feedback && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Title</span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-2 w-full rounded border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                required
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-2 w-full rounded border border-slate-200 bg-slate-50 px-4 py-3 outline-none resize-none"
                rows={5}
                required
              />
            </label>
          </div>
          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Icon</span>
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="mt-2 w-full rounded border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="e.g. ✨"
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Position</span>
              <input
                type="number"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                className="mt-2 w-full rounded border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-full bg-violet-600 px-5 py-3 text-white shadow-sm shadow-violet-400/20">
                {editing ? 'Update Service' : 'Create Service'}
              </button>
              <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-slate-700">
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="rounded border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <h3 className="text-xl font-semibold mb-4">Service list</h3>
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.id} className="flex flex-col gap-4 rounded border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-lg font-bold text-slate-900">
                  {service.icon ? service.icon : service.title?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{service.title}</div>
                  <div className="text-sm text-slate-600">{service.description}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-500">Icon: {service.icon || '—'}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => handleEdit(service)} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700">
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(service.id)} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {services.length === 0 && <div className="text-slate-500">No services added yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminServicesAdmin;

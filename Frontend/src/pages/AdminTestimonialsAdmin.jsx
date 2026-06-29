import { useEffect, useState } from 'react';
import { testimonialsAPI } from '../services/api';

const AdminTestimonialsAdmin = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [form, setForm] = useState({ name: '', role: '', text: '', rating: 5 });
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadTestimonials = async () => {
    try {
      const res = await testimonialsAPI.getAll();
      setTestimonials(res.data || []);
    } catch (error) {
      setTestimonials([]);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const resetForm = ({ clearFeedback = true } = {}) => {
    setEditing(null);
    setForm({ name: '', role: '', text: '', rating: 5 });
    if (clearFeedback) setFeedback('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await testimonialsAPI.update(editing, form);
        setFeedback('Testimonial updated successfully.');
      } else {
        await testimonialsAPI.create(form);
        setFeedback('Testimonial created successfully.');
      }
      resetForm({ clearFeedback: false });
      loadTestimonials();
      const bc = new BroadcastChannel('portfolio-cms');
      bc.postMessage({ type: 'cms:update', resource: 'testimonials' });
      bc.close();
    } catch (error) {
      setFeedback('Unable to save testimonial.');
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setForm({ name: item.name || '', role: item.role || '', text: item.text || '', rating: item.rating || 5 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      await testimonialsAPI.delete(id);
      setTestimonials((current) => current.filter((item) => item.id !== id));
      setFeedback('Testimonial deleted successfully.');
      try {
        const bc = new BroadcastChannel('portfolio-cms');
        bc.postMessage({ type: 'cms:update', resource: 'testimonials' });
        bc.close();
      } catch (broadcastError) {
        console.warn('BroadcastChannel not available:', broadcastError);
      }
    } catch (error) {
      console.error(error);
      setFeedback(error.response?.data?.message || 'Failed to delete testimonial.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8 rounded border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Testimonials</h2>
            <p className="mt-2 text-slate-600">Publish new client feedback and keep the testimonial section updated in real time.</p>
          </div>
          <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
            {editing ? 'Create New Testimonial' : 'Reset'}
          </button>
        </div>

        {feedback && <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                required
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Title / Role</span>
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Rating</span>
              <input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
            </label>
          </div>

          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Testimonial</span>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none resize-none"
                rows={8}
                required
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-full bg-violet-600 px-5 py-3 text-white shadow-sm shadow-violet-400/20">
                {editing ? 'Update Testimonial' : 'Create Testimonial'}
              </button>
              <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-slate-700">
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="rounded border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <h3 className="text-xl font-semibold mb-4">Testimonial list</h3>
        <div className="space-y-4">
          {testimonials.length === 0 ? (
            <div className="text-slate-500">No testimonials yet.</div>
          ) : (
            testimonials.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:flex sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  <div className="text-sm text-slate-500">{item.role}</div>
                  <p className="mt-3 text-slate-600">{item.text}</p>
                  <div className="mt-3 flex gap-1 text-amber-400">{Array.from({ length: item.rating || 0 }).map((_, index) => <span key={index}>★</span>)}</div>
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

export default AdminTestimonialsAdmin;

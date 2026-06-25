import { useEffect, useState } from 'react';
import { analyticsAPI } from '../utils/api';

const AdminAnalyticsAdmin = () => {
  const [metrics, setMetrics] = useState([]);
  const [form, setForm] = useState({ metric_key: '', metric_value: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadMetrics = async () => {
    try {
      const res = await analyticsAPI.getAll();
      setMetrics(res.data || []);
    } catch (error) {
      setMetrics([]);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ metric_key: '', metric_value: '', description: '' });
    setFeedback('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await analyticsAPI.update(editing, form);
        setFeedback('Metric updated successfully.');
      } else {
        await analyticsAPI.create(form);
        setFeedback('Metric created successfully.');
      }
      resetForm();
      loadMetrics();
      const bc = new BroadcastChannel('portfolio-cms');
      bc.postMessage({ type: 'cms:update', resource: 'analytics' });
      bc.close();
    } catch (error) {
      setFeedback('Unable to save metric.');
      console.error(error);
    }
  };

  const handleEdit = (metric) => {
    setEditing(metric.id);
    setForm({ metric_key: metric.metric_key || '', metric_value: metric.metric_value || '', description: metric.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this metric?')) {
      return;
    }

    try {
      await analyticsAPI.delete(id);
      setMetrics((current) => current.filter((metric) => metric.id !== id));
      setFeedback('Metric deleted successfully.');
      try {
        const bc = new BroadcastChannel('portfolio-cms');
        bc.postMessage({ type: 'cms:update', resource: 'analytics' });
        bc.close();
      } catch (broadcastError) {
        console.warn('BroadcastChannel not available:', broadcastError);
      }
    } catch (error) {
      console.error(error);
      setFeedback(error.response?.data?.message || 'Failed to delete metric.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8 rounded border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Analytics</h2>
            <p className="mt-2 text-slate-600">Create and manage tracked metrics for reporting and summary dashboards.</p>
          </div>
          <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
            {editing ? 'Create New Metric' : 'Reset'}
          </button>
        </div>

        {feedback && <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Metric Key</span>
              <input
                value={form.metric_key}
                onChange={(e) => setForm({ ...form, metric_key: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                required
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Metric Value</span>
              <input
                value={form.metric_value}
                onChange={(e) => setForm({ ...form, metric_value: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                required
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
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-full bg-violet-600 px-5 py-3 text-white shadow-sm shadow-violet-400/20">
                {editing ? 'Update Metric' : 'Create Metric'}
              </button>
              <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-slate-700">
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="rounded border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <h3 className="text-xl font-semibold mb-4">Metric list</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-3 px-3">Metric</th>
                <th className="py-3 px-3">Value</th>
                <th className="py-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => (
                <tr key={metric.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-3 font-medium text-slate-900">{metric.metric_key}</td>
                  <td className="py-3 px-3">{metric.metric_value}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleEdit(metric)} className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(metric.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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

export default AdminAnalyticsAdmin;

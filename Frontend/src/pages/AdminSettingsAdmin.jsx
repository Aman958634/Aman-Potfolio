import { useEffect, useState } from 'react';
import { settingsAPI } from '../services/api';

const AdminSettingsAdmin = () => {
  const [settings, setSettings] = useState([]);
  const [form, setForm] = useState({ setting_key: '', value: '', metadata: '' });
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadSettings = async () => {
    try {
      const res = await settingsAPI.getAll();
      setSettings(res.data || []);
    } catch (error) {
      setSettings([]);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const resetForm = ({ clearFeedback = true } = {}) => {
    setEditing(null);
    setForm({ setting_key: '', value: '', metadata: '' });
    if (clearFeedback) setFeedback('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = { value: form.value, metadata: form.metadata ? JSON.parse(form.metadata) : null };
      if (editing) {
        await settingsAPI.update(editing, payload);
        setFeedback('Setting updated successfully.');
      } else {
        await settingsAPI.create({ setting_key: form.setting_key, ...payload });
        setFeedback('Setting created successfully.');
      }
      resetForm({ clearFeedback: false });
      loadSettings();
      const bc = new BroadcastChannel('portfolio-cms');
      bc.postMessage({ type: 'cms:update', resource: 'settings' });
      bc.close();
    } catch (error) {
      setFeedback('Unable to save setting.');
      console.error(error);
    }
  };

  const handleEdit = (setting) => {
    setEditing(setting.setting_key);
    setForm({ setting_key: setting.setting_key || '', value: setting.value || '', metadata: JSON.stringify(setting.metadata || {}, null, 2) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (key) => {
    if (!window.confirm('Are you sure you want to delete this setting?')) {
      return;
    }

    try {
      await settingsAPI.delete(key);
      setSettings((current) => current.filter((setting) => setting.setting_key !== key));
      setFeedback('Setting deleted successfully.');
      try {
        const bc = new BroadcastChannel('portfolio-cms');
        bc.postMessage({ type: 'cms:update', resource: 'settings' });
        bc.close();
      } catch (broadcastError) {
        console.warn('BroadcastChannel not available:', broadcastError);
      }
    } catch (error) {
      console.error(error);
      setFeedback(error.response?.data?.message || 'Failed to delete setting.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8 rounded border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Settings</h2>
            <p className="mt-2 text-slate-600">Global configuration and platform settings for the portfolio site.</p>
          </div>
          <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
            {editing ? 'Create New Setting' : 'Reset'}
          </button>
        </div>

        {feedback && <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Key</span>
              <input
                value={form.setting_key}
                onChange={(e) => setForm({ ...form, setting_key: e.target.value })}
                disabled={Boolean(editing)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="siteTitle"
                required={!editing}
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Value</span>
              <input
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                required
              />
            </label>
          </div>

          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Metadata (JSON)</span>
              <textarea
                value={form.metadata}
                onChange={(e) => setForm({ ...form, metadata: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none resize-none"
                rows={8}
                placeholder='{"theme":"white"}'
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-full bg-violet-600 px-5 py-3 text-white shadow-sm shadow-violet-400/20">
                {editing ? 'Update Setting' : 'Create Setting'}
              </button>
              <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-slate-700">
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="rounded border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <h3 className="text-xl font-semibold mb-4">Settings list</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-3 px-3">Key</th>
                <th className="py-3 px-3">Value</th>
                <th className="py-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((setting) => (
                <tr key={setting.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-3 font-medium text-slate-900">{setting.setting_key}</td>
                  <td className="py-3 px-3">{setting.value}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleEdit(setting)} className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(setting.setting_key)} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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

export default AdminSettingsAdmin;

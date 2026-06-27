import { useEffect, useState } from 'react';
import { skillsAPI } from '../services/api';

const AdminSkillsAdmin = () => {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({ name: '', level: '', icon: '' });
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadSkills = async () => {
    try {
      const res = await skillsAPI.getAll();
      setSkills(res.data || []);
    } catch (error) {
      setSkills([]);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', level: '', icon: '' });
    setFeedback('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await skillsAPI.update(editing, form);
        setFeedback('Skill updated successfully.');
      } else {
        await skillsAPI.create(form);
        setFeedback('Skill created successfully.');
      }
      resetForm();
      loadSkills();
      const bc = new BroadcastChannel('portfolio-cms');
      bc.postMessage({ type: 'cms:update', resource: 'skills' });
      bc.close();
    } catch (error) {
      setFeedback('Unable to save skill.');
      console.error(error);
    }
  };

  const handleEdit = (skill) => {
    setEditing(skill.id);
    setForm({ name: skill.name || '', level: skill.level || '', icon: skill.icon || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    try {
      await skillsAPI.delete(id);
      setSkills((current) => current.filter((skill) => skill.id !== id));
      setFeedback('Skill deleted successfully.');
      try {
        const bc = new BroadcastChannel('portfolio-cms');
        bc.postMessage({ type: 'cms:update', resource: 'skills' });
        bc.close();
      } catch (broadcastError) {
        console.warn('BroadcastChannel not available:', broadcastError);
      }
    } catch (error) {
      console.error(error);
      setFeedback(error.response?.data?.message || 'Failed to delete skill.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8 rounded border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Skills</h2>
            <p className="mt-2 text-slate-600">Add and update skill labels so the homepage skill section stays synced with your backend.</p>
          </div>
          <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
            {editing ? 'Create New Skill' : 'Reset'}
          </button>
        </div>

        {feedback && <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Skill Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                required
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Skill Level</span>
              <input
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="Expert, Advanced, Intermediate"
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Icon</span>
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="e.g. ⚡️, 💻, JS"
              />
            </label>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Preview</p>
              <p className="mt-3 text-slate-700">Existing skills are listed below for quick updates.</p>
            </div>
            <button type="submit" className="rounded-full bg-violet-600 px-5 py-3 text-white shadow-sm shadow-violet-400/20">
              {editing ? 'Update Skill' : 'Create Skill'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <h3 className="text-xl font-semibold mb-4">Skill list</h3>
        <div className="grid gap-4">
          {skills.length === 0 ? (
            <div className="text-slate-500">No skills added yet.</div>
          ) : (
            skills.map((skill) => (
              <div key={skill.id} className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-lg font-bold text-slate-900">
                    {skill.icon ? skill.icon : skill.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{skill.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{skill.level}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-500">Icon: {skill.icon || '—'}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleEdit(skill)} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(skill.id)} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
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

export default AdminSkillsAdmin;

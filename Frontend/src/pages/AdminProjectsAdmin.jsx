import { useEffect, useState } from 'react';
import { projectsAPI, resolveImageUrl } from '../utils/api';
import ProjectImageUpload from '../components/ProjectImageUpload';

const getFallbackImage = (title = '') => {
  const normalizedTitle = String(title || '').toLowerCase();

  if (normalizedTitle.includes('hospital')) {
    return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1000&h=700&fit=crop';
  }

  if (normalizedTitle.includes('marketing')) {
    return 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&h=700&fit=crop';
  }

  if (normalizedTitle.includes('restaurant')) {
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&h=700&fit=crop';
  }

  if (normalizedTitle.includes('fitness')) {
    return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000&h=700&fit=crop';
  }

  if (normalizedTitle.includes('school')) {
    return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&h=700&fit=crop';
  }

  return 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1000&h=700&fit=crop';
};

const isRenderableImageSource = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return false;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) return false;
  return /^(https?:\/\/|data:|\/|uploads\/|\.\/|\.\.\/)/i.test(trimmed);
};

const AdminProjectsAdmin = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', image: '', link: '', tech_stack: '' });
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState('');

  const imagePreview = resolveImageUrl(
    isRenderableImageSource(form.image) ? form.image.trim() : getFallbackImage(form.title)
  );

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
    if (clearFeedback) {
      setFeedback('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      title: form.title?.trim() || '',
      description: form.description?.trim() || '',
      image: form.image?.trim() || '',
      link: form.link?.trim() || '',
      tech_stack: form.tech_stack?.trim() || '',
    };

    try {
      if (editing) {
        const response = await projectsAPI.update(editing, payload);
        const updatedProject = response?.data?.project;
        if (updatedProject) {
          setProjects((current) => current.map((project) => (project.id === updatedProject.id ? updatedProject : project)));
        }
        setFeedback(response?.data?.message || 'Project updated successfully.');
      } else {
        const response = await projectsAPI.create(payload);
        const createdProject = response?.data?.project;
        if (createdProject) {
          setProjects((current) => [createdProject, ...current]);
        }
        setFeedback(response?.data?.message || 'Project created successfully.');
      }
      resetForm({ clearFeedback: false });
      loadProjects();
      const bc = new BroadcastChannel('portfolio-cms');
      bc.postMessage({ type: 'cms:update', resource: 'projects' });
      bc.close();
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'Unable to save project.');
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
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectsAPI.delete(id);
      setProjects((current) => current.filter((project) => project.id !== id));
      setFeedback('Project deleted successfully.');
      try {
        const bc = new BroadcastChannel('portfolio-cms');
        bc.postMessage({ type: 'cms:update', resource: 'projects' });
        bc.close();
      } catch (broadcastError) {
        // BroadcastChannel may not be supported in all browsers; ignore if unavailable.
        console.warn('BroadcastChannel not available:', broadcastError);
      }
    } catch (error) {
      console.error(error);
      setFeedback(error.response?.data?.message || 'Failed to delete project.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8 rounded border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Portfolio Items</h2>
            <p className="mt-2 text-slate-600">Create, edit, and remove portfolio projects that appear on the homepage.</p>
          </div>
          <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
            {editing ? 'Create New Project' : 'Reset Form'}
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
            <ProjectImageUpload
              title={form.title}
              value={form.image}
              onChange={(imageUrl) => setForm((prev) => ({ ...prev, image: imageUrl }))}
            />
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Demo / GitHub Link</span>
              <input
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="https://..."
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-full bg-violet-600 px-5 py-3 text-white shadow-sm shadow-violet-400/20">
                {editing ? 'Update Project' : 'Create Project'}
              </button>
              <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-slate-700">
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="rounded border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <h3 className="text-xl font-semibold mb-4">Project list</h3>
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-slate-500">No portfolio items yet.</div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5 shadow-sm sm:flex sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-20 w-28 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <img
                      src={resolveImageUrl(project.image || getFallbackImage(project.title))}
                      alt={project.title}
                      onError={(event) => {
                        event.currentTarget.src = getFallbackImage(project.title);
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{project.title}</div>
                    <div className="mt-2 text-sm text-slate-600">{project.description}</div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                      {(project.tech_stack || '').split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                        <span key={tag} className="rounded-full bg-white px-3 py-1 border border-slate-200">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
                  <button type="button" onClick={() => handleEdit(project)} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(project.id)} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
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

export default AdminProjectsAdmin;

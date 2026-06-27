import { useEffect, useState } from 'react';
import { resolveImageUrl, sectionsAPI, uploadAPI } from '../services/api';

const AdminSections = () => {
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState({ slug: '', title: '', subtitle: '', content: '', metadata: '', image: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadSections = async () => {
    try {
      const res = await sectionsAPI.getAll();
      setSections(res.data || []);
    } catch (error) {
      setSections([]);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ slug: '', title: '', subtitle: '', content: '', metadata: '', image: '' });
    setImageFile(null);
    setImagePreview('');
    setFeedback('');
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(form.image || '');
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      return form.image || '';
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const { data } = await uploadAPI.uploadImage(formData);
      return data.filePath;
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Unable to upload image.');
      console.error(error);
      return form.image || '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      let metadata = null;
      if (form.metadata.trim()) {
        try {
          metadata = JSON.parse(form.metadata);
        } catch (parseError) {
          setFeedback('Metadata must be valid JSON.');
          return;
        }
      }

      const imageUrl = await handleImageUpload();

      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        content: form.content,
        metadata,
        image: imageUrl || null,
      };

      if (editing) {
        await sectionsAPI.update(form.slug, payload);
        setFeedback('Section updated successfully.');
      } else {
        await sectionsAPI.create({ slug: form.slug, ...payload });
        setFeedback('Section created successfully.');
      }

      resetForm();
      loadSections();
      const bc = new BroadcastChannel('portfolio-cms');
      bc.postMessage({ type: 'cms:update', resource: 'sections' });
      bc.close();
    } catch (error) {
      setFeedback('Unable to save section.');
      console.error(error);
    }
  };

  const handleEdit = (section) => {
    setEditing(section.id);
    setForm({
      slug: section.slug || '',
      title: section.title || '',
      subtitle: section.subtitle || '',
      content: section.content || '',
      metadata: section.metadata ? JSON.stringify(section.metadata, null, 2) : '',
      image: section.image || '',
    });
    setImagePreview(resolveImageUrl(section.image || ''));
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section?')) {
      return;
    }

    try {
      const section = sections.find((item) => item.id === id);
      if (section) {
        await sectionsAPI.delete(section.slug);
        setSections((current) => current.filter((item) => item.id !== id));
        setFeedback('Section deleted successfully.');
        try {
          const bc = new BroadcastChannel('portfolio-cms');
          bc.postMessage({ type: 'cms:update', resource: 'sections' });
          bc.close();
        } catch (broadcastError) {
          console.warn('BroadcastChannel not available:', broadcastError);
        }
      }
    } catch (error) {
      console.error(error);
      setFeedback(error.response?.data?.message || 'Failed to delete section.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8 rounded border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Sections</h2>
            <p className="mt-2 text-slate-600">Edit homepage section content and keep your Hero, About, Contact, Footer, and custom sections in sync.</p>
          </div>
          <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
            {editing ? 'Create New Section' : 'Reset'}
          </button>
        </div>

        {feedback && <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Slug</span>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="hero, about, contact, footer"
                disabled={Boolean(editing)}
                required
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Title</span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Subtitle</span>
              <input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
            </label>
          </div>

          <div className="space-y-4">
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Content</span>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none resize-none"
                rows={10}
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Metadata (JSON)</span>
              <textarea
                value={form.metadata}
                onChange={(e) => setForm({ ...form, metadata: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none resize-none"
                rows={8}
                placeholder='{"primaryButtonLabel":"Hire Me","primaryButtonLink":"#contact"}'
              />
            </label>
            <label className="block text-slate-700">
              <span className="block text-sm font-semibold">Section Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
              />
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600 mb-2">Image preview</p>
                  <img src={imagePreview} alt="Section preview" className="max-w-xs rounded-2xl border border-slate-200 shadow-sm" />
                </div>
              )}
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-full bg-violet-600 px-5 py-3 text-white shadow-sm shadow-violet-400/20">
                {editing ? 'Update Section' : 'Create Section'}
              </button>
              <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 text-slate-700">
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="rounded border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <h3 className="text-xl font-semibold mb-4">Section list</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-3 px-3">Slug</th>
                <th className="py-3 px-3">Title</th>
                <th className="py-3 px-3">Image</th>
                <th className="py-3 px-3">Metadata</th>
                <th className="py-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-3 font-medium text-slate-900">{section.slug}</td>
                  <td className="py-3 px-3">{section.title || section.subtitle || 'No title'}</td>
                  <td className="py-3 px-3">{section.image ? 'Yes' : 'No'}</td>
                  <td className="py-3 px-3">{section.metadata ? 'Yes' : 'No'}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleEdit(section)} className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(section.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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

export default AdminSections;

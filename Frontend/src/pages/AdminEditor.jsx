import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resolveImageUrl, sectionsAPI, uploadAPI } from '../services/api';

const AdminEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState({ title: '', subtitle: '', content: '', image: '', metadata: {} });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const loadSection = async () => {
    try {
      const { data } = await sectionsAPI.getBySlug(slug);
      setSection({
        title: data.title || '',
        subtitle: data.subtitle || '',
        content: data.content || '',
        image: data.image || '',
        metadata: data.metadata || {},
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load section');
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSection();
  }, [slug]);

  const handleChange = (field) => (event) => {
    setSection((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleMetadataChange = (field) => (event) => {
    setSection((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: event.target.value,
      },
    }));
  };

  const handleImageChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!imageFile) return section.image;
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      const { data } = await uploadAPI.uploadImage(formData);
      return data.filePath;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
      return section.image;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const uploadedImageUrl = await handleImageUpload();
      await sectionsAPI.update(slug, { ...section, image: uploadedImageUrl, metadata: section.metadata });
      setMessage('Section updated successfully.');
      const bc = new BroadcastChannel('portfolio-cms');
      bc.postMessage({ type: 'cms:update', resource: 'sections', slug });
      bc.close();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update section');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white/90 py-6 shadow-sm shadow-slate-200">
        <div className="container-custom flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neon-blue">Section Editor</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Edit {slug}</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <main className="container-custom py-10">
        <div className="border border-slate-200 bg-white p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)]">
          {loading ? (
            <p className="text-slate-600">Loading section…</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
              {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <div>
                <label className="block text-sm font-semibold text-slate-700">Title</label>
                <input
                  type="text"
                  value={section.title}
                  onChange={handleChange('title')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Subtitle</label>
                <input
                  type="text"
                  value={section.subtitle}
                  onChange={handleChange('subtitle')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Content</label>
                <textarea
                  value={section.content}
                  onChange={handleChange('content')}
                  rows={8}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Profile Title</label>
                <input
                  type="text"
                  value={section.metadata?.profileTitle || ''}
                  onChange={handleMetadataChange('profileTitle')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Profile Name</label>
                <input
                  type="text"
                  value={section.metadata?.profileName || ''}
                  onChange={handleMetadataChange('profileName')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Profile Description</label>
                <textarea
                  value={section.metadata?.profileDescription || ''}
                  onChange={handleMetadataChange('profileDescription')}
                  rows={4}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">CV Button Label</label>
                <input
                  type="text"
                  value={section.metadata?.cvLabel || ''}
                  onChange={handleMetadataChange('cvLabel')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">CV Link</label>
                <input
                  type="text"
                  value={section.metadata?.cvLink || ''}
                  onChange={handleMetadataChange('cvLink')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20"
                />
                {section.image && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-600 mb-2">Current Image:</p>
                    <img src={resolveImageUrl(section.image)} alt="Current" className="max-w-xs h-auto rounded-xl shadow-md" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-neon-blue/20 transition hover:-translate-y-0.5"
              >
                Save Changes
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminEditor;

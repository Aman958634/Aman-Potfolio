import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { resolveImageUrl, sectionsAPI } from '../utils/api';

const inputCls =
  'mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition';

const textareaCls =
  'mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition resize-none';

const isRenderableImageSource = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return false;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) return false;

  return /^(https?:\/\/|data:|\/|uploads\/|\.\/|\.\.\/)/i.test(trimmed);
};

const getFallbackImage = () => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80';

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      {hint && <span className="ml-2 text-xs font-normal text-slate-400">{hint}</span>}
    </label>
    {children}
  </div>
);

const AdminAboutAdmin = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    content: '',
    image: '',
    profileTitle: '',
    profileName: '',
    profileDescription: '',
    cvLabel: '',
    cvLink: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadSection = async () => {
    setLoading(true);
    try {
      const { data } = await sectionsAPI.getBySlug('about');
      const m = data.metadata || {};
      setForm({
        title: data.title || '',
        subtitle: data.subtitle || '',
        content: data.content || '',
        image: data.image || '',
        profileTitle: m.profileTitle || '',
        profileName: m.profileName || '',
        profileDescription: m.profileDescription || '',
        cvLabel: m.cvLabel || '',
        cvLink: m.cvLink || '',
      });
      if (data.image) setImagePreview(resolveImageUrl(data.image));
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      } else if (err.response?.status === 404) {
        // Section doesn't exist yet — show empty form, will be created on first save
        setForm({ title: '', subtitle: '', content: '', image: '', profileTitle: '', profileName: '', profileDescription: '', cvLabel: '', cvLink: '' });
      } else {
        setError('Unable to load About section.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSection();
  }, []);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return form.image;
    const fd = new FormData();
    fd.append('image', imageFile);
    try {
      const { data } = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.filePath;
    } catch {
      setError('Image upload failed.');
      return form.image;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const uploadedImage = await uploadImage();
      await sectionsAPI.update('about', {
        title: form.title,
        subtitle: form.subtitle,
        content: form.content,
        image: uploadedImage,
        metadata: {
          profileTitle: form.profileTitle,
          profileName: form.profileName,
          profileDescription: form.profileDescription,
          cvLabel: form.cvLabel,
          cvLink: form.cvLink,
        },
      });
      setForm((prev) => ({ ...prev, image: uploadedImage }));
      setMessage('About section saved successfully!');
      const bc = new BroadcastChannel('portfolio-cms');
      bc.postMessage({ type: 'cms:update', resource: 'about' });
      bc.close();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save About section.');
    } finally {
      setSaving(false);
    }
  };

  const previewImage =
    imagePreview ||
    resolveImageUrl(isRenderableImageSource(form.image) ? form.image.trim() : getFallbackImage()) ||
    getFallbackImage();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-violet-500">Admin Panel</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Manage About Page</h1>
            <p className="mt-1 text-sm text-slate-500">All changes update the live About section in real time.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-300 border-t-violet-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {message && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-sm font-medium text-emerald-700">
                <span className="text-base">✓</span> {message}
              </div>
            )}
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm font-medium text-red-700">
                <span className="text-base">✕</span> {error}
              </div>
            )}

            <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
              {/* ─── Left: Editor ─── */}
              <div className="space-y-6">
                {/* Section 1 – Main Text */}
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <h2 className="mb-5 text-base font-semibold text-slate-800">📝 Main Text</h2>
                  <div className="space-y-5">
                    <Field label="Heading / Name" hint="e.g. Hi, I'm Amanulla">
                      <input type="text" value={form.title} onChange={set('title')} className={inputCls} placeholder="Hi, I'm Amanulla" />
                    </Field>
                    <Field label="Subtitle" hint="e.g. Full Stack Developer">
                      <input type="text" value={form.subtitle} onChange={set('subtitle')} className={inputCls} placeholder="Full Stack Developer" />
                    </Field>
                    <Field label="Description" hint="Shown as main paragraph">
                      <textarea value={form.content} onChange={set('content')} rows={5} className={textareaCls} placeholder="I build modern, scalable web applications..." />
                    </Field>
                  </div>
                </div>

                {/* Section 2 – Profile Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <h2 className="mb-5 text-base font-semibold text-slate-800">🪪 Profile Card</h2>
                  <div className="space-y-5">
                    <Field label="Card Title" hint="Label above name e.g. Full Stack Developer">
                      <input type="text" value={form.profileTitle} onChange={set('profileTitle')} className={inputCls} placeholder="Full Stack Developer" />
                    </Field>
                    <Field label="Name on Card">
                      <input type="text" value={form.profileName} onChange={set('profileName')} className={inputCls} placeholder="Amanulla" />
                    </Field>
                    <Field label="Card Description">
                      <textarea value={form.profileDescription} onChange={set('profileDescription')} rows={3} className={textareaCls} placeholder="Delivering polished web apps..." />
                    </Field>
                  </div>
                </div>

                {/* Section 3 – CV Button */}
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <h2 className="mb-5 text-base font-semibold text-slate-800">📥 CV / Download Button</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Button Label" hint="e.g. Download CV">
                      <input type="text" value={form.cvLabel} onChange={set('cvLabel')} className={inputCls} placeholder="Download CV" />
                    </Field>
                    <Field label="File / Link URL" hint="e.g. /resume.pdf">
                      <input type="text" value={form.cvLink} onChange={set('cvLink')} className={inputCls} placeholder="/resume.pdf" />
                    </Field>
                  </div>
                </div>

                {/* Section 4 – Profile Photo */}
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <h2 className="mb-5 text-base font-semibold text-slate-800">🖼️ Profile Photo</h2>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-slate-500 transition hover:border-violet-400 hover:bg-violet-50"
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        onError={(event) => {
                          event.currentTarget.src = getFallbackImage();
                        }}
                        className="max-h-48 rounded-2xl object-cover shadow"
                      />
                    ) : (
                      <>
                        <span className="text-4xl">📷</span>
                        <p className="text-sm font-medium">Click to upload photo</p>
                        <p className="text-xs text-slate-400">JPG, PNG, WEBP — recommended 900×900px</p>
                      </>
                    )}
                    {imagePreview && (
                      <p className="mt-2 text-xs text-violet-500 underline">Click to change photo</p>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>

                {/* Save */}
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-gradient-to-r from-violet-500 to-sky-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-400/30 transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save All Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={loadSection}
                    className="rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* ─── Right: Live Preview ─── */}
              <div className="xl:sticky xl:top-24 xl:self-start">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="mb-4 text-xs uppercase tracking-[0.32em] text-slate-400">Live Preview</p>

                  <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50">
                    {/* Preview – text side */}
                    <div className="px-5 pt-5 pb-3">
                      <p className="text-[0.6rem] uppercase tracking-[0.32em] text-violet-500">About Me</p>
                      <h3 className="mt-1 text-xl font-bold leading-snug text-slate-900">{form.title || "Hi, I'm Amanulla"}</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-600">{form.subtitle || 'Full Stack Developer'}</p>
                      <p className="mt-2 text-xs leading-6 text-slate-500 line-clamp-3">{form.content || 'Description appears here…'}</p>
                    </div>

                    {/* Preview – card */}
                    <div className="mx-4 mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="h-48 w-full object-cover object-top"
                      />
                      <div className="p-4">
                        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">{form.profileTitle || 'Full Stack Developer'}</p>
                        <p className="mt-1 text-base font-bold text-slate-900">{form.profileName || 'Amanulla'}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500 line-clamp-2">{form.profileDescription || 'Delivering polished web apps…'}</p>
                      </div>
                      <div className="border-t border-slate-100 px-4 py-3">
                        <div className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-sky-500 py-2 text-center text-xs font-semibold text-white">
                          {form.cvLabel || 'Download CV'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminAboutAdmin;

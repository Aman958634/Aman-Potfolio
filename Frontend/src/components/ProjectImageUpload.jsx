import { useEffect, useMemo, useRef, useState } from 'react';
import { uploadAPI, resolveImageUrl } from '../services/api';

const isRenderableImageSource = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return false;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) return false;
  return /^(https?:\/\/|data:|\/|uploads\/|\.\/|\.\.\/)/i.test(trimmed);
};

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

const ProjectImageUpload = ({ title = '', value = '', onChange, disabled = false }) => {
  const fileInputRef = useRef(null);
  const [localPreview, setLocalPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');

  const fallbackImage = useMemo(() => getFallbackImage(title), [title]);

  useEffect(() => {
    if (!value) {
      setLocalPreview('');
      return;
    }

    if (typeof value === 'string' && isRenderableImageSource(value)) {
      setLocalPreview(resolveImageUrl(value));
    }
  }, [value]);

  const previewSrc = localPreview || (isRenderableImageSource(value) ? resolveImageUrl(value) : fallbackImage);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file || disabled) return;

    const tempPreview = URL.createObjectURL(file);
    setLocalPreview(tempPreview);
    setStatus('Uploading image...');
    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await uploadAPI.uploadImage(formData);
      const filePath = data?.filePath || '';
      if (filePath) {
        onChange(filePath);
        setLocalPreview(resolveImageUrl(filePath));
        setStatus('Image uploaded successfully.');
      } else {
        setStatus('Upload complete, but no URL was returned.');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      setStatus('Upload failed. Using local preview only until saved.');
    } finally {
      setUploading(false);
    }
  };

  const handlePickClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    if (disabled) return;
    setLocalPreview('');
    setStatus('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Project Image</p>
          <p className="mt-1 text-xs text-slate-400">Upload a file and preview it here before saving.</p>
        </div>

        <div className="bg-slate-50">
          <img
            src={previewSrc}
            alt={title || 'Project preview'}
            className="h-56 w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          <label className="block text-slate-700">
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Image URL</span>
            <input
              type="url"
              value={value || ''}
              onChange={(event) => {
                if (disabled || uploading) return;
                setLocalPreview('');
                setStatus('');
                onChange(event.target.value);
              }}
              placeholder="https://example.com/project-image.jpg"
              disabled={disabled || uploading}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-200 px-4 py-4">
          <button
            type="button"
            onClick={handlePickClick}
            disabled={disabled || uploading}
            className="rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Choose Image'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled || uploading}
            className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear
          </button>
          <span className="ml-auto text-xs text-slate-500">JPG, PNG, WEBP</span>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {status && <p className="text-xs text-slate-500">{status}</p>}
    </div>
  );
};

export default ProjectImageUpload;

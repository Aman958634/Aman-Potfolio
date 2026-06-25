import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ProjectModal = ({ project, onClose }) => {
  const modalRef = useRef(null);
  const defaultProjectImage = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22400%22%3E%3Crect width=%22600%22 height=%22400%22 fill=%22%23f8fafc%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 fill=%22%23748fab%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImage+unavailable%3C/text%3E%3C/svg%3E';

  const getSafeImage = (image) => {
    if (!image || typeof image !== 'string') return defaultProjectImage;
    return image.includes('placeholder.com') ? defaultProjectImage : image;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (modalRef.current) {
        gsap.from(modalRef.current, {
          opacity: 0,
          scale: 0.9,
          duration: 0.3,
        });
      }
    }, modalRef);

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      ctx.revert();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div ref={modalRef} className="project-modal rounded-3xl bg-white p-8 shadow-2xl card-3d max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-neon-blue transition-colors text-2xl"
        >
          ✕
        </button>

        <img
          src={getSafeImage(project.image)}
          alt={project.title}
          className="w-full h-64 object-cover rounded-3xl mb-6"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = defaultProjectImage;
          }}
        />

        <h2 className="heading-md text-slate-950 mb-2">{project.title}</h2>
        <p className="text-slate-600 mb-6">{project.description}</p>

        <div className="mb-6">
          <h3 className="text-neon-blue font-semibold mb-3">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {(project.tech_stack || '').split(',').filter(Boolean).map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-neon-blue/20 border border-neon-blue/50 text-neon-blue rounded-full text-sm"
              >
                {tech.trim()}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            View Project
          </a>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;

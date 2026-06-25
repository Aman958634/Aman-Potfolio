import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projectsAPI, resolveImageUrl } from '../utils/api';

gsap.registerPlugin(ScrollTrigger);

const GITHUB_PROFILE_URL = 'https://github.com/Aman958634';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const projectsRef = useRef(null);

  const inferCategory = (title = '') => {
    const normalizedTitle = title.toLowerCase();
    if (normalizedTitle.includes('marketing')) return 'Marketing';
    if (normalizedTitle.includes('fitness') || normalizedTitle.includes('mobile')) return 'Mobile';
    if (normalizedTitle.includes('hospital') || normalizedTitle.includes('school') || normalizedTitle.includes('dashboard')) return 'Web';
    if (normalizedTitle.includes('restaurant') || normalizedTitle.includes('e-commerce')) return 'Web';
    return 'Web';
  };

  const getFallbackImage = (project) => {
    const title = String(project?.title || '').toLowerCase();
    const category = String(project?.category || '').toLowerCase();

    if (title.includes('hospital')) {
      return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1000&h=700&fit=crop';
    }

    if (title.includes('marketing')) {
      return 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&h=700&fit=crop';
    }

    if (title.includes('restaurant')) {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&h=700&fit=crop';
    }

    if (title.includes('fitness')) {
      return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000&h=700&fit=crop';
    }

    if (title.includes('school')) {
      return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&h=700&fit=crop';
    }

    if (category === 'marketing') {
      return 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&h=700&fit=crop';
    }

    if (category === 'mobile') {
      return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000&h=700&fit=crop';
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

  const resolveProjectImage = (item) => {
    const rawImage = typeof item?.image === 'string' ? item.image.trim() : '';
    const fallbackImage = getFallbackImage(item);

    if (!isRenderableImageSource(rawImage)) {
      return resolveImageUrl(fallbackImage);
    }

    return resolveImageUrl(rawImage);
  };

  const normalizeProject = (item) => {
    const techField = item?.tech || item?.tech_stack || item?.techStack;
    const tech = Array.isArray(techField)
      ? techField
      : typeof techField === 'string'
      ? techField.split(',').map((value) => value.trim()).filter(Boolean)
      : [];

    return {
      id: item?.id,
      title: item?.title || 'Untitled Project',
      description: item?.description || 'No project description available.',
      image: resolveProjectImage(item),
      demo: item?.demo || item?.link || '#',
      github: item?.github || GITHUB_PROFILE_URL,
      category: item?.category || item?.type || inferCategory(item?.title),
      tech,
    };
  };

  const normalizeProjects = (data) => (Array.isArray(data) ? data.map(normalizeProject) : []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectsAPI.getAll();
        setProjects(normalizeProjects(response.data));
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([
          {
            id: 1,
            title: 'E-Commerce Platform',
            description: 'A premium shopping experience with clean product discovery, smooth checkout, and admin-ready product management.',
            image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1000&h=700&fit=crop',
            demo: '#',
            github: GITHUB_PROFILE_URL,
            category: 'Web',
            tech: ['React', 'Node.js', 'MySQL', 'Stripe'],
          },
          {
            id: 2,
            title: 'Hospital Management App',
            description: 'A secure healthcare dashboard for appointments, patient records, and staff coordination.',
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1000&h=700&fit=crop',
            demo: '#',
            github: GITHUB_PROFILE_URL,
            category: 'Web',
            tech: ['React', 'Express', 'MySQL', 'Admin Panel'],
          },
          {
            id: 3,
            title: 'Digital Marketing Campaign',
            description: 'A brand-first campaign showcase with conversion-focused sections and analytics-ready presentation.',
            image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&h=700&fit=crop',
            demo: '#',
            github: GITHUB_PROFILE_URL,
            category: 'Marketing',
            tech: ['React', 'Tailwind CSS', 'SEO', 'Analytics'],
          },
          {
            id: 4,
            title: 'Restaurant Ordering System',
            description: 'A polished ordering interface for menu browsing, cart flows, and fast customer checkout.',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&h=700&fit=crop',
            demo: '#',
            github: GITHUB_PROFILE_URL,
            category: 'Web',
            tech: ['React', 'Node.js', 'API', 'POS'],
          },
          {
            id: 5,
            title: 'Fitness Tracker App',
            description: 'A modern wellness app for workouts, goal tracking, and progress visualization.',
            image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000&h=700&fit=crop',
            demo: '#',
            github: GITHUB_PROFILE_URL,
            category: 'Mobile',
            tech: ['React Native', 'Charts', 'Health', 'Mobile'],
          },
          {
            id: 6,
            title: 'School ERP System',
            description: 'An organized school management portal for academics, communication, and administration.',
            image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&h=700&fit=crop',
            demo: '#',
            github: GITHUB_PROFILE_URL,
            category: 'Mobile',
            tech: ['React', 'Node.js', 'ERP', 'Dashboard'],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    const bc = new BroadcastChannel('portfolio-cms');
    bc.onmessage = (ev) => {
      try {
        const data = ev.data;
        if (!data) return;
        if (data.type === 'cms:update' && (data.resource === 'projects' || data.resource === 'all')) {
          fetchProjects();
        }
      } catch (e) {
        // ignore
      }
    };

    const refreshOnFocus = () => fetchProjects();
    const refreshOnVisibility = () => {
      if (document.visibilityState === 'visible') fetchProjects();
    };

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnVisibility);

    const refreshTimer = window.setInterval(fetchProjects, 15000);

    return () => {
      bc.close();
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnVisibility);
    };
  }, []);

  useEffect(() => {
    if (!projectsRef.current) return;

    const cards = projectsRef.current.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
      gsap.from(card, {
        opacity: 0,
        y: 28,
        delay: index * 0.08,
        immediateRender: false,
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
        duration: 0.55,
      });
    });
  }, [projects, activeTab]);

  const tabs = ['All', 'Web', 'Mobile', 'Marketing'];
  const visibleProjects =
    activeTab === 'All'
      ? projects
      : projects.filter((project) => String(project?.category || '').toLowerCase() === activeTab.toLowerCase());

  return (
    <section id="projects" className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28">
      <div className="absolute -left-5 top-0 h-50 w-50 rounded-full bg-gradient-to-br from-neon-blue/15 to-transparent blur-3xl" />
      <div className="absolute right-0 bottom-0 h-56 w-56 rounded-full bg-gradient-to-br from-neon-purple/15 to-transparent blur-3xl" />
      <div className="container-custom relative z-10">
        <div className="mb-8 space-y-3 text-center reveal-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-700">My Work</p>
          <h2 className="heading-md text-slate-950">Featured Projects</h2>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            A selection of polished portfolio work focused on clean interfaces, strong branding, and thoughtful interaction.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-3 reveal-up reveal-up-delay-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab ? 'bg-blue-700 text-white shadow-lg shadow-blue-700/20' : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-slate-500">Loading projects...</div>
        ) : visibleProjects.length === 0 ? (
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
            No projects available right now. Please add projects from the admin panel.
          </div>
        ) : (
          <div ref={projectsRef} className="mx-auto grid max-w-6xl gap-5 sm:gap-6 lg:grid-cols-3">
            {visibleProjects.map((project) => (
              <div
                key={project.id}
                className={`project-card overflow-hidden rounded-[1.1rem] border border-slate-200 bg-white shadow-[0_16px_38px_-22px_rgba(15,23,42,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-26px_rgba(15,23,42,0.28)] ${
                  project.id ? 'bg-white' : ''
                }`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.image || resolveProjectImage(project)}
                    alt={project.title}
                    loading="lazy"
                    onError={(event) => {
                      const target = event.currentTarget;
                      const fallback = resolveImageUrl(getFallbackImage(project));
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />

                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-700 shadow-sm backdrop-blur">
                    {project.category || 'Web'}
                  </span>

                  <a
                    href={project.demo}
                    className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-blue-700 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
                  >
                    View
                  </a>
                </div>

                <div className="space-y-3 px-4 py-4 sm:px-5">
                  <div>
                    <h3 className="text-lg font-semibold leading-tight text-slate-950">{project.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{project.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(project.tech || []).slice(0, 3).map((tech) => (
                      <span key={tech} className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <a href={project.demo} className="text-sm font-semibold text-blue-700 transition hover:text-blue-800">
                      Live Demo
                    </a>
                    <a href={project.github} className="text-sm font-semibold text-slate-500 transition hover:text-slate-900">
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;

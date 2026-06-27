import { useEffect } from 'react';
import Navbar from './components/Navbar';
import { createBrowserRouter, RouterProvider, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PrivateRoute from './components/PrivateRoute';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEditor from './pages/AdminEditor';
import AdminSections from './pages/AdminSections';
import AdminPortfolioItems from './pages/AdminPortfolioItems';
import AdminProjectsAdmin from './pages/AdminProjectsAdmin';
import AdminSkillsAdmin from './pages/AdminSkillsAdmin';
import AdminExperienceAdmin from './pages/AdminExperienceAdmin';
import AdminTestimonialsAdmin from './pages/AdminTestimonialsAdmin';
import AdminMessagesAdmin from './pages/AdminMessagesAdmin';
import AdminSettingsAdmin from './pages/AdminSettingsAdmin';
import AdminUsersAdmin from './pages/AdminUsersAdmin';
import AdminAnalyticsAdmin from './pages/AdminAnalyticsAdmin';
import AdminServicesAdmin from './pages/AdminServicesAdmin';
import AdminAboutAdmin from './pages/AdminAboutAdmin';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { customCursor } from './utils/animations';

gsap.registerPlugin(ScrollTrigger);

const MainPage = () => (
  <>
    <Hero />
    <About />
    <Services />
    <Skills />
    <Projects />
    <Experience />
    <Testimonials />
    <Contact />
    <Footer />
  </>
);

function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname === '/dashboard';
  const showNavbar = !isAdminPath;
  const showAdminBackButton = isAdminPath && location.pathname !== '/admin/dashboard' && location.pathname !== '/admin/login' && location.pathname !== '/dashboard';

  useEffect(() => {
    if (!showNavbar) return undefined;

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('main section[id]');

      sections.forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 28,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        });

        const animatedItems = section.querySelectorAll('h2, h3, .reveal-up, .card-float, .project-card, .service-card, .timeline-item, .skill-tile');
        if (animatedItems.length) {
          gsap.from(animatedItems, {
            opacity: 0,
            y: 20,
            stagger: 0.06,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 78%',
              toggleActions: 'play none none reverse',
            },
          });
        }
      });
    });

    return () => ctx.revert();
  }, [location.pathname, showNavbar]);

  return (
    <div className="w-full min-h-screen bg-white text-slate-950">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? 'pt-24' : ''}>
        {showAdminBackButton && (
          <div className="border-b border-slate-200 bg-slate-100 px-6 py-4 shadow-sm shadow-slate-200/40 md:px-16">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname + location.hash}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppWrapper />,
      children: [
        { index: true, element: <MainPage /> },
        { path: 'admin/login', element: <AdminLogin /> },
        {
          path: 'admin',
          element: <PrivateRoute />,
          children: [
            { index: true, element: <Navigate to="/admin/dashboard" replace /> },
            { path: 'dashboard', element: <AdminDashboard /> },
            { path: 'editor/:slug', element: <AdminEditor /> },
            { path: 'sections', element: <AdminSections /> },
            { path: 'services', element: <AdminServicesAdmin /> },
            { path: 'portfolio', element: <AdminPortfolioItems /> },
            { path: 'projects', element: <AdminProjectsAdmin /> },
            { path: 'skills', element: <AdminSkillsAdmin /> },
            { path: 'experience', element: <AdminExperienceAdmin /> },
            { path: 'testimonials', element: <AdminTestimonialsAdmin /> },
            { path: 'messages', element: <AdminMessagesAdmin /> },
            { path: 'settings', element: <AdminSettingsAdmin /> },
            { path: 'users', element: <AdminUsersAdmin /> },
            { path: 'analytics', element: <AdminAnalyticsAdmin /> },
            { path: 'about', element: <AdminAboutAdmin /> },
          ],
        },
        { path: 'login', element: <Navigate to="/admin/login" replace /> },
        { path: 'about', element: <Navigate to="/#about" replace /> },
        { path: 'abouts', element: <Navigate to="/#about" replace /> },
        { path: 'services', element: <Navigate to="/#services" replace /> },
        { path: 'skills', element: <Navigate to="/#skills" replace /> },
        { path: 'projects', element: <Navigate to="/#projects" replace /> },
        { path: 'experience', element: <Navigate to="/#experience" replace /> },
        { path: 'testimonials', element: <Navigate to="/#testimonials" replace /> },
        { path: 'contact', element: <Navigate to="/#contact" replace /> },
        { path: 'sections', element: <Navigate to="/" replace /> },
        { path: 'dashboard', element: <PrivateRoute />,
          children: [
            { index: true, element: <AdminDashboard /> },
          ],
        },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  useEffect(() => {
    customCursor();
  }, []);

  return (
    <MotionConfig reducedMotion="never">
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      />
    </MotionConfig>
  );
}

export default App;

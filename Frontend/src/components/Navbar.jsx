import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

const navContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

const navItem = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentHash = location.hash || '#';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setNavReady(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const scrollToHash = (targetHash) => {
    if (location.pathname === '/') {
      const el = document.querySelector(targetHash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', targetHash);
      return;
    }

    navigate('/');
    setTimeout(() => {
      const el = document.querySelector(targetHash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', targetHash);
    }, 120);
  };

  return (
    <header
      id="top"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 backdrop-blur-xl ${
        scrolled ? 'bg-white/95 border-b border-slate-200 shadow-lg' : 'bg-white/50 border-b border-transparent'
      }`}
    >
      <div className="container-custom grid h-20 grid-cols-[auto,1fr,auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/" className="flex items-center gap-3 text-slate-950">
            <motion.span
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple text-white shadow-neon-blue"
            >
            A
            </motion.span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em]">Amanulla</p>
              <p className="text-xs text-slate-500">Full Stack Developer</p>
            </div>
          </Link>
        </motion.div>

        <motion.nav variants={navContainer} initial="hidden" animate="visible" className="hidden lg:flex items-center justify-center gap-8 pb-3 text-sm font-medium relative justify-self-center">
          {navLinks.map((link, index) => {
            const active = location.pathname === '/' && currentHash === link.href;
            const itemClasses = `relative group no-underline px-1 py-2 transition-all duration-300 ${active ? 'text-slate-950 font-semibold' : 'text-slate-600 hover:text-slate-950'}`;

            const linkContent = (
              <span className="relative inline-flex flex-col items-center gap-1">
                <span className={`${navReady ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} transition-all duration-500 delay-[120ms]`}>
                  {link.label}
                </span>
                <motion.span
                  aria-hidden="true"
                  initial={false}
                  animate={{ scaleX: active ? 1 : 0, opacity: active ? 1 : 0.45 }}
                  whileHover={{ scaleX: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  className="h-[2px] w-full origin-left rounded-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue shadow-[0_0_14px_rgba(56,189,248,0.3)]"
                />
              </span>
            );

            if (link.href === '/') {
              return (
                <motion.div key={link.label} variants={navItem} whileHover={{ y: -2 }} className="relative">
                  <Link to="/" className={itemClasses}>
                  {linkContent}
                  </Link>
                </motion.div>
              );
            }

            if (link.href.startsWith('#')) {
              const handleClick = (e) => {
                e.preventDefault();
                const targetHash = link.href;
                if (location.pathname === '/') {
                  const el = document.querySelector(targetHash);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  window.history.replaceState(null, '', targetHash);
                  return;
                }

                navigate('/');
                setTimeout(() => {
                  const el = document.querySelector(targetHash);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  window.history.replaceState(null, '', targetHash);
                }, 120);
              };

              return (
                <motion.div key={link.label} variants={navItem} whileHover={{ y: -2 }} className="relative">
                  <a href={link.href} onClick={handleClick} className={itemClasses}>
                    {linkContent}
                  </a>
                </motion.div>
              );
            }

            return (
              <motion.div key={link.label} variants={navItem} whileHover={{ y: -2 }} className="relative">
                <Link to={link.href} className={itemClasses}>
                  {linkContent}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        <div className="flex items-center justify-end gap-2 justify-self-end">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToHash('#contact');
            }}
            className="hidden lg:inline-flex items-center rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-neon-blue/20 transition-transform duration-200 hover:-translate-y-0.5"
          >
            Get in Touch
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
            aria-label="Toggle mobile navigation"
            aria-expanded={mobileOpen}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d={mobileOpen ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 shadow-sm lg:hidden overflow-hidden"
        >
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === '/' && currentHash === link.href;
              return (
                <motion.button
                  key={link.label}
                  type="button"
                  onClick={() => scrollToHash(link.href)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition ${active ? 'bg-neon-blue/10 text-neon-blue' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {link.label}
                </motion.button>
              );
            })}
            <motion.button
              type="button"
              onClick={() => scrollToHash('#contact')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-4 py-3 text-sm font-semibold text-white"
            >
              Let’s Talk
            </motion.button>
          </nav>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

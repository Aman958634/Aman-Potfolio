import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import { sectionsAPI } from '../services/api';
import SkillsMarquee from './SkillsMarquee';

const badgeVariant = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const titleVariant = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: 'easeOut' } },
};

const roleVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut', delay: 0.15 } },
};

const copyVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut', delay: 0.25 } },
};

const buttonContainerVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: 'easeOut',
      delay: 0.45,
      staggerChildren: 0.12,
    },
  },
};

const Hero = () => {
  const [section, setSection] = useState(null);

  useEffect(() => {
    const loadHero = async () => {
      try {
        const response = await sectionsAPI.getBySlug('hero');
        setSection(response.data);
      } catch (error) {
        console.error('Error loading hero content', error);
      }
    };

    loadHero();

    const bc = new BroadcastChannel('portfolio-cms');
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'cms:update' && (ev.data.resource === 'sections' || ev.data.resource === 'hero' || ev.data.resource === 'all')) {
        loadHero();
      }
    };

    return () => bc.close();
  }, []);

  const title = section?.title || 'Amanullah';
  const subtitle = section?.subtitle || 'Full Stack Developer';
  const content = section?.content || 'I build modern, scalable, and performance-driven web applications with polished UI, premium spacing, and a luxury minimal aesthetic.';
  const primaryLink = '#contact';
  const secondaryLink = section?.metadata?.projectsLink || '#projects';
  const heroSkills = section?.metadata?.heroSkills || [
    { name: 'React', icon: '⚛️' },
    { name: 'Node.js', icon: '🟢' },
    { name: 'MongoDB', icon: '🍃' },
    { name: 'Tailwind', icon: '💨' },
    { name: 'Figma', icon: '🎨' },
    { name: 'TypeScript', icon: '🟦' },
  ];

  const handleStartProjectClick = (event) => {
    event.preventDefault();
    const target = document.querySelector('#contact');
    if (!target) return;

    const y = target.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: y, behavior: 'smooth' });
    window.history.replaceState(null, '', '#contact');
  };

  return (
    <section id="home" className="relative overflow-visible bg-slate-50 py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-visible">
        <div className="absolute left-[-10%] top-12 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.25),_transparent_60%)] blur-3xl" />
        <div className="absolute right-[-6%] top-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(168,85,247,0.24),_transparent_62%)] blur-3xl" />
        <div className="absolute left-1/2 top-1/4 h-60 w-60 -translate-x-1/2 rounded-full bg-white/10 blur-2xl" />
        <span className="hero-particle top-[18%] left-[12%]" />
        <span className="hero-particle top-[28%] left-[75%]" />
        <span className="hero-particle top-[58%] left-[10%]" />
      </div>

      <div className="container-custom relative z-20">
        <motion.div initial="hidden" animate="visible" className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-6 sm:gap-8 px-2 text-center sm:px-6 lg:px-8">
          <motion.div variants={badgeVariant} className="z-20 inline-flex items-center gap-2 sm:gap-3 rounded-full border border-white/15 bg-white/10 px-3 sm:px-5 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] sm:tracking-[0.28em] text-slate-100 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.6)] backdrop-blur-xl">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 text-white shadow-[0_20px_80px_rgba(56,189,248,0.28)]">A</span>
          </motion.div>

          <motion.h1 variants={titleVariant} className="text-4xl font-extrabold leading-tight tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
            {title}
          </motion.h1>

          <motion.p variants={roleVariant} className="text-2xl font-semibold tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-300 hero-shimmer sm:text-4xl">
            {subtitle}
          </motion.p>

          <motion.p variants={copyVariant} className="mx-auto max-w-3xl text-base leading-8 text-slate-700/90 sm:text-lg">
            {content}
          </motion.p>

          <motion.div variants={buttonContainerVariant} className="flex w-full flex-col items-center justify-center gap-4 sm:gap-6 sm:flex-row">
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              href={primaryLink}
              onClick={handleStartProjectClick}
              className="btn-hero-primary inline-flex w-full sm:w-auto min-w-[12.5rem] sm:min-w-[14rem] items-center justify-center gap-3 rounded-2xl px-8 sm:px-9 py-3.5 text-sm font-semibold shadow-hero-button"
            >
              Start Project
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={secondaryLink}
              className="btn-hero-secondary inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-6 sm:px-7 py-3 sm:py-3.5 text-sm font-semibold"
            >
              Hire Me
              <HiArrowRight className="h-5 w-5" />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      <div className="mt-10">
        <SkillsMarquee skills={heroSkills} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut', delay: 0.8 } }}
        className="mt-12 flex flex-col items-center gap-3"
      >
        <motion.div
          className="scroll-indicator inline-flex items-center justify-center rounded-full border border-slate-300/50 bg-white/75 px-6 py-2.5 shadow-[0_15px_60px_-45px_rgba(15,23,42,0.35)]"
          animate={{ y: [0, -3, 0], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500/90">Scroll Down</span>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

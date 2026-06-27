import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaDownload,
  FaGithub,
  FaLinkedinIn,
  FaLocationDot,
  FaPhone,
  FaRegEnvelope,
  FaRocket,
  FaTwitter,
  FaWhatsapp,
} from 'react-icons/fa6';
import { FiArrowUpRight, FiCode } from 'react-icons/fi';
import { HiMiniSparkles } from 'react-icons/hi2';
import { resolveImageUrl, sectionsAPI } from '../services/api';

const isRenderableImageSource = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return false;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) return false;

  return /^(https?:\/\/|data:|\/|uploads\/|\.\/|\.\.\/)/i.test(trimmed);
};

const getFallbackImage = () => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut', delay },
  }),
};

const About = () => {
  const [section, setSection] = useState(null);

  const loadSection = async () => {
    try {
      const res = await sectionsAPI.getBySlug('about');
      setSection(res.data);
    } catch (error) {
      console.error('Error loading about content', error);
    }
  };

  useEffect(() => {
    loadSection();
    const bc = new BroadcastChannel('portfolio-cms');
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'cms:update' && (ev.data.resource === 'sections' || ev.data.resource === 'about' || ev.data.resource === 'all')) {
        loadSection();
      }
    };

    const handleFocus = () => loadSection();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSection();
      }
    };

    const refreshTimer = window.setInterval(loadSection, 15000);

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      bc.close();
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const title = section?.title || 'Hi, I’m Amanulla';
  const subtitle = section?.subtitle || 'Full Stack Developer';
  const content = section?.content || 'I build modern, scalable, and user-friendly web applications with clean code and exceptional digital experiences.';
  const profileImage =
    resolveImageUrl(isRenderableImageSource(section?.image) ? section.image.trim() : getFallbackImage()) ||
    getFallbackImage();
  const profileTitle = section?.metadata?.profileTitle || 'FULL STACK DEVELOPER';
  const profileName = section?.metadata?.profileName || 'Amanulla';
  const profileDescription = section?.metadata?.profileDescription || 'Available for freelance projects and long-term product development.';
  const cvLabel = section?.metadata?.cvLabel || 'Download CV';
  const cvLink = section?.metadata?.cvLink || '/resume.pdf';
  const experienceYears = '1';
  const projectsCompleted = section?.metadata?.projectsCompleted || '15+';
  const happyClients = section?.metadata?.happyClients || '10+';
  const githubProfileUrl = 'https://github.com/Aman958634';

  const quickStats = [
    { value: experienceYears, label: 'Year Experience', icon: FaRocket, iconClass: 'text-violet-500' },
    { value: projectsCompleted, label: 'Projects Completed', icon: FiCode, iconClass: 'text-indigo-500' },
    { value: happyClients, label: 'Happy Clients', icon: HiMiniSparkles, iconClass: 'text-rose-500' },
  ];

  const socialLinks = [
    { label: 'GitHub', href: githubProfileUrl, icon: FaGithub },
    { label: 'LinkedIn', href: 'https://linkedin.com/', icon: FaLinkedinIn },
    { label: 'Twitter', href: 'https://x.com/', icon: FaTwitter },
    { label: 'WhatsApp', href: 'https://wa.me/', icon: FaWhatsapp },
  ];

  return (
    <section id="about" className="relative overflow-hidden bg-[#f5f7ff] py-16 sm:py-20 lg:py-24">
      <div className="absolute -left-24 top-8 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(80,140,255,0.2),_transparent_64%)] blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(123,97,255,0.22),_transparent_65%)] blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="grid items-start gap-12 xl:grid-cols-[1.04fr_0.96fr]">
          <motion.div
            className="reveal-up"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              <HiMiniSparkles className="h-4 w-4" />
              About Me
            </div>

            <motion.h2 className="mt-6 text-4xl font-extrabold leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl" variants={fadeUp} custom={0.08}>
              {title}
            </motion.h2>

            <motion.p className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl" variants={fadeUp} custom={0.14}>
              {subtitle.split(' ').slice(0, -1).join(' ') || subtitle}{' '}
              <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                {subtitle.split(' ').slice(-1)}
              </span>{' '}
              <span className="inline-block h-6 w-[2px] animate-pulse rounded bg-indigo-500 align-middle" />
            </motion.p>

            <motion.p className="mt-6 max-w-xl text-lg leading-8 text-slate-600" variants={fadeUp} custom={0.2}>{content}</motion.p>

            <motion.div className="mt-8 grid gap-4 sm:grid-cols-3" variants={fadeUp} custom={0.26}>
              {quickStats.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.label} className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)]">
                    <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Icon className={`h-4 w-4 ${item.iconClass}`} />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{item.label}</p>
                  </article>
                );
              })}
            </motion.div>

            <motion.div className="mt-8 flex flex-wrap items-center gap-4" variants={fadeUp} custom={0.32}>
              <a
                href={cvLink}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5"
              >
                {cvLabel}
                <FaDownload className="h-3.5 w-3.5" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Let&apos;s Talk
                <FiArrowUpRight className="h-4 w-4" />
              </a>
            </motion.div>

            <motion.div className="mt-8 flex items-center gap-4" variants={fadeUp} custom={0.38}>
              <p className="text-sm font-semibold text-slate-600">Follow Me</p>
              <div className="flex items-center gap-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:-translate-y-0.5 hover:text-indigo-600"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="reveal-up reveal-up-delay-1"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={0.12}
          >
            <div className="relative mx-auto max-w-[580px]">
              <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_32%_18%,rgba(135,161,255,0.24),transparent_45%),radial-gradient(circle_at_78%_64%,rgba(123,97,255,0.2),transparent_52%)]" />
              <div className="relative rounded-[2rem] border border-indigo-100/80 bg-white/60 p-5 shadow-[0_35px_90px_-60px_rgba(42,56,120,0.45)] backdrop-blur-sm sm:p-6">
                <div className="absolute left-3 top-3 h-4 w-4 rounded-full border-2 border-indigo-500 sm:-left-4 sm:top-10" />
                <div className="absolute right-5 top-6 h-3 w-3 rounded-full bg-indigo-400 sm:right-2" />
                <div className="absolute bottom-16 right-2 h-5 w-5 rounded-full border border-sky-400 sm:-right-4" />

                <article className="absolute left-2 top-10 z-20 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-md sm:-left-6 sm:top-14">
                  <p className="text-2xl font-bold text-slate-900">{experienceYears}</p>
                  <p className="text-xs font-medium text-slate-500">Year Experience</p>
                </article>

                <article className="absolute -bottom-4 right-2 z-20 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-md sm:right-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <p className="text-sm font-semibold text-slate-700">Available for Freelance</p>
                </article>

                <div className="relative overflow-hidden rounded-[1.9rem] border-8 border-white bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700">
                  <img
                    src={profileImage}
                    alt="Profile"
                    onError={(event) => {
                      event.currentTarget.src = getFallbackImage();
                    }}
                    className="h-[380px] w-full object-cover object-top sm:h-[430px]"
                  />
                </div>

                <div className="mt-4 grid gap-0 overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white sm:grid-cols-2">
                  <div className="space-y-1 border-b border-slate-200 p-4 sm:border-b-0 sm:border-r">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Name</p>
                    <p className="text-sm font-semibold text-slate-700">{profileName}</p>
                  </div>
                  <div className="space-y-1 border-b border-slate-200 p-4 sm:border-b-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Location</p>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <FaLocationDot className="h-3 w-3 text-indigo-500" />
                      India
                    </p>
                  </div>
                  <div className="space-y-1 border-b border-slate-200 p-4 sm:border-b-0 sm:border-r">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Email</p>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <FaRegEnvelope className="h-3 w-3 text-indigo-500" />
                      amanullaathaniya@gmail.com
                    </p>
                  </div>
                  <div className="space-y-1 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Phone</p>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <FaPhone className="h-3 w-3 text-indigo-500" />
                      +91 9586342070
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-center text-sm text-slate-500">{profileTitle} • {profileDescription}</p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default About;

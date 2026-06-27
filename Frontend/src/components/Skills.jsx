import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  SiReact,
  SiNodedotjs,
  SiTailwindcss,
  SiMysql,
  SiTypescript,
  SiGsap,
  SiPhp,
  SiBootstrap,
  SiFigma,
  SiMongodb,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiNpm,
  SiVite,
  SiPostman,
} from 'react-icons/si';
import { FaPalette, FaServer, FaCode, FaTerminal, FaDatabase, FaFileCode, FaRegLightbulb } from 'react-icons/fa';
import { skillsAPI } from '../services/api';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_SKILLS = [
  { id: 'default-1', name: 'HTML', level: 'Advanced' },
  { id: 'default-2', name: 'CSS', level: 'Advanced' },
  { id: 'default-3', name: 'JavaScript', level: 'Advanced' },
  { id: 'default-4', name: 'Node.js', level: 'Advanced' },
  { id: 'default-5', name: 'React', level: 'Advanced' },
  { id: 'default-6', name: 'Express.js', level: 'Advanced' },
  { id: 'default-7', name: 'MongoDB', level: 'Intermediate' },
  { id: 'default-8', name: 'Git & GitHub', level: 'Advanced' },
  { id: 'default-9', name: 'TypeScript', level: 'Advanced' },
  { id: 'default-10', name: 'Tailwind CSS', level: 'Advanced' },
];

const skillIconMap = [
  { match: ['react'], icon: SiReact, className: 'text-cyan-500' },
  { match: ['node'], icon: SiNodedotjs, className: 'text-emerald-600' },
  { match: ['tailwind'], icon: SiTailwindcss, className: 'text-sky-500' },
  { match: ['mysql'], icon: SiMysql, className: 'text-sky-700' },
  { match: ['typescript'], icon: SiTypescript, className: 'text-sky-600' },
  { match: ['gsap'], icon: SiGsap, className: 'text-emerald-500' },
  { match: ['php'], icon: SiPhp, className: 'text-violet-600' },
  { match: ['bootstrap'], icon: SiBootstrap, className: 'text-violet-600' },
  { match: ['figma'], icon: SiFigma, className: 'text-pink-500' },
  { match: ['mongo'], icon: SiMongodb, className: 'text-emerald-600' },
  { match: ['git', 'github'], icon: SiGithub, className: 'text-slate-800' },
  { match: ['html'], icon: SiHtml5, className: 'text-orange-500' },
  { match: ['javascript'], icon: SiJavascript, className: 'text-amber-400' },
  { match: ['photoshop'], icon: FaPalette, className: 'text-blue-600' },
  { match: ['npm'], icon: SiNpm, className: 'text-red-500' },
  { match: ['vite'], icon: SiVite, className: 'text-violet-500' },
  { match: ['express'], icon: FaServer, className: 'text-slate-700' },
  { match: ['postman'], icon: FaTerminal, className: 'text-orange-600' },
  { match: ['css'], icon: FaCode, className: 'text-blue-500' },
];

const fallbackIcons = [SiReact, SiNodedotjs, SiTailwindcss, SiMysql, SiTypescript, SiGsap, SiPhp, SiBootstrap, SiFigma, SiMongodb, SiGithub, SiHtml5, SiJavascript, FaPalette, SiNpm, SiVite, FaServer, FaTerminal, FaCode, FaDatabase, FaFileCode];

const normalizeSkillName = (name) => name?.toLowerCase().replace(/\s+/g, ' ').trim() || '';

const uniqueSkillsByName = (items = []) => {
  const seen = new Set();

  return items.filter((item) => {
    const normalizedName = normalizeSkillName(item?.name);
    if (!normalizedName || seen.has(normalizedName)) return false;
    seen.add(normalizedName);
    return true;
  });
};

const normalizeSkillCard = (item) => {
  const name = item?.name || 'Skill';
  const normalized = name.toLowerCase();
  const adminIcon = typeof item?.icon === 'string' ? item.icon.trim() : '';
  const descriptionMap = {
    html: 'Semantic markup for modern web.',
    css: 'Styling, layouts, and responsive design.',
    javascript: 'Interactive & dynamic web experiences.',
    'node.js': 'Backend runtime for scalable apps.',
    react: 'Building reusable UI components.',
    'express.js': 'Fast and minimal web framework.',
    mongodb: 'NoSQL database for modern applications.',
    'git & github': 'Version control and collaboration.',
    typescript: 'Typed JavaScript for safer code.',
    'tailwind css': 'Utility-first styling workflow.',
  };

  const defaults = {
    HTML: { icon: SiHtml5, color: 'text-blue-500', bg: 'bg-blue-100', dots: 'bg-blue-500' },
    CSS: { icon: FaCode, color: 'text-blue-500', bg: 'bg-blue-100', dots: 'bg-blue-500' },
    JavaScript: { icon: SiJavascript, color: 'text-violet-500', bg: 'bg-violet-100', dots: 'bg-violet-500' },
    'Node.js': { icon: SiNodedotjs, color: 'text-lime-600', bg: 'bg-lime-100', dots: 'bg-lime-500' },
    React: { icon: SiReact, color: 'text-cyan-500', bg: 'bg-cyan-100', dots: 'bg-cyan-500' },
    'Express.js': { icon: FaServer, color: 'text-amber-500', bg: 'bg-amber-100', dots: 'bg-amber-500' },
    MongoDB: { icon: SiMongodb, color: 'text-pink-500', bg: 'bg-pink-100', dots: 'bg-pink-500' },
    'Git & GitHub': { icon: SiGithub, color: 'text-violet-500', bg: 'bg-violet-100', dots: 'bg-violet-500' },
  };

  const matchKey = Object.keys(defaults).find((key) => normalized.includes(key.toLowerCase()));
  const base = defaults[matchKey] || { icon: fallbackIcons[0], color: 'text-sky-500', bg: 'bg-sky-100', dots: 'bg-sky-500' };

  return {
    name,
    description: item?.description || descriptionMap[normalized] || `${item?.level || 'Advanced'} skill for building polished products.`,
    level: item?.level || 'Advanced',
    proficiency: Number(item?.proficiency || (item?.level?.toLowerCase?.().includes('inter') ? 82 : 90)),
    adminIcon,
    ...base,
  };
};

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await skillsAPI.getAll();
        if (Array.isArray(res?.data) && res.data.length) {
          setSkills(res.data);
          return;
        }
      } catch (e) {
        console.error('Error loading skills', e);
      }

      setSkills(DEFAULT_SKILLS);
    };

    fetch();
    const bc = new BroadcastChannel('portfolio-cms');
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'cms:update' && (ev.data.resource === 'skills' || ev.data.resource === 'all')) fetch();
    };

    return () => bc.close();
  }, []);

  const getSkillIcon = (item, index) => {
    const name = item.name?.toLowerCase() || '';
    const match = skillIconMap.find((entry) => entry.match.some((term) => name.includes(term)));

    return match || { icon: fallbackIcons[index % fallbackIcons.length], className: 'text-slate-500' };
  };

  const displaySkills = uniqueSkillsByName(skills).map(normalizeSkillCard);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tiles = containerRef.current?.querySelectorAll('.skill-card');
      if (!tiles?.length) return;

      tiles.forEach((tile, index) => {
        gsap.from(tile, {
          opacity: 0,
          y: 28,
          delay: index * 0.08,
          scrollTrigger: {
            trigger: tile,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
          duration: 0.6,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [skills]);

  return (
    <section id="skills" className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28">
      <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-neon-blue/15 to-transparent blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-neon-purple/15 to-transparent blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-violet-600">MY SKILLS</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Technologies I Work With</h2>
          <div className="mx-auto mt-4 h-0.5 w-16 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-sky-500" />
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-500">
            Only the skills added from the admin panel are shown here, so this section always stays in sync with your content.
          </p>
        </div>

        <div ref={containerRef} className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displaySkills.length === 0 ? (
            <div className="col-span-full rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.12)]">
              No skills have been added from the admin panel yet.
            </div>
          ) : displaySkills.map((item, index) => {
            const iconConfig = getSkillIcon(item, index);
            const Icon = iconConfig.icon;
            const skillCard = normalizeSkillCard(item);

            return (
              <div
                key={item.id || item.name || index}
                className="skill-card group rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.18)] transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_30px_75px_-35px_rgba(15,23,42,0.22)]"
                aria-label={skillCard.name}
                title={skillCard.name}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-20 w-20 flex-none items-center justify-center rounded-full ${skillCard.bg} shadow-inner`}>
                    {skillCard.adminIcon ? (
                      <span className={`text-2xl font-semibold ${skillCard.color}`}>{skillCard.adminIcon}</span>
                    ) : (
                      <Icon className={`h-10 w-10 ${skillCard.color} transition-transform duration-300 group-hover:scale-110`} aria-hidden="true" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <h3 className={`text-lg font-semibold ${skillCard.color}`}>{skillCard.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{skillCard.description}</p>

                    <div className="mt-5 flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, dotIndex) => (
                        <span
                          key={dotIndex}
                          className={`h-2.5 w-2.5 rounded-full ${dotIndex < Math.max(2, Math.round(skillCard.proficiency / 20)) ? skillCard.dots : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-[1.75rem] border border-white bg-white px-6 py-5 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.16)] sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-500">
                <FaRegLightbulb className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Always Learning</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">I’m always exploring new technologies and improving my skills to build better digital experiences.</p>
              </div>
            </div>

            <a href="#contact" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5">
              Let’s Connect
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;

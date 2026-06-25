import { useMemo } from 'react';

const fallbackSkills = [
  { id: 'fallback-react', name: 'React', icon: '⚛️', level: 'Advanced' },
  { id: 'fallback-node', name: 'Node.js', icon: '🟢', level: 'Advanced' },
  { id: 'fallback-tailwind', name: 'Tailwind CSS', icon: '💨', level: 'Advanced' },
  { id: 'fallback-typescript', name: 'TypeScript', icon: '🟦', level: 'Advanced' },
  { id: 'fallback-mysql', name: 'MySQL', icon: '🗄️', level: 'Intermediate' },
  { id: 'fallback-gsap', name: 'GSAP', icon: '✨', level: 'Advanced' },
];

const getFallbackIcon = (name) => {
  const normalized = String(name || '').toLowerCase();

  if (normalized.includes('react')) return '⚛️';
  if (normalized.includes('node')) return '🟢';
  if (normalized.includes('tailwind')) return '💨';
  if (normalized.includes('type')) return '🟦';
  if (normalized.includes('mysql')) return '🗄️';
  if (normalized.includes('gsap')) return '✨';
  if (normalized.includes('mongo')) return '🍃';
  if (normalized.includes('figma')) return '🎨';
  return (name || 'SK').slice(0, 2).toUpperCase();
};

const getSkillTone = (name) => {
  const normalized = String(name || '').toLowerCase();

  if (normalized.includes('react')) return 'from-sky-500 via-cyan-500 to-blue-600';
  if (normalized.includes('node')) return 'from-emerald-500 via-lime-500 to-green-600';
  if (normalized.includes('tailwind')) return 'from-cyan-500 via-sky-500 to-blue-500';
  if (normalized.includes('type')) return 'from-indigo-500 via-violet-500 to-sky-500';
  if (normalized.includes('mysql')) return 'from-amber-500 via-orange-500 to-rose-500';
  if (normalized.includes('gsap')) return 'from-fuchsia-500 via-pink-500 to-violet-500';
  if (normalized.includes('mongo')) return 'from-emerald-500 via-green-500 to-lime-500';
  if (normalized.includes('figma')) return 'from-pink-500 via-rose-500 to-orange-500';

  return 'from-slate-600 via-slate-700 to-slate-900';
};

const SkillsMarquee = ({ skills = [] }) => {
  const marqueeSkills = useMemo(() => {
    const source = skills.length > 0 ? skills : fallbackSkills;
    return source.map((item, index) => ({
      id: item.id || `skill-marquee-${index}`,
      name: item.name || item.label || 'Skill',
      icon: item.icon || getFallbackIcon(item.name || item.label),
      level: item.level || 'Advanced',
      tone: getSkillTone(item.name || item.label),
    }));
  }, [skills]);

  const renderSkillCards = (items, isClone = false) =>
    items.map((skill, index) => (
      <div
        key={`${isClone ? 'clone' : 'base'}-${skill.id}-${index}`}
        className="skills-marquee__card inline-flex flex-none items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(15,23,42,0.22)] sm:min-w-[11rem] sm:px-5 sm:py-4 md:min-w-[12rem]"
      >
        <span className={`inline-flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-gradient-to-br ${skill.tone} text-sm font-black text-white shadow-[0_16px_45px_-24px_rgba(59,130,246,0.45)]`}>
          {skill.icon}
        </span>
        <span className="flex flex-col text-left">
          <span className="text-sm font-semibold text-slate-950 whitespace-nowrap">{skill.name}</span>
          <span className="text-xs uppercase tracking-[0.28em] text-slate-500 whitespace-nowrap">{skill.level}</span>
        </span>
      </div>
    ));

  return (
    <div className="skills-marquee relative left-1/2 w-screen max-w-none -translate-x-1/2 overflow-hidden border-y border-slate-200 bg-white/95 py-3 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.18)] sm:py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white via-white/90 to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white via-white/90 to-transparent sm:w-24" />

      <div className="skills-marquee__track flex w-max flex-nowrap whitespace-nowrap px-4 sm:px-6 lg:px-8">
        {Array.from({ length: 2 }).map((_, groupIndex) => (
          <div
            key={`skills-marquee-group-${groupIndex}`}
            className="skills-marquee__group flex flex-none flex-nowrap items-center gap-3 pr-3 sm:gap-4 sm:pr-4"
            aria-hidden={groupIndex > 0}
          >
            {renderSkillCards(marqueeSkills, groupIndex > 0)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsMarquee;
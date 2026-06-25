import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { experienceAPI } from '../utils/api';
import { FaGithub } from 'react-icons/fa6';

gsap.registerPlugin(ScrollTrigger);

const GITHUB_PROFILE_URL = 'https://github.com/Aman958634';

const Experience = () => {
  const [experience, setExperience] = useState([]);
  const timelineRef = useRef(null);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const response = await experienceAPI.getAll();
        setExperience(response.data);
      } catch (error) {
        console.error('Error fetching experience:', error);
        setExperience([
          {
            id: 1,
            role: 'Senior Full Stack Developer',
            company: 'Tech Solutions Pvt. Ltd.',
            duration: '2023 - Present',
            description: 'Building scalable web applications and mentoring engineering teams.',
          },
          {
            id: 2,
            role: 'Full Stack Developer',
            company: 'Web Innovators',
            duration: '2021 - 2023',
            description: 'Delivered polished digital products using modern frontend and backend stacks.',
          },
          {
            id: 3,
            role: 'Frontend Developer',
            company: 'Design Studio',
            duration: '2020 - 2021',
            description: 'Crafted beautiful UI experiences for web and mobile applications.',
          },
        ]);
      }
    };

    fetchExperience();
    const bc = new BroadcastChannel('portfolio-cms');
    bc.onmessage = (ev) => {
      const data = ev.data;
      if (data?.type === 'cms:update' && (data.resource === 'experience' || data.resource === 'all')) fetchExperience();
    };

    const refreshOnFocus = () => fetchExperience();
    const refreshOnVisibility = () => {
      if (document.visibilityState === 'visible') fetchExperience();
    };

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnVisibility);

    const refreshTimer = window.setInterval(fetchExperience, 15000);

    return () => {
      bc.close();
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnVisibility);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = timelineRef.current?.querySelectorAll('.timeline-item');
      if (!items?.length) return;

      items.forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          y: 40,
          immediateRender: false,
          clearProps: 'opacity,transform',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          duration: 0.6,
        });
      });
    }, timelineRef);

    return () => ctx.revert();
  }, [experience]);

  return (
    <section id="experience" className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28">
      <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-neon-blue/15 to-transparent blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-neon-purple/15 to-transparent blur-3xl" />
      <div className="container-custom relative z-10">
        <div className="mb-12 sm:mb-16 space-y-3 text-center reveal-up">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-600">Experience</p>
          <h2 className="heading-md text-slate-950">Career Timeline</h2>
          <a
            href={GITHUB_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
          >
            <FaGithub className="h-4 w-4" />
            GitHub Profile
          </a>
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="absolute left-6 sm:left-1/2 top-0 h-full w-px bg-gradient-to-b from-neon-blue to-neon-purple opacity-40" />

          <div ref={timelineRef} className="space-y-10">
            {experience.length === 0 ? (
              <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
                No experience entries available right now.
              </div>
            ) : experience.map((item, index) => (
              <div key={item.id} className="timeline-item relative grid gap-5 sm:gap-6 lg:grid-cols-[0.5fr_1fr] items-center pl-1 sm:pl-0">
                <div className={`relative flex justify-start sm:justify-center ${index % 2 === 0 ? 'lg:justify-end' : 'lg:justify-start'}`}>
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white border border-slate-200 shadow-lg">
                    <span className="text-slate-950 font-semibold">{index + 1}</span>
                  </div>
                </div>
                <div className="card-float rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-8 shadow-xl shadow-slate-200/50">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-slate-500">{item.duration}</p>
                      <h3 className="mt-3 text-2xl font-semibold text-slate-950">{item.role}</h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{item.company}</span>
                  </div>
                  <p className="mt-5 text-slate-600 leading-7">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;

import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { servicesAPI } from '../utils/api';

gsap.registerPlugin(ScrollTrigger);

const Services = () => {
  const [services, setServices] = useState([]);
  const containerRef = useRef(null);

  const defaultServices = [
    {
      id: 'default-1',
      title: 'Web Development',
      description: 'Build responsive, fast, and modern web applications with React, Node.js, and Tailwind CSS.',
    },
    {
      id: 'default-2',
      title: 'UI/UX Design',
      description: 'Design polished interfaces focused on clarity, usability, and consistent branding.',
    },
    {
      id: 'default-3',
      title: 'E-Commerce Solutions',
      description: 'Create secure online stores with checkout flow, product management, and performance optimizations.',
    },
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await servicesAPI.getAll();
        const data = Array.isArray(response.data) && response.data.length > 0 ? response.data : defaultServices;
        setServices(data);
      } catch (error) {
        console.error('Error loading services', error);
        setServices(defaultServices);
      }
    };

    fetchServices();
    const bc = new BroadcastChannel('portfolio-cms');
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'cms:update' && (ev.data.resource === 'services' || ev.data.resource === 'all')) {
        fetchServices();
      }
    };

    return () => bc.close();
  }, []);

  const cardStyles = [
    {
      accent: 'from-blue-500 to-cyan-500',
      icon: 'from-blue-500 to-cyan-500',
      blob: 'bg-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-600',
      shadow: 'shadow-blue-500/10',
    },
    {
      accent: 'from-purple-500 to-pink-500',
      icon: 'from-purple-500 to-pink-500',
      blob: 'bg-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-600',
      shadow: 'shadow-purple-500/10',
    },
    {
      accent: 'from-orange-400 to-rose-400',
      icon: 'from-orange-400 to-rose-400',
      blob: 'bg-orange-100',
      border: 'border-orange-200',
      text: 'text-orange-600',
      shadow: 'shadow-orange-500/10',
    },
    {
      accent: 'from-emerald-500 to-lime-500',
      icon: 'from-emerald-500 to-lime-500',
      blob: 'bg-emerald-100',
      border: 'border-emerald-200',
      text: 'text-emerald-600',
      shadow: 'shadow-emerald-500/10',
    },
    {
      accent: 'from-sky-500 to-indigo-500',
      icon: 'from-sky-500 to-indigo-500',
      blob: 'bg-sky-100',
      border: 'border-sky-200',
      text: 'text-sky-600',
      shadow: 'shadow-sky-500/10',
    },
    {
      accent: 'from-rose-500 to-fuchsia-500',
      icon: 'from-rose-500 to-fuchsia-500',
      blob: 'bg-rose-100',
      border: 'border-rose-200',
      text: 'text-rose-600',
      shadow: 'shadow-rose-500/10',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = containerRef.current?.querySelectorAll('.service-card');
      if (!cards?.length) return;

      cards.forEach((card, index) => {
        gsap.from(card, {
          opacity: 0,
          y: 40,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
          duration: 0.6,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [services]);

  return (
    <section id="services" className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28">
      <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-neon-blue/15 to-transparent blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-neon-purple/15 to-transparent blur-3xl" />
      <div className="container-custom relative z-10">
        <div className="mb-12 sm:mb-16 space-y-3 text-center reveal-up">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-600">What I Offer</p>
          <h2 className="heading-md text-slate-950">Services</h2>
        </div>

        <div ref={containerRef} className="grid gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
          {services.length === 0 ? (
            <div className="text-center text-slate-500 col-span-full py-12">No services published yet.</div>
          ) : (
            services.map((service, idx) => {
              const style = cardStyles[idx % cardStyles.length];
              return (
                <div
                  key={service.id}
                  className={`service-card card-float group relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-slate-200 p-5 sm:p-7 shadow-[0_25px_60px_-30px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_90px_-35px_rgba(15,23,42,0.18)] cursor-pointer min-h-[16rem] sm:min-h-[18rem]`}
                >
                  <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-slate-100 to-white" />
                  <div className={`absolute -right-8 top-8 h-24 w-24 rounded-full opacity-30 blur-3xl ${style.blob}`} />
                  <div className={`absolute -left-8 bottom-8 h-20 w-20 rounded-full opacity-30 blur-3xl ${style.accent}`} />

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${style.icon} text-white text-2xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-105`}>
                          {service.icon ? service.icon : service.title?.slice(0, 2).toUpperCase() || 'SL'}
                        </div>
                        <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${style.text} bg-slate-100/90 border ${style.border}`}>
                          {service.title?.slice(0, 2).toUpperCase() || 'SL'}
                        </div>
                      </div>

                      <h3 className="mt-8 text-2xl font-bold text-slate-950 mb-4">{service.title}</h3>
                      <p className="text-slate-600 leading-7">{service.description}</p>
                    </div>

                    <div className="mt-8 flex items-center justify-between text-sm font-semibold text-slate-600 transition-colors duration-300 group-hover:text-slate-950">
                      <span>Learn more</span>
                      <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default Services;

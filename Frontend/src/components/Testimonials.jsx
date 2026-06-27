import { useEffect, useState } from 'react';
import { testimonialsAPI } from '../services/api';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await testimonialsAPI.getAll();
        setReviews(res.data || []);
      } catch (error) {
        console.error('Error loading testimonials', error);
        setReviews([
          {
            name: 'Ravi Sharma',
            role: 'CEO, TechCorp',
            text: 'Amanulla transformed our platform with a premium interface and strong engineering discipline. The experience was seamless and on time.',
            rating: 5,
          },
          {
            name: 'Priya Patel',
            role: 'Founder, StartupX',
            text: 'The design felt very modern and clean. The app performance, responsiveness and attention to detail were excellent.',
            rating: 5,
          },
          {
            name: 'John Doe',
            role: 'Manager, DejaSolutions',
            text: 'Professional communication, fast delivery, and a truly luxury finish. I highly recommend Amanulla for startup projects.',
            rating: 5,
          },
        ]);
      }
    };

    fetchTestimonials();
    const bc = new BroadcastChannel('portfolio-cms');
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'cms:update' && (ev.data.resource === 'testimonials' || ev.data.resource === 'all')) {
        fetchTestimonials();
      }
    };

    return () => bc.close();
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28">
      <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-neon-blue/15 to-transparent blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-neon-purple/15 to-transparent blur-3xl" />
      <div className="container-custom relative z-10">
        <div className="mb-12 sm:mb-16 space-y-3 text-center reveal-up">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-600">Testimonials</p>
          <h2 className="heading-md text-slate-950">What Clients Say</h2>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <div key={review.id || index} className="glass-effect card-float reveal-up rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 p-5 sm:p-8 shadow-xl shadow-slate-200/50">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-neon-blue to-neon-purple text-white text-lg font-bold">
                  {review.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{review.name}</h3>
                  <p className="text-sm text-slate-500">{review.role}</p>
                </div>
              </div>

              <p className="text-slate-600 leading-7">"{review.text}"</p>

              <div className="mt-6 flex gap-1 text-amber-400">
                {Array.from({ length: review.rating || 0 }).map((_, starIndex) => (
                  <span key={starIndex}>★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

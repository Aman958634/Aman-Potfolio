import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { contactAPI, sectionsAPI, settingsAPI } from '../utils/api';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [section, setSection] = useState({
    title: 'Contact',
    subtitle: "Let’s create something amazing together.",
    content: 'Send a message and let’s turn your next idea into a premium digital product.',
  });
  const [contactInfo, setContactInfo] = useState({
    email: 'amanullaathnaiya@gmail.com',
    location: 'India, Gujarat',
    availability: 'Open for freelance & full-time',
  });
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (formRef.current) {
        gsap.from(formRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power3.out',
        });
      }
    }, formRef);

    const loadContactSection = async () => {
      try {
        const response = await sectionsAPI.getBySlug('contact');
        const data = response.data;
        setSection({
          title: data.title || section.title,
          subtitle: data.subtitle || section.subtitle,
        });
      } catch (error) {
        console.error('Error loading contact section content', error);
      }
    };

    const loadContactSettings = async () => {
      try {
        const response = await settingsAPI.getAll();
        const settings = response.data || [];
        const contactSettings = {
          email: 'amanullaathnaiya@gmail.com',
          location: 'India, Gujarat',
          availability: 'Open for freelance & full-time',
        };

        settings.forEach((setting) => {
          if (setting.setting_key === 'contactAvailability') contactSettings.availability = setting.value;
        });

        setContactInfo(contactSettings);
      } catch (error) {
        console.error('Error loading contact settings', error);
      }
    };

    loadContactSection();
    loadContactSettings();

    const bc = new BroadcastChannel('portfolio-cms');
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'cms:update' && (ev.data.resource === 'sections' || ev.data.resource === 'settings' || ev.data.resource === 'contact' || ev.data.resource === 'all')) {
        loadContactSection();
        loadContactSettings();
      }
    };

    return () => {
      bc.close();
      ctx.revert();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contactAPI.submit(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      try {
        const bc = new BroadcastChannel('portfolio-cms');
        bc.postMessage({ type: 'cms:update', resource: 'messages' });
        bc.close();
      } catch (broadcastError) {
        console.warn('BroadcastChannel not available:', broadcastError);
      }
      setTimeout(() => {
        window.location.reload();
      }, 900);
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-neon-blue/15 to-transparent blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-neon-purple/15 to-transparent blur-3xl" />
      <div className="container-custom relative z-10">
        <div className="mb-12 sm:mb-16 space-y-3 text-center reveal-up">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-600">Get in Touch</p>
          <h2 className="heading-md text-slate-950">Start Your Project</h2>
        </div>

        <div className="grid gap-8 sm:gap-12 lg:grid-cols-3 items-start">
          {/* Contact Info Cards */}
          <div className="space-y-6 lg:col-span-1">
            {[
              { label: 'Email', value: contactInfo.email, icon: '✉️' },
              { label: 'Location', value: contactInfo.location, icon: '📍' },
              { label: 'Availability', value: contactInfo.availability, icon: '⏰' },
            ].map((item) => (
              <div key={item.label} className="group card-float rounded-[1.5rem] sm:rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 sm:p-6 hover:border-neon-blue hover:shadow-lg transition duration-300">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">{item.label}</p>
                    <p className="mt-2 text-slate-900 font-semibold group-hover:text-neon-blue transition">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            {success ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neon-blue/10 text-4xl text-neon-blue">✈️</div>
                <h3 className="text-3xl font-semibold text-slate-950">Message sent</h3>
                <p className="text-slate-600">Thanks for reaching out — I’ll reply within 24 hours.</p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 reveal-up reveal-up-delay-1">
                <div>
                  <label htmlFor="contact-name" className="block text-slate-700 font-semibold mb-2">Your Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                    className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/10"
                    placeholder="Amanulla"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-slate-700 font-semibold mb-2">Your Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/10"
                    placeholder="amanulla@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-slate-700 font-semibold mb-2">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                    rows={6}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/10 resize-none"
                    placeholder="Tell me about your project..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  autoComplete="off"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-neon-blue/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                  <span>✈️</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

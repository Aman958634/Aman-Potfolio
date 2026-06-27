import { useEffect, useState } from 'react';
import { sectionsAPI } from '../services/api';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [footer, setFooter] = useState(null);

  const defaultSocialLinks = [
    { name: 'GitHub', icon: '💻', url: 'https://github.com' },
    { name: 'LinkedIn', icon: '🔗', url: 'https://linkedin.com' },
    { name: 'Twitter', icon: '𝕏', url: 'https://twitter.com' },
    { name: 'Email', icon: '📧', url: 'mailto:amanulla@example.com' },
  ];

  useEffect(() => {
    const loadFooter = async () => {
      try {
        const response = await sectionsAPI.getBySlug('footer');
        setFooter(response.data);
      } catch (error) {
        console.error('Error loading footer content', error);
      }
    };

    loadFooter();

    const bc = new BroadcastChannel('portfolio-cms');
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'cms:update' && (ev.data.resource === 'sections' || ev.data.resource === 'footer' || ev.data.resource === 'all')) {
        loadFooter();
      }
    };

    return () => bc.close();
  }, []);

  const footerMeta = (() => {
    try {
      if (!footer?.metadata) return {};
      if (typeof footer.metadata === 'object') return footer.metadata;
      return JSON.parse(footer.metadata);
    } catch {
      return {};
    }
  })();

  const footerContent = footer?.content || 'A modern portfolio crafted for founders and premium digital products with beautiful interactions and refined spacing.';
  const socialLinks = footerMeta.socialLinks || defaultSocialLinks;
  const footerNote = footerMeta.subtitle || 'Privacy Policy • Terms & Conditions';

  return (
    <footer className="relative overflow-hidden bg-white border-t border-slate-200">
      <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-neon-blue/10 to-transparent blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-neon-purple/10 to-transparent blur-3xl" />
      <div className="container-custom relative z-10 py-8">
        <div className="flex items-center justify-between gap-8 flex-wrap lg:flex-nowrap">
          {/* Brand Section */}
          <div className="flex items-center gap-3 min-w-max">
            <div className="h-12 w-12 rounded-[1rem] bg-gradient-to-br from-neon-blue to-neon-purple text-white grid place-items-center text-lg font-bold">A</div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Amanulla</p>
              <p className="text-xs text-slate-500">Full Stack Developer</p>
            </div>
          </div>

          {/* Center Content */}
          <div className="text-center flex-1 hidden md:block">
            <p className="text-sm text-slate-600">Building modern web experiences | Available for new projects</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-neon-blue hover:bg-neon-blue hover:text-white hover:scale-110"
                title={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-500 whitespace-nowrap">© {currentYear} Amanulla</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sectionsAPI, servicesAPI, projectsAPI, skillsAPI, experienceAPI, testimonialsAPI, contactAPI, usersAPI } from '../utils/api';

const sidebarLinks = [
  'Dashboard',
  'Sections',
  'About',
  'Services',
  'Portfolio Items',
  'Projects',
  'Skills',
  'Experience',
  'Testimonials',
  'Messages',
  'Settings',
  'Users',
  'Analytics',
];

const quickActions = [
  { title: 'Manage Sections', subtitle: 'Edit hero, about, contact, footer content', action: 'sections' },
  { title: 'Manage Hero', subtitle: 'Configure hero CTA, title, and stats', action: 'sections' },
  { title: 'Manage About', subtitle: 'Edit about text, photo, and CV button', action: 'about' },
  { title: 'Manage Services', subtitle: 'Update homepage service cards', action: 'services' },
  { title: 'Manage Projects', subtitle: 'Edit portfolio project entries', action: 'projects' },
  { title: 'Manage Skills', subtitle: 'Update the skills list', action: 'skills' },
  { title: 'Manage Experience', subtitle: 'Edit timeline experience entries', action: 'experience' },
  { title: 'Manage Testimonials', subtitle: 'Update client feedback cards', action: 'testimonials' },
  { title: 'Settings', subtitle: 'Manage site-wide contact details', action: 'settings' },
];

const activityItems = [
  { title: 'New message from John Doe', time: '2 minutes ago' },
  { title: 'Project “E-Commerce Website” updated', time: '1 hour ago' },
  { title: 'Skill “Next.js” added', time: '3 hours ago' },
  { title: 'New section “Certifications” created', time: '5 hours ago' },
  { title: 'Profile information updated', time: '1 day ago' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [serviceCount, setServiceCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [skillCount, setSkillCount] = useState(0);
  const [experienceCount, setExperienceCount] = useState(0);
  const [testimonialCount, setTestimonialCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const [sectionRes, serviceRes, projectRes, skillRes, experienceRes, testimonialRes, messageRes, userRes] = await Promise.all([
        sectionsAPI.getAll(),
        servicesAPI.getAll(),
        projectsAPI.getAll(),
        skillsAPI.getAll(),
        experienceAPI.getAll(),
        testimonialsAPI.getAll(),
        contactAPI.getAll(),
        usersAPI.getAll(),
      ]);

      setSections(sectionRes.data || []);
      setServiceCount(serviceRes.data?.length || 0);
      setProjectCount(projectRes.data?.length || 0);
      setSkillCount(skillRes.data?.length || 0);
      setExperienceCount(experienceRes.data?.length || 0);
      setTestimonialCount(testimonialRes.data?.length || 0);
      setMessageCount(messageRes.data?.length || 0);
      setUserCount(userRes.data?.length || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load admin data');
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminEmail');
    navigate('/admin/login');
  };

  const adminEmail = localStorage.getItem('adminEmail') || 'admin@prestige.com';
  const completedSections = ['about', 'contact', 'footer'].filter((slug) => sections.some((section) => section.slug === slug)).length;
  const activeSections = sections.length;
  const portfolioItems = projectCount;
  const messages = messageCount;
  const profileViews = userCount;

  const handleQuickAction = (action) => {
    const map = {
      sections: '/admin/sections',
      about: '/admin/about',
      services: '/admin/services',
      projects: '/admin/projects',
      skills: '/admin/skills',
      experience: '/admin/experience',
      testimonials: '/admin/testimonials',
      messages: '/admin/messages',
      settings: '/admin/settings',
    };
    navigate(map[action] || '/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="w-full px-4 sm:px-6 py-6 sm:py-10 xl:px-16">
        <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border border-slate-200 bg-white p-4 sm:p-6 shadow-sm shadow-slate-200/60">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Prestige</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Portfolio Admin</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 text-white font-semibold">
                P
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => {
                    const map = {
                      Dashboard: '/admin/dashboard',
                      Sections: '/admin/sections',
                      About: '/admin/about',
                      Services: '/admin/services',
                      'Portfolio Items': '/admin/portfolio',
                      Projects: '/admin/projects',
                      Skills: '/admin/skills',
                      Experience: '/admin/experience',
                      Testimonials: '/admin/testimonials',
                      Messages: '/admin/messages',
                      Settings: '/admin/settings',
                      Users: '/admin/users',
                      Analytics: '/admin/analytics',
                    };
                    const to = map[link] || '/admin/dashboard';
                    navigate(to);
                  }}
                  className="flex w-full items-center justify-between border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:bg-violet-50"
                >
                  <span>{link}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Go</span>
                </button>
              ))}
            </nav>

            {/* Removed promotional "Upgrade to Pro" card per request */}

            <div className="mt-8 border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Logged in as</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{adminEmail}</p>
              <p className="mt-2 text-sm text-slate-500">Administrator</p>
            </div>
          </aside>

            <main className="space-y-8">
            <div className="border border-slate-200 bg-white p-5 sm:p-8 shadow-sm shadow-slate-200/40">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Admin dashboard</p>
                  <h3 className="mt-2 text-3xl font-semibold text-slate-900">Welcome back, Amanulla!</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">Manage your portfolio, sections, and content updates from one premium dashboard.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/about')}
                    className="rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-400/20 transition hover:bg-violet-700"
                  >
                    Edit About Section
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="border border-slate-200 bg-white p-4 sm:p-6 shadow-sm shadow-slate-200/40">
                <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Total Sections</p>
                <p className="mt-4 text-4xl font-semibold text-slate-900">{activeSections}</p>
                <p className="mt-3 text-sm text-slate-500">{activeSections} active sections in your portfolio.</p>
              </div>
              <div className="border border-slate-200 bg-white p-4 sm:p-6 shadow-sm shadow-slate-200/40">
                <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Portfolio Items</p>
                <p className="mt-4 text-4xl font-semibold text-slate-900">{portfolioItems}</p>
                <p className="mt-3 text-sm text-slate-500">New items added this month.</p>
              </div>
              <div className="border border-slate-200 bg-white p-4 sm:p-6 shadow-sm shadow-slate-200/40">
                <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Messages</p>
                <p className="mt-4 text-4xl font-semibold text-slate-900">{messages}</p>
                <p className="mt-3 text-sm text-slate-500">Unread messages waiting for review.</p>
              </div>
              <div className="border border-slate-200 bg-white p-4 sm:p-6 shadow-sm shadow-slate-200/40">
                <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Profile Views</p>
                <p className="mt-4 text-4xl font-semibold text-slate-900">{profileViews}</p>
                <p className="mt-3 text-sm text-slate-500">This month’s profile traffic.</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <div className="border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/40">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Overview</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">Traffic summary</h3>
                  </div>
                  <select className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none">
                    <option>This Month</option>
                    <option>Last 30 Days</option>
                    <option>Last Year</option>
                  </select>
                </div>
                <div className="mt-8 h-64 bg-gradient-to-br from-slate-100 to-slate-50 p-6">
                  <div className="flex items-end gap-3 h-full">
                    <div className="flex-1 bg-violet-500/10 p-4 shadow-inner shadow-violet-500/10">
                      <div className="h-40 bg-violet-500/20" />
                    </div>
                    <div className="flex-1 bg-sky-500/10 p-4 shadow-inner shadow-sky-500/10">
                      <div className="h-32 bg-sky-500/20" />
                    </div>
                    <div className="flex-1 bg-emerald-500/10 p-4 shadow-inner shadow-emerald-500/10">
                      <div className="h-24 bg-emerald-500/20" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/40">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Quick Actions</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">Fast shortcuts</h3>
                  </div>
                  <button type="button" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                    View All
                  </button>
                </div>
                <div className="mt-6 grid gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.title}
                      type="button"
                      onClick={() => handleQuickAction(action.action)}
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-left text-sm text-slate-700 transition hover:border-violet-300 hover:bg-violet-50"
                    >
                      <p className="font-semibold text-slate-900">{action.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{action.subtitle}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/40">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Recent Sections</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">Section status</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/editor/about')}
                    className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    Add Section
                  </button>
                </div>
                <div className="mt-8 overflow-hidden border border-slate-200">
                  <table className="w-full border-collapse text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-5 py-4">Section</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Updated</th>
                        <th className="px-5 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {['about', 'contact', 'footer'].map((slug) => {
                        const section = sections.find((item) => item.slug === slug);
                        return (
                          <tr key={slug} className="border-t border-slate-200 hover:bg-slate-50">
                            <td className="px-5 py-4 font-medium text-slate-900">{slug.charAt(0).toUpperCase() + slug.slice(1)}</td>
                            <td className="px-5 py-4">
                              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                                {section ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-slate-500">{section ? 'May 19, 2025' : '-'}</td>
                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() => navigate(slug === 'about' ? '/admin/about' : `/admin/editor/${slug}`)}
                                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/40">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Recent Activity</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">Activity feed</h3>
                  </div>
                  <button type="button" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                    View All
                  </button>
                </div>
                <div className="mt-8 space-y-4">
                  {activityItems.map((item) => (
                    <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="mt-2 text-sm text-slate-500">{item.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

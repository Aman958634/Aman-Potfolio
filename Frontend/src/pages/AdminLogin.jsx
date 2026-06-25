import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('adminEmail', data.email);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message
        || err.message
        || 'Unable to connect to the backend. Restart your frontend and backend servers.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-violet-600">Admin Access</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Admin Login</h1>
          <p className="mt-3 text-slate-500">Secure dashboard access for portfolio updates.</p>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20"
              placeholder="Email"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20"
              placeholder="Password"
              required
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-neon-blue/20 transition-transform duration-200 hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

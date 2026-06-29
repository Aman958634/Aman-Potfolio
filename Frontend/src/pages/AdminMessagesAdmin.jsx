import { useEffect, useState } from 'react';
import { contactAPI } from '../services/api';

const AdminMessagesAdmin = () => {
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [emailConfig, setEmailConfig] = useState(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [resendingId, setResendingId] = useState(null);

  const fetch = async () => {
    try {
      const res = await contactAPI.getAll();
      setMessages(res.data || []);
    } catch (e) {
      setMessages([]);
      setFeedback(e.message || 'Unable to load messages.');
    }
  };

  useEffect(() => {
    fetch();

    const bc = new BroadcastChannel('portfolio-cms');
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'cms:update' && (ev.data.resource === 'messages' || ev.data.resource === 'contact' || ev.data.resource === 'all')) {
        fetch();
      }
    };

    return () => bc.close();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await contactAPI.delete(id);
      setMessages((s) => s.filter((m) => m.id !== id));
      try {
        const bc = new BroadcastChannel('portfolio-cms');
        bc.postMessage({ type: 'cms:update', resource: 'messages' });
        bc.close();
      } catch (broadcastError) {
        console.warn('BroadcastChannel not available:', broadcastError);
      }
    } catch (e) {
      console.error(e);
      setFeedback(e.message || 'Unable to delete message.');
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setFeedback('');
    setEmailConfig(null);

    try {
      const response = await contactAPI.testEmail();
      setFeedback(response.data?.message || 'Test email sent successfully.');
      setEmailConfig(response.data?.emailConfig || null);
    } catch (error) {
      setFeedback(error.message || 'Test email failed.');
      setEmailConfig(error.response?.data?.emailConfig || null);
    } finally {
      setTestingEmail(false);
    }
  };

  const handleResendEmail = async (id) => {
    setResendingId(id);
    setFeedback('');
    setEmailConfig(null);

    try {
      const response = await contactAPI.resendEmail(id);
      setFeedback(response.data?.message || 'Saved message sent to Gmail successfully.');
      await fetch();
    } catch (error) {
      const serverData = error.response?.data;
      setFeedback(
        serverData?.emailHelp
          ? `${error.message} ${serverData.emailHelp}`
          : error.message || 'Unable to resend Gmail.'
      );
      setEmailConfig(serverData?.emailConfig || null);
      await fetch();
    } finally {
      setResendingId(null);
    }
  };

  const getEmailStatusLabel = (message) => {
    if (message.email_status === 'sent') return 'Gmail sent';
    if (message.email_status === 'failed') return 'Gmail failed';
    return 'Gmail pending';
  };

  const getEmailStatusClass = (message) => {
    if (message.email_status === 'sent') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (message.email_status === 'failed') return 'border-red-200 bg-red-50 text-red-700';
    return 'border-amber-200 bg-amber-50 text-amber-700';
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Messages</h2>
          <p className="mt-1 text-sm text-slate-500">Saved contact form messages and Gmail delivery test.</p>
        </div>
        <button
          type="button"
          onClick={handleTestEmail}
          disabled={testingEmail}
          className="rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {testingEmail ? 'Sending Test...' : 'Send Test Gmail'}
        </button>
      </div>

      {feedback && <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{feedback}</div>}
      {emailConfig && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <div className="font-semibold text-slate-900">Email config</div>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            <div><span className="font-semibold">Host:</span> {emailConfig.host || 'n/a'}</div>
            <div><span className="font-semibold">Port:</span> {emailConfig.port || 'n/a'}</div>
            <div><span className="font-semibold">Secure:</span> {emailConfig.secure ? 'true' : 'false'}</div>
            <div><span className="font-semibold">User:</span> {emailConfig.user || 'missing'}</div>
            <div><span className="font-semibold">Recipient:</span> {emailConfig.recipient || 'missing'}</div>
            <div><span className="font-semibold">Password:</span> {emailConfig.hasPassword ? 'set' : 'missing'}</div>
          </div>
        </div>
      )}

      <div className="border bg-white p-4">
        {messages.length === 0 ? (
          <div className="text-slate-500">No messages.</div>
        ) : (
          <ul>
            {messages.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-4 border-b py-4">
                <div>
                  <div className="font-medium">
                    {m.name} <span className="text-sm text-slate-500">{m.email}</span>
                  </div>
                  <div className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                    <div><span className="font-semibold text-slate-800">Phone:</span> {m.phone || 'Not provided'}</div>
                    <div><span className="font-semibold text-slate-800">Subject:</span> {m.subject || 'Project inquiry'}</div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className={`rounded-full border px-3 py-1 font-semibold ${getEmailStatusClass(m)}`}>
                      {getEmailStatusLabel(m)}
                    </span>
                    {m.email_sent_at && <span className="text-slate-500">Sent: {new Date(m.email_sent_at).toLocaleString()}</span>}
                  </div>
                  {m.email_error && (
                    <div className="mt-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {m.email_error}
                    </div>
                  )}
                  <div className="mt-3 whitespace-pre-wrap text-slate-700">{m.message}</div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleResendEmail(m.id)}
                    disabled={resendingId === m.id}
                    className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resendingId === m.id ? 'Sending...' : 'Resend Gmail'}
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="px-3 py-1 text-sm text-red-600">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminMessagesAdmin;

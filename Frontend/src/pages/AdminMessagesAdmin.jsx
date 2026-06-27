import { useEffect, useState } from 'react';
import { contactAPI } from '../services/api';

const AdminMessagesAdmin = () => {
  const [messages, setMessages] = useState([]);

  const fetch = async () => {
    try {
      const res = await contactAPI.getAll();
      setMessages(res.data || []);
    } catch (e) {
      setMessages([]);
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
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h2 className="text-2xl font-semibold mb-4">Messages</h2>
      <div className="border bg-white p-4">
        {messages.length === 0 ? (
          <div className="text-slate-500">No messages.</div>
        ) : (
          <ul>
            {messages.map((m) => (
              <li key={m.id} className="flex items-start justify-between border-b py-3">
                <div>
                  <div className="font-medium">{m.name} — <span className="text-sm text-slate-500">{m.email}</span></div>
                  <div className="mt-1 text-slate-700">{m.message}</div>
                </div>
                <div>
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

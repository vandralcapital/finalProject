import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ActiveSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [terminating, setTerminating] = useState('');

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/active-sessions`);
      if (!res.ok) throw new Error('Failed to fetch active sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTerminate = async (email) => {
    setTerminating(email);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/terminate-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error('Failed to terminate session');
      await fetchSessions();
    } catch (err) {
      alert(err.message);
    } finally {
      setTerminating('');
    }
  };

  if (!user || user.role !== 'admin') {
    return <div style={{ padding: 24 }}><h2>Not authorized</h2></div>;
  }

  return (
    <div className="app">
      <Navbar />
      <div className="content-wrapper">
        <Sidebar />
        <div className="main-content dashboard-container">
          <h2 style={{ marginBottom: 24 }}>Currently Logged In Users</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', marginTop: 16, background: '#fff', width: '100%', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr><td colSpan={3}>No active users found.</td></tr>
                ) : (
                  sessions.map(({ email, role }) => (
                    <tr key={email}>
                      <td>{email}</td>
                      <td>{role}</td>
                      <td>
                        <button
                          className="green-btn"
                          style={{ minWidth: 120 }}
                          onClick={() => handleTerminate(email)}
                          disabled={terminating === email}
                        >
                          {terminating === email ? 'Terminating...' : 'Terminate Session'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveSessions; 
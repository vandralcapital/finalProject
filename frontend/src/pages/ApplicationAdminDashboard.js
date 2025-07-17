import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import axios from 'axios';
// Simple toast implementation
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      background: type === 'error' ? '#d9534f' : '#5cb85c',
      color: 'white',
      padding: '16px 32px',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      fontWeight: 600,
      fontSize: 16
    }}>
      {message}
    </div>
  );
};

const ApplicationAdminDashboard = () => {
  const { user } = useAuth();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [appIds, setAppIds] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState({}); // { reviewerEmail: true }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null); // { message, type }

  // Fetch applications for this admin
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get all applications for this admin
        const appsRes = await axios.get(`${process.env.REACT_APP_API_URL}/creating`);
        const myApps = appsRes.data.filter(app => app.adminEmail === user.email);
        const myAppIds = myApps.map(app => app._id);
        setAppIds(myAppIds);

        // 2. Get all pending audits for admin (new endpoint)
        const auditsRes = await axios.get(`${process.env.REACT_APP_API_URL}/pendingAuditsForAdmin`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setPendingReviews(auditsRes.data);
        setError('');
      } catch (e) {
        setError('Failed to fetch pending reviews.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) fetchData();
  }, [user]);

  // Group pending reviews by reviewer
  const reviewerMap = {};
  pendingReviews.forEach(audit => {
    const reviewerEmail = audit.user_id?.email;
    if (!reviewerEmail) return;
    if (!reviewerMap[reviewerEmail]) {
      reviewerMap[reviewerEmail] = {
        reviewerName: audit.user_id?.name || reviewerEmail,
        audits: [],
      };
    }
    reviewerMap[reviewerEmail].audits.push(audit);
  });

  const handleSelectReviewer = (email) => {
    setSelectedReviewers(prev => ({ ...prev, [email]: !prev[email] }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.keys(reviewerMap).every(email => selectedReviewers[email]);
    if (allSelected) {
      setSelectedReviewers({});
    } else {
      const newSelected = {};
      Object.keys(reviewerMap).forEach(email => {
        newSelected[email] = true;
      });
      setSelectedReviewers(newSelected);
    }
  };

  const handleNotify = async () => {
    const reviewersToNotify = Object.keys(selectedReviewers).filter(email => selectedReviewers[email]);
    if (reviewersToNotify.length === 0) {
      setToast({ message: 'Select at least one reviewer to notify.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      // For each reviewer, send a notification with their pending employees
      await Promise.all(
        reviewersToNotify.map(async (email) => {
          const audits = reviewerMap[email].audits;
          const employeeNames = audits.map(a => a.emp_id?.name).filter(Boolean);
          await axios.post(`${process.env.REACT_APP_API_URL}/sendReviewNotification`, {
            reviewerEmail: email,
            employeeNames,
            message: `The following employee(s) are awaiting your review: ${employeeNames.join(', ')}.`
          });
        })
      );
      setToast({ message: 'Notification(s) sent!', type: 'success' });
    } catch (e) {
      setToast({ message: 'Failed to send notification(s).', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Navbar />
      <div className="content-wrapper">
        <Sidebar />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div className="dashboard-container">
          <h2>Pending Reviews (Your Applications)</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <>
              <button className="btn btn-primary mb-3" onClick={handleSelectAll}>
                {Object.keys(reviewerMap).every(email => selectedReviewers[email]) ? 'Deselect All' : 'Select All'}
              </button>
              <button className="btn btn-success mb-3 ms-2" onClick={handleNotify} disabled={loading}>
                Notify Selected Reviewers
              </button>
              <table className="table table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Select</th>
                    <th>Reviewer Name</th>
                    <th>Reviewer Email</th>
                    <th>Pending Employees</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(reviewerMap).length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center">No pending reviews found</td>
                    </tr>
                  ) : (
                    Object.entries(reviewerMap).map(([email, { reviewerName, audits }]) => (
                      <tr key={email}>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!selectedReviewers[email]}
                            onChange={() => handleSelectReviewer(email)}
                          />
                        </td>
                        <td>{reviewerName}</td>
                        <td>{email}</td>
                        <td>{audits.map(a => a.emp_id?.name).filter(Boolean).join(', ')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationAdminDashboard; 
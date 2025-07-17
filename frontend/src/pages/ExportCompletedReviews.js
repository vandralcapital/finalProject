import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useAuth } from '../auth/AuthContext';

// Reuse the CompletedReviewsTable component from reviewer_dashboard/Dashboard.js
const CompletedReviewsTable = ({ reviews, rightsKeys }) => (
  <table className="table">
    <thead>
      <tr>
        <th>Employee Name</th>
        {rightsKeys.map(key => (
          <th key={key}>{key}</th>
        ))}
        <th>Reviewer Remarks</th>
        <th>Action Taken</th>
        <th>Reviewed By</th>
        <th>Review Date,Time</th>
      </tr>
    </thead>
    <tbody>
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <tr key={review._id}>
            <td>{review.employeeName || '-'}</td>
            {rightsKeys.map(key => (
              <td key={key}>
                {review.menuRights && review.menuRights[key] ? review.menuRights[key] : '-'}
              </td>
            ))}
            <td>{review.reviewerRemarks || '-'}</td>
            <td>{review.actionTaken ? review.actionTaken.charAt(0).toUpperCase() + review.actionTaken.slice(1) : '-'}</td>
            <td>{review.reviewerName || '-'}</td>
            <td>{review.submittedAt ? new Date(review.submittedAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={7 + rightsKeys.length} className="text-center">No completed reviews found.</td>
        </tr>
      )}
    </tbody>
  </table>
);

const ExportCompletedReviews = () => {
  const [completedReviews, setCompletedReviews] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchCompletedReviews = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/completedReviews`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setCompletedReviews(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch completed reviews.');
      }
    };
    fetchCompletedReviews();
  }, []);

  // Dynamically determine all unique rights categories
  const rightsKeysSet = new Set();
  completedReviews.forEach(review => {
    if (review.menuRights && typeof review.menuRights === 'object') {
      Object.keys(review.menuRights).forEach(key => rightsKeysSet.add(key));
    }
  });
  const rightsKeys = Array.from(rightsKeysSet);

  // Export to Excel
  const handleExport = () => {
    if (completedReviews.length === 0) return;
    const data = completedReviews.map(review => {
      const row = {
        'Employee Name': review.employeeName,
        'Reviewer Remarks': review.reviewerRemarks,
        'Action Taken': review.actionTaken,
        'Reviewed By': review.reviewerName,
        'Review Date,Time': review.submittedAt ? new Date(review.submittedAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
      };
      rightsKeys.forEach(key => {
        row[key] = review.menuRights && review.menuRights[key] ? review.menuRights[key] : '-';
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CompletedReviews');
    XLSX.writeFile(wb, 'CompletedReviews.xlsx');
  };

  return (
    <div className="app">
      <Navbar />
      <div className="content-wrapper">
        <Sidebar />
        <div className="dashboard-container">
          <h2>Completed Reviews</h2>
          <button className="btn btn-success mb-3" onClick={handleExport} disabled={completedReviews.length === 0}>
            Export to Excel
          </button>
          <CompletedReviewsTable reviews={completedReviews} rightsKeys={rightsKeys} />
        </div>
      </div>
    </div>
  );
};

export default ExportCompletedReviews; 
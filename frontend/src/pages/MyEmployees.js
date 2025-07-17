import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../auth/AuthContext';

const MyEmployees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [myAppNames, setMyAppNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyAppsAndEmployees = async () => {
      setLoading(true);
      try {
        // Get all applications for this admin
        const appRes = await fetch(`${process.env.REACT_APP_API_URL}/creating`);
        const apps = await appRes.json();
        const myApps = apps.filter(app => app.adminEmail === user.email);
        const appNames = myApps.map(app => app.appName);
        setMyAppNames(appNames);

        // Get all employees
        const empRes = await fetch(`${process.env.REACT_APP_API_URL}/employee`);
        const allEmployees = await empRes.json();
        // Filter employees by applicationName (for manual creation)
        const filtered = allEmployees.filter(emp => appNames.includes(emp.applicationName));
        setEmployees(filtered);
      } catch (e) {
        setError('Failed to fetch employees or applications.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) fetchMyAppsAndEmployees();
  }, [user]);

  return (
    <div className="app">
      <Navbar />
      <div className="content-wrapper">
        <Sidebar />
        <div className="container mt-5">
          <h2>My Employees</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Emp Name</th>
                    <th>Emp Email</th>
                    <th>Reviewer Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center">No employees found</td>
                    </tr>
                  ) : (
                    employees.map((emp, idx) => (
                      <tr key={emp._id || idx}>
                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.hod || (emp.user_id && emp.user_id.email) || '-'}</td>
                        <td>{emp.role || 'Employee'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyEmployees; 
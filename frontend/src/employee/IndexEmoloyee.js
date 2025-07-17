import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from "../components/Navbar";
import Sidebar from '../components/Sidebar';

const EmployeeIndex = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    user_id: '' // Add user_id to form
  });
  const [reviewers, setReviewers] = useState([]); // State for reviewers

  // Fetch employees data from the backend
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/employee`);
      setEmployees(response.data);
    } catch (err) {
      setError('Error fetching employee data.');
    }
  };

  // Fetch reviewers (HODs)
  const fetchReviewers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/hods`);
      setReviewers(response.data);
    } catch (err) {
      setError('Error fetching reviewers.');
    }
  };

  // Update employee status (true: Enabled, false: Disabled)
  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/employee/${id}`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data) {
        // Update the local state with the new status
        setEmployees(prevEmployees => 
          prevEmployees.map(employee => 
            employee._id === id ? { ...employee, status: status } : employee
          )
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update employee status. Please try again.');
    }
  };

  // Handle edit button click
  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setEditForm({
      name: employee.name,
      email: employee.email,
      user_id: employee.user_id?._id || '' // Set current reviewer
    });
    setShowModal(true);
    fetchReviewers(); // Fetch reviewers when opening modal
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle reviewer dropdown change
  const handleReviewerChange = (e) => {
    setEditForm(prev => ({
      ...prev,
      user_id: e.target.value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/employee/${editingEmployee._id}`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEmployees(employees.map(employee => 
        employee._id === editingEmployee._id ? { ...employee, ...editForm, user_id: reviewers.find(r => r._id === editForm.user_id) } : employee
      ));
      setShowModal(false);
    } catch (err) {
      setError('Error updating employee details.');
    }
  };

  // Add this function to handle conversion to Employee and Reviewer
  const handleConvertToReviewer = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/convertToReviewer`, {
        name: editForm.name,
        email: editForm.email
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Optionally update the local state to reflect the new reviewer
      fetchEmployees();
      setError('');
      alert('Employee converted to Reviewer successfully!');
    } catch (err) {
      setError('Failed to convert employee to reviewer.');
    }
  };

  // Fetch employees when the component mounts
  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="app">
      <Navbar />
      <div className="content-wrapper">
        <Sidebar />
        <div className="container mt-5">
          <h2>Employee</h2>
          <a href='/employeescreate'>
            <button className='btn btn-md btn-primary text-white' style={{backgroundColor: "#167340"}}>Create New Employee</button>
          </a>
          <br />
          <br />
          {error && <p className="text-danger">{error}</p>}

          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Reviewer NAME</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No employees found</td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee._id}>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.user_id?.name}</td>
                    <td>{employee.status === false ? 'Disabled' : 'Enabled'}</td>
                    <td>
                      <button 
                        className='btn btn-sm me-2 mb-2 text-white' style={{backgroundColor: "#167340"}}
                        onClick={() => handleEditClick(employee)}
                      >
                        Modify
                      </button>
                      {employee.status === true ? (
                        <button 
                          className='btn btn-sm btn-danger'
                          onClick={() => updateStatus(employee._id, false)}
                        >
                          Disable
                        </button>
                      ) : (
                        <button 
                          className='btn btn-sm btn-success'
                          onClick={() => updateStatus(employee._id, true)}
                        >
                          Enable
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Employee</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reviewer (HOD)</label>
                    <select
                      className="form-select"
                      name="user_id"
                      value={editForm.user_id}
                      onChange={handleReviewerChange}
                      required
                    >
                      <option value="">Select Reviewer</option>
                      {reviewers.map(reviewer => (
                        <option key={reviewer._id} value={reviewer._id}>
                          {reviewer.name} ({reviewer.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Close
                    </button>
                    <button type="submit" className="btn btn-primary" style={{backgroundColor: "#167340"}}>
                      Save Changes
                    </button>
                    <button type="button" className="btn btn-warning ms-2" onClick={handleConvertToReviewer}>
                      Convert Him To Employee And Reviewer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeIndex;

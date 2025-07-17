import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from "../components/Navbar";
import Sidebar from '../components/Sidebar';
import Swal from "sweetalert2";

const EmployeeForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);  // To hold HOD data
  const [selectedUser, setSelectedUser] = useState('');  // Store selected HOD ID
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/hods`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch register');
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error('Error userhod user:', error);
      });

    // Fetch applications
    // axios.get('/creating')
    //   .then((result) => setApplications(result.data))
    //   .catch((err) => console.error('Failed to fetch applications', err));
  }, []);

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value); // Set selected HOD ID
  };

  // const handleApplicationChange = (e) => {
  //   setSelectedApplication(e.target.value); // Set selected application name
  // };

  // Handle form submission to add a new employee
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newEmployee = {
        name,
        email,
        user_id: selectedUser, // Add the selected user (HOD ID) here
        // applicationName: selectedApplication // Add the selected application name here
      };
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/employee`,
        newEmployee,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      Swal.fire({
        title: "Employee Created Successfully",
        icon: "success",
      }).then((result) => {
        window.location.href = "/employees";
      });
      setError('');
    } catch (err) {
      setError('Failed to create  Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Navbar />
      <div className="content-wrapper">
        <Sidebar />
        <div className="container mt-5">
          <h2>Add New Employee</h2>
          {error && <p className="text-danger">{error}</p>}
          {success && <p className="text-success">{success}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Employee Name</label>
              <input
                type="text"
                id="name"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Employee Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label>Select HOD:</label>
              <select value={selectedUser} onChange={handleUserChange} className='form-control' required>
                <option value="">-- Select HOD --</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="mb-3">
              <label>Select Application:</label>
              <select value={selectedApplication} onChange={handleApplicationChange} className='form-control' required>
                <option value="">-- Select Application --</option>
                {applications.map(app => (
                  <option key={app._id} value={app.appName}>
                    {app.appName}
                  </option>
                ))}
              </select>
            </div> */}

            <button type="submit" className="btn btn-primary" style={{backgroundColor: "#167340"}}>Add Employee</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Swal from "sweetalert2";

const CreateAuditForm = () => {
  const [empId, setEmpId] = useState('');
  const [selectedemp, setSelectedEmp] = useState('');

  const [frequencyId, setFrequencyId] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [userId, setUserId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(''); // Added state for selected user
  const [applicationId, setApplicationId] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [next_audit_date, setNextAuditDate] = useState('');
  const [auditDate, setAuditDate] = useState('');
  const [inactive, setInactive] = useState(false);
  const [rights, setRights] = useState('');
  const [reviewerRemarks, setReviewerRemarks] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [appRights, setAppRights] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedRights, setSelectedRights] = useState([]);
  const [rightsDetails, setRightsDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // fetch employees
    fetch('/employee')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch frequencies');
        }
        return response.json();
      })
      .then((data) => {
        setEmployees(data);
      })
      .catch((error) => {
        console.error('Error fetching frequencies:', error);
      });

    // Fetch frequencies
    fetch('/frequency')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch frequencies');
        }
        return response.json();
      })
      .then((data) => {
        setFrequencies(data);
      })
      .catch((error) => {
        console.error('Error fetching frequencies:', error);
      });

    // Fetch users
    fetch('/register')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });

    // Fetch applications
    fetch('/creating')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        return response.json();
      })
      .then((data) => {
        setApplications(data);
      })
      .catch((error) => {
        console.error('Error fetching applications:', error);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that all selected rights have details
    const missingDetails = selectedRights.filter(right => !rightsDetails[right]?.trim());
    if (missingDetails.length > 0) {
      setError(`Please provide details for: ${missingDetails.join(', ')}`);
      return;
    }

    const newAudit = {
      emp_id: empId,
      user_id: userId,
      application_id: applicationId,
      initialRights: selectedRights.join(","),
      excelRightsData: rightsDetails // Store the rights details in the same format as Excel uploads
    };

    try {
      const response = await axios.post('/audit', newAudit);
      Swal.fire({
        title: "Review Created Successfully",
        icon: "success",
      }).then((result) => {
        window.location.href = "/create_audit";
      });

      setError('');
    } catch (err) {
      setError('Failed to create review. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationChange = async (e) => {

    const applicationId = e.target.value;
    setApplicationId(applicationId);
    setSelectedRights([]); // Clear previously selected rights
    setAppRights({}); // Clear appRights state before fetching
    try {
      const response = await axios.get('/getApplicationDataForReview', {
        params: { application_id: applicationId }  // Send frequency_id in the query parameters
      });
      
      const fetchedAppRights = response.data.message.app_rights;
      let formattedAppRights = {};

      if (fetchedAppRights) {
          if (typeof fetchedAppRights === 'object' && !Array.isArray(fetchedAppRights)) {
            // If it's already a nested object
            formattedAppRights = fetchedAppRights;
          } else if (Array.isArray(fetchedAppRights)) {
            // If it's a simple array, put it under a 'default' category
            formattedAppRights = { 'default': fetchedAppRights };
          } 
          // If fetchedAppRights is null, undefined, or other, formattedAppRights remains {} (empty object)
      }

      setAppRights(formattedAppRights); // Set the state with the formatted object
      setNextAuditDate(response.data.nextAuditDate);
      setError('');  // Clear any previous error
    } catch (err) {
      console.error('Failed to fetch application data for review:', err);
      setError('Failed to fetch application data for review.');
      setAppRights({}); // Set to empty object on error
      setNextAuditDate(null);
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setSelectedRights((prevRights) => {
      const newRights = checked 
        ? [...prevRights, value] 
        : prevRights.filter((right) => right !== value);
      
      // Update rightsDetails when rights are deselected
      if (!checked) {
        setRightsDetails(prev => {
          const newDetails = { ...prev };
          delete newDetails[value];
          return newDetails;
        });
      }
      
      return newRights;
    });
  };

  const handleRightsDetailsChange = (right, value) => {
    setRightsDetails(prev => ({
      ...prev,
      [right]: value
    }));
  };

  return (
    <div className="app">
      <Navbar />
      <div className="content-wrapper">
        <Sidebar />
        <div className="container mt-5">
          <h2>Create New Review</h2>

          {error && <p className="text-danger">{error}</p>}
          {success && <p className="text-success">{success}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Select Application:</label>
              <select value={applicationId} onChange={handleApplicationChange} className='form-control' required>
                <option value="" selected disabled>Select</option>
                {applications.map((application) => (
                  <option key={application._id} value={application._id}>
                    {application.appName}
                  </option>
                ))}
              </select>
              {next_audit_date && (
                <small>
                  Next Review Date: <b>{new Date(next_audit_date).toLocaleDateString('en-US', {
                    weekday: 'long', // e.g. 'Monday'
                    year: 'numeric', // e.g. '2025'
                    month: 'long', // e.g. 'February'
                    day: 'numeric' // e.g. '17'
                  })}</b>
                </small>
              )}

            </div>
            <div className="mb-3">
              <label>Select Employee:</label>
              <select value={empId} onChange={(e) => setEmpId(e.target.value)} className='form-control' required>
                <option value="" selected disabled>Select</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label>Select HOD/Reviewer:</label>
              <select value={userId} onChange={(e) => setUserId(e.target.value)} className='form-control' required>
                <option value="" selected disabled>Select</option>
                {/* Only show the reviewer whose _id matches the selected employee's user_id */}
                {(() => {
                  if (!empId) return null;
                  const selectedEmployee = employees.find(emp => emp._id === empId);
                  if (!selectedEmployee) return null;
                  // Find the reviewer (user) whose _id matches selectedEmployee.user_id
                  return users
                    .filter(user => user._id === (selectedEmployee.user_id && selectedEmployee.user_id._id ? selectedEmployee.user_id._id : selectedEmployee.user_id))
                    .map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ));
                })()}
              </select>
            </div>



            <div className="mb-3">
              <label htmlFor="rights" className="form-label">Initial Rights:</label><br></br>
              
              {appRights && typeof appRights === 'object' && Object.keys(appRights).length > 0 ? (
                Object.keys(appRights).map(categoryKey => (
                  <div key={categoryKey} className="mb-2">
                    <h6>{categoryKey}</h6>
                    {Array.isArray(appRights[categoryKey]) && appRights[categoryKey].length > 0 ? (
                      appRights[categoryKey].map((right, rightIndex) => (
                        <div key={`${categoryKey}-${rightIndex}`} className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`right-${categoryKey}-${rightIndex}`}
                            value={right}
                            onChange={handleCheckboxChange}
                            checked={selectedRights.includes(right)}
                          />
                          <label className="form-check-label" htmlFor={`right-${categoryKey}-${rightIndex}`}>
                            {right}
                          </label>
                          {selectedRights.includes(right) && (
                            <div className="mt-2">
                              <textarea
                                className="form-control"
                                placeholder={`Enter details for ${right}`}
                                value={rightsDetails[right] || ''}
                                onChange={(e) => handleRightsDetailsChange(right, e.target.value)}
                                required
                              />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <small className='text-muted'>No rights in this category</small>
                    )}
                  </div>
                ))
              ) : Array.isArray(appRights) && appRights.length > 0 ? (
                <div className="mb-2">
                  <h6>Default Category</h6>
                  {appRights.map((right, index) => (
                    <div key={`default-${index}`} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`right-default-${index}`}
                        value={right}
                        onChange={handleCheckboxChange}
                        checked={selectedRights.includes(right)}
                      />
                      <label className="form-check-label" htmlFor={`right-default-${index}`}>
                        {right}
                      </label>
                      {selectedRights.includes(right) && (
                        <div className="mt-2">
                          <textarea
                            className="form-control"
                            placeholder={`Enter details for ${right}`}
                            value={rightsDetails[right] || ''}
                            onChange={(e) => handleRightsDetailsChange(right, e.target.value)}
                            required
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (appRights && typeof appRights === 'object' && Object.keys(appRights).length === 0) ? (
                <small className='text-muted'>No rights assigned to this application</small>
              ) : (
                <small className='text-muted'>Select Application First</small>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{backgroundColor: "#167340"}} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Audit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAuditForm;

import React, { useState, useEffect } from 'react';
import { Route, Navigate } from 'react-router-dom';
import Audit from './audit/create_audit'; // Import your Audit component

const ProtectedRoute = ({ element: Element, allowedRoles, ...rest }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the user role from your backend (could be from a session or an API)
    fetch(`${process.env.REACT_APP_API_URL}/get-user-role`)
      .then((res) => res.json())
      .then((data) => {
        setRole(data.role); // Set the user role
        setLoading(false); // Finish loading
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading spinner or something similar
  }

  // If the user role is not allowed, redirect them
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" />; // Redirect if not authorized (can show a custom message if needed)
  }

  // If authorized, render the component
  return <Route {...rest} element={<Element />} />;
};

// Define the route for `/create_audit` and use ProtectedRoute
function App() {
  return (
    <div>
      <ProtectedRoute
        path="/create_audit"
        element={<Audit />}
        allowedRoles={[1]} // Only admin can access
      />
    </div>
  );
}

export default App;

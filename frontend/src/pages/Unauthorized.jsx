import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const goBack = () => {
    if (user?.role === 'admin') navigate('/admin/dashboard');
    else if (user?.role === 'clinical') navigate('/clinical/dashboard');
    else if (user?.role === 'inventory') navigate('/inventory/dashboard');
    else navigate('/login');
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>401 - Unauthorized</h1>
      <p>You do not have permission to view this page.</p>
      <button onClick={goBack} style={{ marginRight: '10px' }}>Go Back</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Unauthorized;

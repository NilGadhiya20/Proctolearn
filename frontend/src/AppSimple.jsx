import React from 'react';

const AppSimple = () => {
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#16a34a' }}>Proctolearn - Test Page</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>System Status:</h2>
        <ul>
          <li>✅ React is rendering correctly</li>
          <li>✅ Frontend server is running on port 3000</li>
          <li>✅ JavaScript is enabled</li>
        </ul>
      </div>
    </div>
  );
};

export default AppSimple;

import React, { useEffect } from 'react';

const Chat = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  return (
    <div style={{ minHeight: '80vh', padding: '2rem' }}>
      <h1>Chat Page</h1>
      {/* Chat UI goes here */}
    </div>
  );
};

export default Chat;

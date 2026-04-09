import { io } from 'socket.io-client';

const inferBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/?api$/, '');
  }

  // Fallback: current host with backend port 5000
  return `${window.location.protocol}//${window.location.hostname}:5000`;
};

const socket = io(inferBaseUrl(), {
  transports: ['websocket'],
});

export default socket;

let ioInstance = null;

export const registerSocketIO = (io) => {
  ioInstance = io;
};

export const getIOInstance = () => ioInstance;

export default {
  registerSocketIO,
  getIOInstance
};
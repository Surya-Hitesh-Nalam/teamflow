import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api';
  }
  return 'http://localhost:5001/api';
};

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || getBaseURL(),
  withCredentials: true 
});

export default API;

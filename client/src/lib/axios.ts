import axios from "axios";

// configure axios to use baseURL and credentials for all requests by default

 const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

export default axiosInstance; 
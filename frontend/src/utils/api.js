import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Update while deployed
  withCredentials: true,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // You can change this if you store it differently
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default api;

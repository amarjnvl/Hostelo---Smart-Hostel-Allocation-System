import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const sendOtpAPI = (rollNo) => api.post("/auth/send-otp", { rollNo });
export const verifyOtpAPI = (rollNo, otp) =>
  api.post("/auth/verify-otp", { rollNo, otp }).then((res) => res.data);
export const getProfileAPI = (rollNo) =>
  api.get(`/students/profile/${rollNo}`).then((res) => res.data);

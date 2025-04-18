import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("rollNo");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const sendOtpAPI = async (rollNo) => {
  try {
    const response = await api.post("/auth/send-otp", { rollNo });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const verifyOtpAPI = async (rollNo, otp) => {
  try {
    const response = await api.post("/auth/verify-otp", { rollNo, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const getProfileAPI = async (rollNo) => {
  try {
    const response = await api.get(`/students/profile/${rollNo}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

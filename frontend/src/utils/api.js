import axios from "axios";

/**
 * Creates an Axios instance with the base URL and withCredentials enabled.
 */
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

/**
 * Process the queue of failed requests and resolves or rejects them based on the error.
 * @param {Error} error The error to be processed.
 * @param {string} [token] The new token to be used for retrying the requests.
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Logs the request to the console.
 * @param {Object} config The request configuration.
 */
const logRequest = (config) => {
  console.log("[API Request]", {
    url: config.url,
    method: config.method,
    headers: config.headers,
  });
};

/**
 * Logs the response to the console.
 * @param {Object} response The response from the server.
 */
const logResponse = (response) => {
  console.log("[API Response]", {
    url: response.config.url,
    status: response.status,
    data: response.data,
  });
};

/**
 * Logs the error to the console.
 * @param {Error} error The error to be logged.
 */
const logError = (error) => {
  console.error("[API Error]", {
    url: error.config?.url,
    status: error.response?.status,
    message: error.response?.data?.message,
  });
};

/**
 * Handles the request and response interceptors.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  logRequest(config);
  return config;
});

/**
 * Handles the response interceptor.
 */
api.interceptors.response.use(
  (response) => {
    logResponse(response);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          {},
          {
            withCredentials: true,
          }
        );

        const { token } = response.data;
        localStorage.setItem("token", token);

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        originalRequest.headers["Authorization"] = `Bearer ${token}`;

        processQueue(null, token);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Clear stored credentials and redirect to login
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    logError(error);
    return Promise.reject(error);
  }
);

export default api;

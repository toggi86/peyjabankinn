// src/api/client.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://peyjabanki.com/api/",
  withCredentials: true,
});


// ------- REQUEST: Attach Access Token -------
api.interceptors.request.use(config => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ------- RESPONSE: Auto Refresh Access Token on Expiry -------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => {
    error ? p.reject(error) : p.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,

  async (error) => {
    const originalRequest = error.config;

    // If unauthorized & we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return Promise.reject(error); // no refresh stored

      try {
        if (isRefreshing) {
          // queue requests while token is refreshing
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        isRefreshing = true;

        // Request new access token
        const res = await axios.post("http://localhost:8000/api/auth/refresh/", {
          refresh: refreshToken,
        });

        const newAccess = res.data.access;
        localStorage.setItem("accessToken", newAccess);

        api.defaults.headers.Authorization = `Bearer ${newAccess}`;
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        processQueue(null, newAccess);

        return api(originalRequest); // 🔥 retry request automatically

      } catch (refreshErr) {
        processQueue(refreshErr, null);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login"; // token fully invalid

        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

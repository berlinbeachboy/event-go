import axios from 'axios';
import { useToast } from "@/hooks/use-toast"

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api', // Base URL for your backend
  withCredentials: true, // Include cookies in requests
});

// Interceptor to attach Authorization header with each request
axiosInstance.interceptors.request.use((config) => {
  const jwt = document.cookie; // Example: Retrieve JWT from cookies
  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`;
  }
  return config;
});

axios.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response;
}, function (error) {

  const { toast } = useToast()
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  toast({
    title: "Mist, da hat was nicht geklappt.",
    description: String(error),
  })
  return Promise.reject(error);
});


export default axiosInstance;
import axios from "axios"

// Create API instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Always include credentials (cookies) with requests
  withCredentials: true
})

// Helper function to get API instance
export const getAuthorizedApi = () => {
  return api;
} 
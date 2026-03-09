import api from "./axios";

export const login = (data) => {
  return api.post("/login", data);
};

export const register = (data) => {
  return api.post("/register", data);
};
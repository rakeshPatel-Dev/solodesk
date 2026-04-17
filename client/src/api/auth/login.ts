import axiosInstance from "@/lib/axios";

// function to login user 
export const login = async (email: string, password: string) => {

  const response = await axiosInstance.post("/auth/login", { email, password });
  return response.data;

}

// function to logout user
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
}

// function to register user
export const register = async (name: string, email: string, password: string) => {
  const response = await axiosInstance.post("/auth/register", { name, email, password });
  return response.data;
}

// function to get current user
export const getMe = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
}

// function to forgot password
export const forgotPassword = async (email: string) => {
  const response = await axiosInstance.post("/auth/forgot-password", { email });
  return response.data;
}

// function to reset password
export const resetPassword = async (resetToken: string, password: string) => {
  const response = await axiosInstance.post(`/auth/reset-password/${resetToken}`, { password });
  return response.data;
}

// function to change password
export const changePassword = async (currentPassword: string, newPassword: string) => {
  const response = await axiosInstance.put("/auth/change-password", { currentPassword, newPassword });
  return response.data;
}

// function to deactivate account
export const deactivateAccount = async () => {
  const response = await axiosInstance.put("/auth/deactivate-account");
  return response.data;
}


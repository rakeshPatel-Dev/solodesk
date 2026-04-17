
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { clearAuthStorage, readAuthStorage, type AuthUser } from "@/store/authStorage"

type AuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
}

const storedAuth = readAuthStorage()

const initialState: AuthState = {
  user: storedAuth?.user ?? null,
  isAuthenticated: Boolean(storedAuth?.user),
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: AuthUser }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      clearAuthStorage()
    },
  },
});

export const { login, logout } = authSlice.actions;
export type { AuthState }
export default authSlice.reducer;

import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
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


export const logoutAndClearStorage = createAsyncThunk(
  "auth/logoutAndClearStorage",
  async (_, { dispatch }) => {
    clearAuthStorage()
    dispatch(logout())
  }
)

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
    },
  },
});

export const { login, logout } = authSlice.actions;
export type { AuthState }
export default authSlice.reducer;
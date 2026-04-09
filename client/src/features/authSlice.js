// /Users/karthikgouda/Desktop/TravelDesk/client/src/features/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const loginUser = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data.data.user;
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed';
    return thunkAPI.rejectWithValue(message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data.data.user;
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Registration failed';
    return thunkAPI.rejectWithValue(message);
  }
});

export const getMe = createAsyncThunk('auth/me', async (_, thunkAPI) => {
  try {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  } catch (error) {
    // Session expired or no token
    return thunkAPI.rejectWithValue('Not authenticated');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  await api.post('/auth/logout');
  return null;
});

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // starts true for initial app load checking getMe
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // getMe
    builder.addCase(getMe.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getMe.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    });
    builder.addCase(getMe.rejected, (state, action) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      // We don't bubble 'Not authenticated' as an explicit user visible error on load
    });

    // login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    
    // logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    });
  },
});

export default authSlice.reducer;

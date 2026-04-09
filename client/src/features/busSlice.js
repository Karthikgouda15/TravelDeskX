// /Users/karthikgouda/Desktop/TravelDesk/client/src/features/busSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/transport/search';

export const getBuses = createAsyncThunk(
  'buses/getBuses',
  async (filters, thunkAPI) => {
    try {
      const { origin, destination, date } = filters;
      const response = await axios.get(`${API_URL}?category=bus&origin=${origin}&destination=${destination}&date=${date}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const busSlice = createSlice({
  name: 'buses',
  initialState: {
    results: [],
    isLoading: false,
    isError: false,
    message: '',
    selectedBus: null,
    filters: { origin: '', destination: '', date: '' },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetBusState: (state) => {
      state.results = [];
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
    setSelectedBus: (state, action) => {
      state.selectedBus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBuses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBuses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload;
      })
      .addCase(getBuses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetBusState, setSelectedBus, setFilters } = busSlice.actions;
export default busSlice.reducer;

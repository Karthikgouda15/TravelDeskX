// /Users/karthikgouda/Desktop/TravelDesk/client/src/features/trainSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/transport/search';

export const getTrains = createAsyncThunk(
  'trains/getTrains',
  async (filters, thunkAPI) => {
    try {
      const { origin, destination, date } = filters;
      const response = await axios.get(`${API_URL}?category=train&origin=${origin}&destination=${destination}&date=${date}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const trainSlice = createSlice({
  name: 'trains',
  initialState: {
    results: [],
    isLoading: false,
    isError: false,
    message: '',
    selectedTrain: null,
    filters: { origin: '', destination: '', date: '' },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetTrainState: (state) => {
      state.results = [];
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
    setSelectedTrain: (state, action) => {
      state.selectedTrain = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTrains.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrains.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload;
      })
      .addCase(getTrains.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetTrainState, setSelectedTrain, setFilters } = trainSlice.actions;
export default trainSlice.reducer;

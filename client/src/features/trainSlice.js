// /Users/karthikgouda/Desktop/TravelDesk/client/src/features/trainSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async Thunks
export const searchTrains = createAsyncThunk(
  'trains/search',
  async (filters, thunkAPI) => {
    try {
      const { origin, destination, date, coachClass } = filters;
      let url = `/trains/search?origin=${origin}&destination=${destination}&date=${date}`;
      if (coachClass && coachClass !== 'All') url += `&coachClass=${coachClass}`;
      
      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const getPopularTrainRoutes = createAsyncThunk(
  'trains/popular',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/trains/popular-routes');
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch popular routes');
    }
  }
);

export const getPNRStatus = createAsyncThunk(
  'trains/pnr',
  async (pnr, thunkAPI) => {
    try {
      const response = await api.get(`/trains/pnr/${pnr}`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'PNR fetch failed');
    }
  }
);

export const getLiveTrainStatus = createAsyncThunk(
  'trains/status',
  async (trainNumber, thunkAPI) => {
    try {
      const response = await api.get(`/trains/${trainNumber}/status`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Status fetch failed');
    }
  }
);

const initialState = {
  results: [],
  popularRoutes: [],
  pnrStatus: null,
  liveStatus: null,
  isLoading: false,
  isPopularLoading: false,
  isToolLoading: false,
  error: null,
  filters: {
    origin: '',
    destination: '',
    date: '',
    coachClass: 'All',
    sortBy: 'departure-asc',
    trainType: 'All'
  },
  selectedTrain: null,
};

const trainSlice = createSlice({
  name: 'trains',
  initialState,
  reducers: {
    setTrainFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedTrain: (state, action) => {
      state.selectedTrain = action.payload;
    },
    clearTrainTools: (state) => {
      state.pnrStatus = null;
      state.liveStatus = null;
    },
    updateTrainRealTime: (state, action) => {
      const { trainId, classType, availableSeats } = action.payload;
      const train = state.results.find(t => t._id === trainId);
      if (train) {
        const coach = train.classes.find(c => c.type === classType);
        if (coach) coach.availableSeats = availableSeats;
      }
    },
    resetTrainState: (state) => {
      state.results = [];
      state.error = null;
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Search
      .addCase(searchTrains.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchTrains.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload;
      })
      .addCase(searchTrains.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Popular Routes
      .addCase(getPopularTrainRoutes.pending, (state) => {
        state.isPopularLoading = true;
      })
      .addCase(getPopularTrainRoutes.fulfilled, (state, action) => {
        state.isPopularLoading = false;
        state.popularRoutes = action.payload;
      })
      // PNR Status
      .addCase(getPNRStatus.pending, (state) => {
        state.isToolLoading = true;
      })
      .addCase(getPNRStatus.fulfilled, (state, action) => {
        state.isToolLoading = false;
        state.pnrStatus = action.payload;
      })
      .addCase(getPNRStatus.rejected, (state, action) => {
        state.isToolLoading = false;
        state.error = action.payload;
      })
      // Live Status
      .addCase(getLiveTrainStatus.pending, (state) => {
        state.isToolLoading = true;
      })
      .addCase(getLiveTrainStatus.fulfilled, (state, action) => {
        state.isToolLoading = false;
        state.liveStatus = action.payload;
      });
  },
});

export const { setTrainFilters, setSelectedTrain, clearTrainTools, updateTrainRealTime, resetTrainState } = trainSlice.actions;
export default trainSlice.reducer;

// /Users/karthikgouda/Desktop/TravelDesk/client/src/features/busSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async Thunks
export const searchBuses = createAsyncThunk(
  'buses/search',
  async (filters, thunkAPI) => {
    try {
      const { origin, destination, date, busType, amenity } = filters;
      let url = `/buses/search?origin=${origin}&destination=${destination}&date=${date}`;
      if (busType && busType !== 'All') url += `&busType=${busType}`;
      if (amenity && amenity !== 'All') url += `&amenity=${amenity}`;
      
      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Bus search failed');
    }
  }
);

export const getBusCities = createAsyncThunk(
  'buses/cities',
  async (query, thunkAPI) => {
    try {
      const response = await api.get(`/buses/cities?q=${query}`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue('Failed to fetch cities');
    }
  }
);

const initialState = {
  results: [],
  cities: [],
  isLoading: false,
  isCityLoading: false,
  error: null,
  filters: {
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    busType: 'All',
    amenity: 'All',
    sortBy: 'price-asc'
  },
  selectedBus: null,
};

const busSlice = createSlice({
  name: 'buses',
  initialState,
  reducers: {
    setBusFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedBus: (state, action) => {
      state.selectedBus = action.payload;
    },
    updateBusRealTime: (state, action) => {
      const { busId, availableSeats, bookedSeats } = action.payload;
      const bus = state.results.find(b => b._id === busId);
      if (bus) {
        bus.availableSeats = availableSeats;
        bus.bookedSeats = bookedSeats;
      }
    },
    resetBusState: (state) => {
      state.results = [];
      state.error = null;
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBuses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchBuses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload;
      })
      .addCase(searchBuses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getBusCities.pending, (state) => {
        state.isCityLoading = true;
      })
      .addCase(getBusCities.fulfilled, (state, action) => {
        state.isCityLoading = false;
        state.cities = action.payload;
      });
  },
});

export const { setBusFilters, setSelectedBus, updateBusRealTime, resetBusState } = busSlice.actions;
export default busSlice.reducer;

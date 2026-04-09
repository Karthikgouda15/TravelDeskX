// src/features/analyticsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchAnalytics = createAsyncThunk('analytics/fetch', async (days = 30, thunkAPI) => {
  try {
    const [bookings, revenue, destinations, occupancy, status] = await Promise.all([
      api.get('/analytics/bookings', { params: { days } }),
      api.get('/analytics/revenue'),
      api.get('/analytics/destinations'),
      api.get('/analytics/occupancy'),
      api.get('/analytics/status-breakdown'),
    ]);

    return {
      bookings: bookings.data.data,
      revenue: revenue.data.data,
      destinations: destinations.data.data,
      occupancy: occupancy.data.data,
      status: status.data.data,
    };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    data: {
      bookings: [],
      revenue: [],
      destinations: [],
      occupancy: [],
      status: [],
    },
    days: 30,
    isLoading: false,
    error: null,
  },
  reducers: {
    setDays: (state, action) => {
      state.days = action.payload;
    },
    updateRealtimeOccupancy: (state, action) => {
      const { hotelId, roomId, status } = action.payload;
      const hIdx = state.data.occupancy.findIndex(h => h.hotelId === hotelId);
      if (hIdx !== -1) {
        // Simple mock of updating occupancy rate in place for demonstration
        const occupiedInc = status === 'booked' ? 1 : -1;
        const total = state.data.occupancy[hIdx].totalRooms;
        const currentRate = state.data.occupancy[hIdx].occupancyRate;
        const occupiedCount = Math.round((currentRate / 100) * total);
        const newRate = ((occupiedCount + occupiedInc) / total) * 100;
        state.data.occupancy[hIdx].occupancyRate = Math.min(100, Math.max(0, newRate));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setDays, updateRealtimeOccupancy } = analyticsSlice.actions;
export default analyticsSlice.reducer;

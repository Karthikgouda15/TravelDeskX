// src/features/itinerarySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const getMyItineraries = createAsyncThunk('itineraries/getMyItineraries', async (params, thunkAPI) => {
  try {
    const response = await api.get('/itineraries/my', { params });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch itineraries');
  }
});

export const saveItinerary = createAsyncThunk('itineraries/save', async (data, thunkAPI) => {
  try {
    const response = await api.post('/itineraries', data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to save itinerary');
  }
});

export const deleteItinerary = createAsyncThunk('itineraries/delete', async (id, thunkAPI) => {
  try {
    await api.delete(`/itineraries/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete itinerary');
  }
});

const initialState = {
  savedItineraries: [],
  currentItinerary: {
    title: '',
    destination: '',
    dateRange: { startDate: '', endDate: '' },
    flights: [],
    hotels: [],
    activities: [],
  },
  isLoading: false,
  error: null,
};

const itinerarySlice = createSlice({
  name: 'itineraries',
  initialState,
  reducers: {
    updateCurrentItinerary: (state, action) => {
      state.currentItinerary = { ...state.currentItinerary, ...action.payload };
    },
    addFlightToItinerary: (state, action) => {
      state.currentItinerary.flights.push(action.payload);
    },
    addHotelToItinerary: (state, action) => {
      state.currentItinerary.hotels.push(action.payload);
    },
    addActivity: (state, action) => {
      state.currentItinerary.activities.push(action.payload);
    },
    resetCurrentItinerary: (state) => {
      state.currentItinerary = initialState.currentItinerary;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyItineraries.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyItineraries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedItineraries = action.payload.data;
      })
      .addCase(getMyItineraries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteItinerary.fulfilled, (state, action) => {
        state.savedItineraries = state.savedItineraries.filter(i => i._id !== action.payload);
      });
  },
});

export const { updateCurrentItinerary, addFlightToItinerary, addHotelToItinerary, addActivity, resetCurrentItinerary } = itinerarySlice.actions;
export default itinerarySlice.reducer;

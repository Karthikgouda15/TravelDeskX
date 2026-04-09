// src/features/hotelSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const getHotels = createAsyncThunk('hotels/getHotels', async (params, thunkAPI) => {
  try {
    const response = await api.get('/hotels', { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch hotels';
    return thunkAPI.rejectWithValue(message);
  }
});

export const getHotelById = createAsyncThunk('hotels/getHotelById', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/hotels/${id}`);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Hotel not found');
  }
});

const hotelSlice = createSlice({
  name: 'hotels',
  initialState: {
    results: [],
    pagination: null,
    selectedHotel: null,
    selectedRoom: null,
    filters: {
      city: '',
      country: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      priceMin: 0,
      priceMax: 1000,
      starRating: null,
      amenities: [],
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedHotel: (state, action) => {
      state.selectedHotel = action.payload;
    },
    setSelectedRoom: (state, action) => {
      state.selectedRoom = action.payload;
    },
    updateRoomAvailability: (state, action) => {
      const { hotelId, roomId, status } = action.payload;
      // Update in results list if present
      const hIdx = state.results.findIndex(h => h._id === hotelId);
      if (hIdx !== -1 && state.results[hIdx].rooms) {
         const rIdx = state.results[hIdx].rooms.findIndex(r => r._id === roomId);
         if (rIdx !== -1) {
            state.results[hIdx].rooms[rIdx].status = status;
         }
      }
      // Update selected hotel rooms if it is the one being viewed
      if (state.selectedHotel && state.selectedHotel._id === hotelId) {
        const rIdx = state.selectedHotel.rooms.findIndex(r => r._id === roomId);
        if (rIdx !== -1) {
          state.selectedHotel.rooms[rIdx].status = status;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getHotels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getHotels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getHotels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getHotelById.fulfilled, (state, action) => {
        state.selectedHotel = action.payload;
      });
  },
});

export const { setFilters, setSelectedHotel, setSelectedRoom, updateRoomAvailability } = hotelSlice.actions;
export default hotelSlice.reducer;

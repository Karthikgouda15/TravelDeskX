// src/features/bookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const getMyBookings = createAsyncThunk('bookings/getMyBookings', async (params, thunkAPI) => {
  try {
    const response = await api.get('/bookings/my', { params });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
  }
});

export const createFlightBooking = createAsyncThunk('bookings/createFlight', async (bookingData, thunkAPI) => {
  try {
    const response = await api.post('/bookings/flight', bookingData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Booking failed');
  }
});

export const createHotelBooking = createAsyncThunk('bookings/createHotel', async (bookingData, thunkAPI) => {
  try {
    const response = await api.post('/bookings/hotel', bookingData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Booking failed');
  }
});

export const createTrainBooking = createAsyncThunk('bookings/createTrain', async (bookingData, thunkAPI) => {
  try {
    const response = await api.post('/bookings/train', bookingData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Train booking failed');
  }
});

export const createBusBooking = createAsyncThunk('bookings/createBus', async (bookingData, thunkAPI) => {
  try {
    const response = await api.post('/bookings/bus', bookingData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Bus booking failed');
  }
});

export const cancelBooking = createAsyncThunk('bookings/cancel', async (id, thunkAPI) => {
  try {
    const response = await api.patch(`/bookings/${id}/cancel`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Cancellation failed');
  }
});

const initialState = {
  myBookings: [],
  pagination: null,
  checkout: {
    currentStep: 1,
    flight: null,
    hotel: null,
    train: null,
    bus: null,
    type: null,
    item: null, // Generalized item for summary
    selectedSeats: [],
    selectedRoom: null,
    classType: null,
    passengerInfo: {
      name: '',
      email: '',
      phone: '',
      passportNumber: '',
    },
    totalPrice: 0,
    bookingResponse: null,
  },
  isLoading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.checkout.currentStep = action.payload;
    },
    updatePassengerInfo: (state, action) => {
      state.checkout.passengerInfo = { ...state.checkout.passengerInfo, ...action.payload };
    },
    clearCheckout: (state) => {
      state.checkout = initialState.checkout;
    },
    setCheckoutData: (state, action) => {
      const type = action.payload.flight ? 'flight' 
                 : action.payload.hotel ? 'hotel' 
                 : action.payload.train ? 'train' 
                 : action.payload.bus ? 'bus' 
                 : state.checkout.type;
      
      const item = action.payload.flight || action.payload.hotel || action.payload.train || action.payload.bus || state.checkout.item;

      state.checkout = { 
        ...state.checkout, 
        ...action.payload,
        type,
        item
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myBookings = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(createFlightBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.checkout.bookingResponse = action.payload;
        state.checkout.currentStep = 3;
      })
      .addCase(createHotelBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.checkout.bookingResponse = action.payload;
        state.checkout.currentStep = 3;
      })
      .addCase(createTrainBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.checkout.bookingResponse = action.payload;
        state.checkout.currentStep = 3;
      })
      .addCase(createBusBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.checkout.bookingResponse = action.payload;
        state.checkout.currentStep = 3;
      })
      // Generic pending handler
      .addMatcher(
        (action) => action.type.endsWith('/pending') && action.type.startsWith('bookings/'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      // Generic rejected handler
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && action.type.startsWith('bookings/'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'An unexpected error occurred';
        }
      );
  },
});

export const { setStep, updatePassengerInfo, clearCheckout, setCheckoutData } = bookingSlice.actions;
export default bookingSlice.reducer;

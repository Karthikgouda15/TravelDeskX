// src/features/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import flightReducer from './flightSlice';
import hotelReducer from './hotelSlice';
import bookingReducer from './bookingSlice';
import itineraryReducer from './itinerarySlice';
import analyticsReducer from './analyticsSlice';
import trainReducer from './trainSlice';
import busReducer from './busSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    flights: flightReducer,
    hotels: hotelReducer,
    bookings: bookingReducer,
    itineraries: itineraryReducer,
    analytics: analyticsReducer,
    trains: trainReducer,
    buses: busReducer,
  },
});

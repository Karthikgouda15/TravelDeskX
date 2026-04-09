// src/features/flightSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// ─── Async Thunks ───────────────────────────────────────────────────────────

export const getFlights = createAsyncThunk('flights/getFlights', async (params, thunkAPI) => {
  try {
    // Flatten array filters to comma-separated strings for the API
    const query = { ...params };
    if (Array.isArray(query.airlines) && query.airlines.length > 0) {
      query.airline = query.airlines.join(',');
    }
    delete query.airlines;

    // stops: send the first selected stops filter (API supports one value)
    if (Array.isArray(query.stops) && query.stops.length > 0) {
      query.stops = query.stops[0]; // send the most restrictive first
    } else if (Array.isArray(query.stops)) {
      delete query.stops;
    }

    // departureSlots: send first slot only (API supports one)
    if (Array.isArray(query.departureSlots) && query.departureSlots.length > 0) {
      query.departureTimeSlot = query.departureSlots[0];
    }
    delete query.departureSlots;

    // priceMax → API expects priceMax
    if (query.priceMax && query.priceMax < 150000) {
      // keep as-is
    } else {
      delete query.priceMax;
    }

    const response = await api.get('/flights', { params: query });
    return response.data; // { success, count, data, recommendations }
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch flights';
    return thunkAPI.rejectWithValue(message);
  }
});

export const getFlightById = createAsyncThunk('flights/getFlightById', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/flights/${id}`);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Flight not found');
  }
});

export const getPriceTrend = createAsyncThunk('flights/getPriceTrend', async ({ origin, destination }, thunkAPI) => {
  try {
    const response = await api.get('/flights/price-trend', { params: { origin, destination } });
    return response.data.data; // Array<{ date, minPrice }>
  } catch {
    return thunkAPI.rejectWithValue('Could not load price trend');
  }
});

// ─── Slice ───────────────────────────────────────────────────────────────────

const flightSlice = createSlice({
  name: 'flights',
  initialState: {
    results: [],
    recommendations: [],
    priceTrend: [],
    pagination: null,
    selectedFlight: null,
    selectedSeat: null,
    filters: {
      origin: '',
      destination: '',
      date: '',
      passengers: 1,
      cabinClass: 'economy',
      tripType: 'one-way',       // 'one-way' | 'round-trip' | 'multi-city'
      returnDate: '',
      fareType: 'regular',       // 'regular' | 'student' | 'armed-forces' | 'senior'
      priceMax: 150000,
      airlines: [],              // string[]
      stops: [],                 // ('0'|'1'|'2+')[]
      departureSlots: [],        // ('morning'|'afternoon'|'evening'|'night')[]
      maxDuration: null,
      sortBy: 'price-asc',       // 'price-asc'|'price-desc'|'duration-asc'|'departure-asc'|'arrival-asc'
    },
    isLoading: false,
    isPriceTrendLoading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      // Use per-key mutation so Immer only marks changed fields as dirty.
      // This keeps array references stable (stops, airlines, etc.) when not changed,
      // preventing useEffect infinite loops caused by reference inequality.
      Object.keys(action.payload).forEach((key) => {
        state.filters[key] = action.payload[key];
      });
    },
    setRecommendations: (state, action) => {
      state.recommendations = action.payload;
    },
    setSelectedFlight: (state, action) => {
      state.selectedFlight = action.payload;
    },
    setSelectedSeat: (state, action) => {
      state.selectedSeat = action.payload;
    },
    updateFlightRealTime: (state, action) => {
      const { flightId, availableSeats, status, price } = action.payload;
      const updateInList = (list) => {
        const index = list.findIndex(f => f._id === flightId);
        if (index !== -1) {
          if (availableSeats !== undefined) list[index].availableSeats = availableSeats;
          if (status !== undefined)        list[index].status = status;
          if (price !== undefined)         list[index].price = price;
        }
      };
      updateInList(state.results);
      updateInList(state.recommendations);
      if (state.selectedFlight?._id === flightId) {
        if (availableSeats !== undefined) state.selectedFlight.availableSeats = availableSeats;
        if (status !== undefined)         state.selectedFlight.status = status;
        if (price !== undefined)          state.selectedFlight.price = price;
      }
    },
    resetFlightState: (state) => {
      state.selectedFlight = null;
      state.selectedSeat = null;
      state.recommendations = [];
      state.priceTrend = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // getFlights
      .addCase(getFlights.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.recommendations = [];
      })
      .addCase(getFlights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload.data || [];
        state.recommendations = action.payload.recommendations || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(getFlights.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // getPriceTrend
      .addCase(getPriceTrend.pending, (state) => {
        state.isPriceTrendLoading = true;
      })
      .addCase(getPriceTrend.fulfilled, (state, action) => {
        state.isPriceTrendLoading = false;
        state.priceTrend = action.payload || [];
      })
      .addCase(getPriceTrend.rejected, (state) => {
        state.isPriceTrendLoading = false;
        state.priceTrend = [];
      });
  },
});

export const {
  setFilters,
  setRecommendations,
  setSelectedFlight,
  setSelectedSeat,
  updateFlightRealTime,
  resetFlightState,
} = flightSlice.actions;

export default flightSlice.reducer;

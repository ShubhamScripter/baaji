import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../utils/axiosConfig";

// Async thunk to fetch cricket data

export const fetchCricketData = createAsyncThunk(
  "cricket/fetchCricketData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/cricket/matches"); // Your backend API
      console.log("responce", response);


      return response.data.matches;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    }
  }
);

export const fetchCricketInplayData = createAsyncThunk(
  "cricket/fetchCricketInplayData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/cricket/matches");
      return response.data.matches;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch in-play matches"
      );
    }
  }
);

export const fetchCricketBatingData = createAsyncThunk(
  "cricket/fetchCricketBatingData",
  async (gameid, { rejectWithValue }) => {

    try {
      const response = await api.get(`/cricket/betting?gameid=${gameid}`); // Your backend API
      // console.log("betting response", response);
      return response.data.data.result;
      
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    }
  }
);

// Slice
const cricketSlice = createSlice({
  name: "cricket",
  initialState: {
    matches: [],
    inplayMatches: [],
    battingData: [],
    loader: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCricketData.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchCricketData.fulfilled, (state, action) => {
        state.loader = false;
        state.matches = action.payload;
      })
      .addCase(fetchCricketData.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })
      .addCase(fetchCricketInplayData.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchCricketInplayData.fulfilled, (state, action) => {
        state.loader = false;
        state.inplayMatches = action.payload;
      })
      .addCase(fetchCricketInplayData.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })
      .addCase(fetchCricketBatingData.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchCricketBatingData.fulfilled, (state, action) => {
        state.loader = false;
        state.battingData = action.payload;
      })
      .addCase(fetchCricketBatingData.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      });
  },
});

export default cricketSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
import api from "../../utils/axiosConfig"; // Adjust the import based on your project structure


export const fetchSoccerData = createAsyncThunk(
  "soccer/fetchSoccerData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/soccer"); // Your backend API

      console.log("response", response);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    }
  }
);
export const fetchSoccerInplayData = createAsyncThunk(
  "soccer/fetchSoccerInplayData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/soccer/inplay");
      return response.data.matches;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch in-play matches"
      );
    }
  }
);
export const fetchSoccerBatingData = createAsyncThunk(
  "cricket/fetchSoccerBatingData",
  async (gameid, { rejectWithValue }) => {
    try {
      const response = await api.get(`/soccer/betting?gameid=${gameid}`); // Your backend API
      console.log("response", response.data);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    }
  }
);


// Create the slice
const soccerSlice = createSlice({
  name: "soccer",
  initialState: {
    soccerLoading: null,
    soccerError: null,
    soccerData: [],
    soccerInplayData: [],
    battingData: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSoccerData.pending, (state) => {
        state.soccerLoading = true;
        state.soccerError = null;
      })
      .addCase(fetchSoccerData.fulfilled, (state, action) => {
        state.soccerLoading = false;
        state.soccerData = action.payload;
      })
      .addCase(fetchSoccerData.rejected, (state, action) => {
        state.soccerLoading = false;
        state.soccerError = action.error.message;
      })
      .addCase(fetchSoccerInplayData.pending, (state) => {
        state.soccerLoading = true;
        state.soccerError = null;
      })
      .addCase(fetchSoccerInplayData.fulfilled, (state, action) => {
        state.soccerLoading = false;
        state.soccerInplayData = action.payload;
      })
      .addCase(fetchSoccerInplayData.rejected, (state, action) => {
        state.soccerLoading = false;
        state.soccerError = action.payload;
      })
      .addCase(fetchSoccerBatingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSoccerBatingData.fulfilled, (state, action) => {
        state.loading = false;
        state.battingData = action.payload.data;
      })
      .addCase(fetchSoccerBatingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default soccerSlice.reducer;

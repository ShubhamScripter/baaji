import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
import api from "../../utils/axiosConfig"; // Adjust the import based on your project structure

export const fetchTennisData = createAsyncThunk(
  "tennis/fetchTennisData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/tennis"); // Your backend API

      console.log("response", response);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    }
  }
);

export const fetchTennisInplayData = createAsyncThunk(
  "tennis/fetchTennisInplayData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/tennis");
      return response.data.matches;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch in-play matches"
      );
    }
  }
);

export const fetchTannisBatingData = createAsyncThunk(
  "cricket/fetchTannisBatingData",
  async (gameid, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tannis/betting?gameid=${gameid}`); // Your backend API
      // Match cricket pattern: return response.data.data.result
      return response.data.data.result;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    }
  }
);

// Create the slice
const tennisSlice = createSlice({
  name: "tennis",
  initialState: {
    data: [],
    inplayData: [],
    battingData: [],
    loading: false,
    tesnnisError: null,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTennisData.pending, (state) => {
        state.loading = true;
        state.tesnnisError = null;
      })
      .addCase(fetchTennisData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTennisData.rejected, (state, action) => {
        state.loading = false;
        state.tesnnisError = action.error.message;
      })
      .addCase(fetchTennisInplayData.pending, (state) => {
        state.loading = true;
        state.tesnnisError = null;
      })
      .addCase(fetchTennisInplayData.fulfilled, (state, action) => {
        state.loading = false;
        state.inplayData = action.payload;
      })
      .addCase(fetchTennisInplayData.rejected, (state, action) => {
        state.loading = false;
        state.tesnnisError = action.payload;
      })
      .addCase(fetchTannisBatingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTannisBatingData.fulfilled, (state, action) => {
        state.loading = false;
        state.battingData = action.payload; // Match cricket pattern: use payload directly
      })
      // .addCase(fetchTannisBatingData.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.battingData = action.payload;        // use the array returned by the thunk
      // })
      .addCase(fetchTannisBatingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default tennisSlice.reducer;

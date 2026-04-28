import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

export const fetchTopMatchedPlayers = createAsyncThunk(
  'risk/fetchTopMatchedPlayers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/admin/risk/top-matched-players');
      return data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch top matched players'
      );
    }
  }
);

export const fetchTopExposurePlayers = createAsyncThunk(
  'risk/fetchTopExposurePlayers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/admin/risk/top-exposure-players');
      return data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch top exposure players'
      );
    }
  }
);

export const fetchMatchOddsSummary = createAsyncThunk(
  'risk/fetchMatchOddsSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/admin/risk/match-odds-summary', {
        params: { gameType: 'Match Odds', ...params },
      });
      return data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch match odds summary'
      );
    }
  }
);

export const fetchBookmakerSummary = createAsyncThunk(
  'risk/fetchBookmakerSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/admin/risk/match-odds-summary', {
        params: { gameType: 'Bookmaker', ...params },
      });
      return data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch bookmaker summary'
      );
    }
  }
);
export const fetchFancySummary = createAsyncThunk(
  'risk/fetchFancySummary',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/admin/risk/fancy-summary');
      return data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch fancy summary'
      );
    }
  }
);
const riskSlice = createSlice({
  name: 'risk',
  initialState: {
    matched: [],
    exposure: [],
    matchOdds: [],
    matchOddsLoading: false,
    matchOddsError: null,
    bookmaker: [],
    bookmakerLoading: false,
    bookmakerError: null,
    fancy: [],
    fancyLoading: false,
    fancyError: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopMatchedPlayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopMatchedPlayers.fulfilled, (state, action) => {
        state.loading = false;
        state.matched = action.payload;
      })
      .addCase(fetchTopMatchedPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchTopExposurePlayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopExposurePlayers.fulfilled, (state, action) => {
        state.loading = false;
        state.exposure = action.payload;
      })
      .addCase(fetchTopExposurePlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchMatchOddsSummary.pending, (state) => {
        state.matchOddsLoading = true;
        state.matchOddsError = null;
      })
      .addCase(fetchMatchOddsSummary.fulfilled, (state, action) => {
        state.matchOddsLoading = false;
        state.matchOdds = action.payload;
      })
      .addCase(fetchMatchOddsSummary.rejected, (state, action) => {
        state.matchOddsLoading = false;
        state.matchOddsError = action.payload;
      })

      .addCase(fetchBookmakerSummary.pending, (state) => {
        state.bookmakerLoading = true;
        state.bookmakerError = null;
      })
      .addCase(fetchBookmakerSummary.fulfilled, (state, action) => {
        state.bookmakerLoading = false;
        state.bookmaker = action.payload;
      })
      .addCase(fetchBookmakerSummary.rejected, (state, action) => {
        state.bookmakerLoading = false;
        state.bookmakerError = action.payload;
      })

      .addCase(fetchFancySummary.pending, (state) => {
        state.fancyLoading = true;
        state.fancyError = null;
      })
      .addCase(fetchFancySummary.fulfilled, (state, action) => {
        state.fancyLoading = false;
        state.fancy = action.payload;
      })
      .addCase(fetchFancySummary.rejected, (state, action) => {
        state.fancyLoading = false;
        state.fancyError = action.payload;
      });
  },
});

export default riskSlice.reducer;

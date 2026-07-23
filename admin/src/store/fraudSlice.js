import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from '../utils/axiosInstance';

const rejectMessage = (err) =>
  err.response?.data?.message || err.message || 'Request failed';

export const fetchFraudSummary = createAsyncThunk(
  'fraud/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/fraud/summary');
      return data.data;
    } catch (err) {
      return rejectWithValue(rejectMessage(err));
    }
  }
);

export const fetchFraudClusters = createAsyncThunk(
  'fraud/fetchClusters',
  async ({ search = '', status = 'all' } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/fraud/clusters', {
        params: { search, status },
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(rejectMessage(err));
    }
  }
);

export const fetchClusterDetail = createAsyncThunk(
  'fraud/fetchClusterDetail',
  async (clusterId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/fraud/clusters/${clusterId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(rejectMessage(err));
    }
  }
);

export const acknowledgeCluster = createAsyncThunk(
  'fraud/acknowledge',
  async (clusterId, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `/fraud/clusters/${clusterId}/acknowledge`
      );
      return data.data;
    } catch (err) {
      return rejectWithValue(rejectMessage(err));
    }
  }
);

export const dismissCluster = createAsyncThunk(
  'fraud/dismiss',
  async (clusterId, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`/fraud/clusters/${clusterId}/dismiss`);
      return data.data;
    } catch (err) {
      return rejectWithValue(rejectMessage(err));
    }
  }
);

export const updateAccountStatus = createAsyncThunk(
  'fraud/updateAccountStatus',
  async ({ userId, status, remark }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`/fraud/accounts/${userId}/status`, {
        status,
        remark,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(rejectMessage(err));
    }
  }
);

export const rescanClusters = createAsyncThunk(
  'fraud/rescan',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/fraud/rescan');
      return data;
    } catch (err) {
      return rejectWithValue(rejectMessage(err));
    }
  }
);

const initialState = {
  summary: null,
  clusters: [],
  detail: null,
  // Alerts pushed over the WebSocket since the page was opened.
  liveAlerts: [],
  bannerDismissed: false,
  loading: false,
  detailLoading: false,
  error: null,
};

const fraudSlice = createSlice({
  name: 'fraud',
  initialState,
  reducers: {
    // Called by the socket listener when the backend pushes `fraudAlert`.
    fraudAlertReceived(state, action) {
      const alert = action.payload;
      const seen = state.liveAlerts.some(
        (a) => a.clusterId === alert.clusterId
      );
      if (!seen) state.liveAlerts.unshift(alert);
      state.bannerDismissed = false;
      if (state.summary) {
        state.summary.unacknowledged += seen ? 0 : 1;
        state.summary.latestAlert = {
          _id: alert._id,
          clusterId: alert.clusterId,
          memberCount: alert.memberCount,
          deviceId: alert.deviceId,
          ip: alert.ip,
          detectedAt: alert.detectedAt,
        };
      }
    },
    dismissBanner(state) {
      state.bannerDismissed = true;
    },
    clearDetail(state) {
      state.detail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFraudSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(fetchFraudClusters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFraudClusters.fulfilled, (state, action) => {
        state.loading = false;
        state.clusters = action.payload;
      })
      .addCase(fetchFraudClusters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchClusterDetail.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchClusterDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchClusterDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      .addCase(updateAccountStatus.fulfilled, (state, action) => {
        const { userId, status } = action.payload;
        // Reflect the new status immediately in both the drawer and the list.
        const patch = (members) => {
          const member = members?.find((m) => m.userId === userId);
          if (member) member.status = status;
        };
        patch(state.detail?.members);
        state.clusters.forEach((c) => patch(c.members));
      });

    // Acknowledge and dismiss both clear the alert; fold them together.
    [acknowledgeCluster, dismissCluster].forEach((thunk) => {
      builder.addCase(thunk.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.clusters.findIndex((c) => c._id === updated._id);
        if (index !== -1) state.clusters[index] = updated;
        if (state.detail?._id === updated._id) {
          state.detail = { ...state.detail, ...updated };
        }
        state.liveAlerts = state.liveAlerts.filter(
          (a) => a.clusterId !== updated.clusterId
        );
        if (state.summary) {
          state.summary.unacknowledged = Math.max(
            0,
            state.summary.unacknowledged - 1
          );
          if (state.summary.latestAlert?._id === updated._id) {
            state.summary.latestAlert = null;
          }
        }
      });
    });
  },
});

export const { fraudAlertReceived, dismissBanner, clearDetail } =
  fraudSlice.actions;

export default fraudSlice.reducer;

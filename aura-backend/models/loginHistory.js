// models/loginHistory.js
import mongoose from 'mongoose';

export const loginHistorySchema = mongoose.Schema(
  {
    userName: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    dateTime: {
      type: String,
    },
    ip: {
      type: String,
    },
    isp: {
      type: String,
    },
    city: {
      type: String,
    },
    region: {
      type: String,
    },
    country: {
      type: String,
    },
    // Device fingerprint captured at login. `client` = UUID sent by the app,
    // `derived` = hash of user-agent + IP (weaker). See utils/deviceFingerprint.js
    deviceId: {
      type: String,
      default: null,
    },
    deviceSource: {
      type: String,
      enum: ['client', 'derived', null],
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Multi-account detection scans recent logins by device and by IP.
loginHistorySchema.index({ deviceId: 1, createdAt: -1 });
loginHistorySchema.index({ ip: 1, createdAt: -1 });

const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);
export default LoginHistory;

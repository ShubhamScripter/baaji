// models/userDevice.js
// One row per (account, device) pair. LoginHistory is an append-only audit log
// that also records failures and junk user ids, so grouping it on every dashboard
// load would be both slow and noisy. This collection is the deduplicated index
// the multi-account detector actually reads.

import mongoose from 'mongoose';

const userDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAdmin',
      required: true,
    },
    userName: { type: String, trim: true },
    role: { type: String },
    deviceId: { type: String, required: true },
    deviceSource: { type: String, enum: ['client', 'derived'], default: 'derived' },
    userAgent: { type: String, default: null },
    // Every distinct IP this account has used from this device.
    ips: { type: [String], default: [] },
    lastIp: { type: String, default: null },
    firstSeen: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// The upsert on every login keys off this pair, so it must be unique.
userDeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
// "which accounts share this device" / "which accounts share this IP"
userDeviceSchema.index({ deviceId: 1 });
userDeviceSchema.index({ lastIp: 1 });

const UserDevice = mongoose.model('UserDevice', userDeviceSchema);
export default UserDevice;

// models/fraudCluster.js
// A cluster = a group of 2+ player accounts linked by a shared device and/or IP.
// Persisted (rather than recomputed per request) so that "is this alert new?"
// and "has a human reviewed it?" survive restarts, and so the superadmin is
// notified exactly once per genuinely new linkage.

import mongoose from 'mongoose';

const clusterMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAdmin',
      required: true,
    },
    userName: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    lastLogin: { type: Date, default: null },
    lastIp: { type: String, default: null },
    // Denormalised so the review drawer can show status without an extra lookup.
    // Refreshed whenever the cluster is read.
    status: { type: String, default: 'active' },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const fraudClusterSchema = new mongoose.Schema(
  {
    // Human-facing reference shown in the UI, e.g. "CLS-D669".
    clusterId: { type: String, required: true, unique: true },
    // What linked these accounts. A cluster is seeded by one key but can carry
    // both signals once the members' other identifiers overlap.
    keyType: { type: String, enum: ['device', 'ip'], required: true },
    keyValue: { type: String, required: true },
    signals: { type: [String], default: [] }, // 'device' | 'ip'
    deviceIds: { type: [String], default: [] },
    ips: { type: [String], default: [] },

    members: { type: [clusterMemberSchema], default: [] },
    memberCount: { type: Number, default: 0 },

    riskScore: { type: Number, default: 0 },
    totalApprovedDeposits: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['open', 'reviewed', 'dismissed'],
      default: 'open',
      index: true,
    },
    // Unacknowledged clusters drive the sidebar badge and the red banner.
    acknowledged: { type: Boolean, default: false, index: true },
    acknowledgedAt: { type: Date, default: null },
    acknowledgedBy: { type: String, default: null },

    firstDetectedAt: { type: Date, default: Date.now },
    lastDetectedAt: { type: Date, default: Date.now },
    // Set once the realtime alert has gone out, so a restart or a repeated
    // login from an already-known device does not re-notify.
    notifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

fraudClusterSchema.index({ keyType: 1, keyValue: 1 }, { unique: true });
fraudClusterSchema.index({ lastDetectedAt: -1 });

const FraudCluster = mongoose.model('FraudCluster', fraudClusterSchema);
export default FraudCluster;

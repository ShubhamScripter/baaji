import mongoose from 'mongoose';

import subAdmin from './subAdminModel.js';

// One row per series (competition) ever seen in the provider match feed.
// Rows accumulate as the feed is polled, so series stay listed here even after
// their matches finish. `isBlocked` hides every match of the series from the
// user-facing feeds.
const seriesSchema = new mongoose.Schema(
  {
    sport: {
      type: String,
      enum: ['cricket', 'tennis', 'soccer'],
      required: true,
    },
    seriesName: {
      type: String,
      required: true,
      trim: true,
    },
    // Provider ids are per-match, so this is only a sample from the first match
    // seen for the series -- shown for reference, not used for matching.
    marketId: {
      type: String,
      default: null,
    },
    // Earliest start time seen across the series' matches.
    openDate: {
      type: Date,
      default: null,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: subAdmin,
      default: null,
    },
    blockedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Identity of a series is its name within a sport.
seriesSchema.index({ sport: 1, seriesName: 1 }, { unique: true });
// Supports the per-sport blocked-name lookup on every match-feed request.
seriesSchema.index({ sport: 1, isBlocked: 1 });

const Series = mongoose.model('Series', seriesSchema);
export default Series;

import Series from '../../models/seriesModel.js';

const SPORTS = ['cricket', 'tennis', 'soccer'];

// Only roles that can already manage match settings may block a series.
const ALLOWED_ROLES = ['superadmin', 'admin', 'subadmin'];

export const getSeriesList = async (req, res) => {
  try {
    const { sport } = req.query;

    if (sport && !SPORTS.includes(sport)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sport. Expected one of: ${SPORTS.join(', ')}`,
      });
    }

    const filter = sport ? { sport } : {};

    const series = await Series.find(filter)
      .select('sport seriesName marketId openDate isBlocked blockedAt')
      .sort({ openDate: 1, seriesName: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: series,
      total: series.length,
    });
  } catch (error) {
    console.error('Error fetching series list:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const toggleSeriesBlock = async (req, res) => {
  try {
    const { role, id } = req;

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - You don't have permission to block series",
      });
    }

    const series = await Series.findById(req.params.seriesId);
    if (!series) {
      return res
        .status(404)
        .json({ success: false, message: 'Series not found' });
    }

    series.isBlocked = !series.isBlocked;
    series.blockedBy = series.isBlocked ? id : null;
    series.blockedAt = series.isBlocked ? new Date() : null;
    await series.save();

    return res.status(200).json({
      success: true,
      message: `${series.seriesName} ${
        series.isBlocked ? 'blocked' : 'unblocked'
      }`,
      data: {
        _id: series._id,
        sport: series.sport,
        seriesName: series.seriesName,
        isBlocked: series.isBlocked,
      },
    });
  } catch (error) {
    console.error('Error toggling series block:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

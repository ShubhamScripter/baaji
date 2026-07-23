import express from 'express';

import {
  acknowledgeCluster,
  dismissCluster,
  getClusterById,
  getFraudClusters,
  getFraudSummary,
  rescanClusters,
  updateClusterAccountStatus,
} from '../../controllers/admin/fraudController.js';
import { adminAuthMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

// adminAuthMiddleware admits every staff role. Risk & Fraud is superadmin-only:
// the payloads link players across the entire downline, so an agent seeing them
// would learn exactly which of their own rings had been detected.
const requireSuperadmin = (req, res, next) => {
  if (req.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied — Risk & Fraud is restricted to superadmin',
    });
  }
  next();
};

const guard = [adminAuthMiddleware, requireSuperadmin];

router.get('/fraud/summary', guard, getFraudSummary);
router.get('/fraud/clusters', guard, getFraudClusters);
router.get('/fraud/clusters/:clusterId', guard, getClusterById);
router.post('/fraud/clusters/:clusterId/acknowledge', guard, acknowledgeCluster);
router.post('/fraud/clusters/:clusterId/dismiss', guard, dismissCluster);
router.patch('/fraud/accounts/:userId/status', guard, updateClusterAccountStatus);
router.post('/fraud/rescan', guard, rescanClusters);

export default router;

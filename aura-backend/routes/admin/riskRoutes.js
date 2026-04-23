import express from 'express';

import {
  getFancySummary,
  getMatchOddsSummary,
  getTopExposurePlayers,
  getTopMatchedAmountPlayers,
} from '../../controllers/admin/riskController.js';
import { adminAuthMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get(
  '/admin/risk/top-matched-players',
  adminAuthMiddleware,
  getTopMatchedAmountPlayers
);

router.get(
  '/admin/risk/top-exposure-players',
  adminAuthMiddleware,
  getTopExposurePlayers
);

router.get(
  '/admin/risk/match-odds-summary',
  adminAuthMiddleware,
  getMatchOddsSummary
);

router.get(
  '/admin/risk/fancy-summary',
  adminAuthMiddleware,
  getFancySummary
);

export default router;

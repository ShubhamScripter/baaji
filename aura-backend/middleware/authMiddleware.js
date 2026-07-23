import jwt from 'jsonwebtoken';

import SubAdmin from '../models/subAdminModel.js';
import { PRESENCE_WINDOW_MS } from '../utils/presence.js';

// Refresh lastActive at most once per half-window so a chatty client costs one
// write every few minutes instead of one per request. The guard lives in the
// query filter, so concurrent requests can't stampede the same document.
const touchLastActive = (userId) => {
  if (!userId) return;

  const staleBefore = new Date(Date.now() - PRESENCE_WINDOW_MS / 2);

  SubAdmin.updateOne(
    { _id: userId, $or: [{ lastActive: null }, { lastActive: { $lt: staleBefore } }] },
    { $set: { lastActive: new Date() } }
  ).catch((error) => {
    // Presence is best-effort: never fail the request it is riding along with.
    console.error('Failed to update lastActive:', error.message);
  });
};

export const authMiddleware = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.auth) {
    token = req.cookies.auth;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userRole = decodedToken.role;

    if (!userRole || userRole !== 'user') {
      return res
        .status(403)
        .json({ message: 'Access denied, Only user can access' });
    }

    req.role = decodedToken.role;
    req.user = decodedToken.user;
    req.id = decodedToken.id;

    touchLastActive(decodedToken.id);

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const adminAuthMiddleware = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.auth) {
      token = req.cookies.auth;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userRole = decodedToken.role;

    const allowedRoles = [
      'superadmin', 'admin', 'subadmin', 'seniorSuper', 'superAgent', 'agent', 'user'
    ];
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied, admin only' });
    }

    const user = await SubAdmin.findById(decodedToken.id);
    if (user.sessionToken !== decodedToken.sessionToken) {
      return res.status(401).json({
        message: 'Session expired. Please login again.',
        code: 'SESSION_EXPIRED',
      });
    }

    req.role = userRole;
    req.id = decodedToken.id;
    req.admin = decodedToken.user;

    touchLastActive(decodedToken.id);

    next();
  } catch (error) {
    console.error('Admin Auth Error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

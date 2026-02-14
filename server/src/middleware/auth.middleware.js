import { verifyAccessToken } from '../services/auth.service.js';

export function authenticate(req, res, next) {
  try {
    const accessToken = req.cookies.access_token;
    
    if (!accessToken) {
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }

    const decoded = verifyAccessToken(accessToken);
    req.user = { id: decoded.userId };
    
    next();
  } catch (error) {
    // If access token is expired, we send a 401. The frontend should intercept this,
    // call /api/auth/refresh, and retry the request.
    return res.status(401).json({ status: 'error', message: 'Token expired or invalid' });
  }
}

import { prisma } from '../config/db.js';
import { 
  hashPassword, 
  comparePassword, 
  generateTokens, 
  setAuthCookies, 
  clearAuthCookies,
  verifyRefreshToken
} from '../services/auth.service.js';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ status: 'error', message: 'Email already in use' });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const { accessToken, refreshToken } = generateTokens(user.id);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
        }
      }
    });
  } catch (error) {
    console.error('[Auth Register Error]', error);
    res.status(500).json({ status: 'error', message: 'Internal server error during registration' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
        }
      }
    });
  } catch (error) {
    console.error('[Auth Login Error]', error);
    res.status(500).json({ status: 'error', message: 'Internal server error during login' });
  }
}

export async function logout(req, res) {
  clearAuthCookies(res);
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
}

export async function refresh(req, res) {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ status: 'error', message: 'No refresh token provided' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ status: 'error', message: 'Invalid token: user not found' });
    }

    const tokens = generateTokens(user.id);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return res.status(200).json({ status: 'success', message: 'Token refreshed' });
  } catch (error) {
    clearAuthCookies(res);
    return res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token' });
  }
}

export async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    console.error('[Auth GetMe Error]', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch user profile' });
  }
}

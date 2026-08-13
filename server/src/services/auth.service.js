import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ userId }, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET);
}

export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: ENV.isProd,
  sameSite: ENV.isProd ? 'none' : 'lax',
};

export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('access_token', accessToken, {
    ...COOKIE_CONFIG,
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie('refresh_token', refreshToken, {
    ...COOKIE_CONFIG,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearAuthCookies(res) {
  res.clearCookie('access_token', COOKIE_CONFIG);
  res.clearCookie('refresh_token', COOKIE_CONFIG);
}

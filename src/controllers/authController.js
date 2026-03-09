import jwt from "jsonwebtoken";
import crypto from "crypto";
import User, { comparePassword } from "../models/userModel.js";
import RefreshToken from "../models/refreshTokenModel.js";
import { authConfig } from "../config/auth.js";
import logger from "../config/logger.js";

function createAccessToken(userId) {
  return jwt.sign(
    { sub: userId },
    authConfig.secret,
    { expiresIn: authConfig.expiresIn }
  );
}

function createRefreshTokenPayload(userId) {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { sub: userId, type: "refresh", jti },
    authConfig.secret,
    { expiresIn: authConfig.refreshExpiresIn }
  );
  return { token, jti };
}

/**
 * POST /auth/login
 * Body: { "username": "...", "password": "..." }
 * Retorna { "token", "refreshToken", "expiresIn" }.
 */
export async function login(req, res) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      message: "Campos obrigatórios: username e password.",
    });
  }

  try {
    const user = await User.findOne({ username: username.trim().toLowerCase() })
      .select("+passwordHash")
      .lean();
    if (!user) {
      logger.warn(`Tentativa de login falha para usuário: ${username}`);
      return res.status(401).json({ message: "Usuário ou senha inválidos." });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      logger.warn(`Tentativa de login falha para usuário: ${username}`);
      return res.status(401).json({ message: "Usuário ou senha inválidos." });
    }

    const userId = user._id.toString();
    const accessToken = createAccessToken(userId);
    const { token: refreshToken, jti } = createRefreshTokenPayload(userId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      userId: user._id,
      jti,
      expiresAt,
    });

    return res.json({
      token: accessToken,
      refreshToken,
      expiresIn: authConfig.expiresIn,
    });
  } catch (err) {
    logger.error("Erro no login:", err.message);
    return res.status(500).json({ message: "Erro ao realizar login." });
  }
}

/**
 * POST /auth/refresh
 * Body: { "refreshToken": "..." }
 * Retorna novo { "token", "refreshToken", "expiresIn" } (refresh token rotacionado).
 */
export async function refresh(req, res) {
  const { refreshToken: raw } = req.body || {};

  if (!raw) {
    return res.status(400).json({
      message: "Campo obrigatório: refreshToken.",
    });
  }

  try {
    const decoded = jwt.verify(raw, authConfig.secret);
    if (decoded.type !== "refresh" || !decoded.jti) {
      return res.status(401).json({ message: "Refresh token inválido." });
    }

    const record = await RefreshToken.findOne({ jti: decoded.jti }).lean();
    if (!record) {
      return res.status(401).json({
        message: "Refresh token expirado ou já utilizado. Faça login novamente.",
      });
    }

    const userId = record.userId.toString();
    if (decoded.sub !== userId) {
      return res.status(401).json({ message: "Refresh token inválido." });
    }

    await RefreshToken.deleteOne({ jti: decoded.jti });

    const accessToken = createAccessToken(userId);
    const { token: newRefreshToken, jti } = createRefreshTokenPayload(userId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      userId: record.userId,
      jti,
      expiresAt,
    });

    return res.json({
      token: accessToken,
      refreshToken: newRefreshToken,
      expiresIn: authConfig.expiresIn,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Refresh token expirado. Faça login novamente.",
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Refresh token inválido." });
    }
    logger.error("Erro no refresh:", err.message);
    return res.status(500).json({ message: "Erro ao renovar token." });
  }
}

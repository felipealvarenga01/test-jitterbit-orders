import jwt from "jsonwebtoken";
import { authConfig } from "../config/auth.js";
import logger from "../config/logger.js";

/**
 * Middleware que valida o JWT no header Authorization: Bearer <token>
 * e anexa o payload em req.user. Retorna 401 se token ausente ou inválido.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token de autenticação ausente. Use: Authorization: Bearer <token>",
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, authConfig.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado. Faça login novamente." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token inválido." });
    }
    logger.error("Erro ao verificar JWT:", err.message);
    return res.status(401).json({ message: "Falha na autenticação." });
  }
}

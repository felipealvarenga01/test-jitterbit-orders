/**
 * Configuração de autenticação JWT.
 * JWT_SECRET deve ser forte e único em produção (ex: openssl rand -base64 32).
 */
export const authConfig = {
  secret: process.env.JWT_SECRET || "change-me-in-production",
  /** Access token: curta duração */
  expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  /** Refresh token: longa duração */
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
};

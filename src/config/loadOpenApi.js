import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Diretório base permitido (src/) */
const ALLOWED_BASE = path.resolve(__dirname, "..");

/**
 * Carrega o documento OpenAPI de forma segura.
 * Evita path traversal e garante que o arquivo está dentro do diretório da aplicação.
 * @param {string} filename - Nome do arquivo (ex: "openapi.json")
 * @returns {object} Documento OpenAPI parseado
 * @throws {Error} Se o caminho for inválido ou o arquivo não existir
 */
export function loadOpenApiSecure(filename = "openapi.json") {
  if (typeof filename !== "string" || filename.includes("..")) {
    throw new Error("Nome de arquivo inválido para OpenAPI");
  }

  const requestedPath = path.join(ALLOWED_BASE, filename);
  const resolvedPath = path.resolve(requestedPath);

  if (!resolvedPath.startsWith(ALLOWED_BASE)) {
    throw new Error("Caminho do OpenAPI fora do diretório permitido");
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Arquivo OpenAPI não encontrado: ${filename}`);
  }

  const content = fs.readFileSync(resolvedPath, "utf-8");
  const parsed = JSON.parse(content);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Documento OpenAPI inválido");
  }

  return parsed;
}

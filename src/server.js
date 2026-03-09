import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import logger from "./config/logger.js";
import { loadOpenApiSecure } from "./config/loadOpenApi.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/desafio_orders";

// Carregamento seguro do OpenAPI (evita path traversal e valida origem)
let openApiDocument;
try {
  openApiDocument = loadOpenApiSecure("openapi.json");
} catch (err) {
  logger.error("Falha ao carregar OpenAPI:", err.message);
  process.exit(1);
}

// Segurança: headers HTTP (X-Content-Type-Options, X-Frame-Options, etc.)
app.use(helmet({ contentSecurityPolicy: false }));

// Rate limiting: reduz risco de abuso e DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Muitas requisições. Tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parser com limite de tamanho (evita payloads gigantes)
app.use(express.json({ limit: "100kb" }));

app.use("/auth", authRoutes);
app.use("/order", orderRoutes);

// Swagger UI em /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get("/", (req, res) => {
  res.json({ message: "Orders API - desafio" });
});

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    logger.info("Conectado ao MongoDB");
    app.listen(port, () => {
      logger.info(`Servidor rodando em http://localhost:${port}`);
    });
  })
  .catch((error) => {
    logger.error("Erro ao conectar no MongoDB:", error.message);
    process.exit(1);
  });


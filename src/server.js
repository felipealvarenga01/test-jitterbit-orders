import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import orderRoutes from "./routes/orderRoutes.js";
import logger from "./config/logger.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/desafio_orders";

// Resolver caminho para o arquivo openapi.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openApiPath = path.join(__dirname, "openapi.json");
const openApiDocument = JSON.parse(fs.readFileSync(openApiPath, "utf-8"));

app.use(express.json());
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


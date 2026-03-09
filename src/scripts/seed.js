import mongoose from "mongoose";
import dotenv from "dotenv";
import User, { hashPassword } from "../models/userModel.js";
import logger from "../config/logger.js";

dotenv.config();

const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/desafio_orders";
const adminUsername = process.env.AUTH_USER || "admin";
const adminPassword = process.env.AUTH_PASSWORD || "admin";

async function runSeed() {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    logger.info("Conectado ao MongoDB para seed");

    const existing = await User.findOne({ username: adminUsername });
    if (existing) {
      logger.info(`Usuário "${adminUsername}" já existe. Nenhuma alteração.`);
      await mongoose.disconnect();
      process.exit(0);
      return;
    }

    const passwordHash = await hashPassword(adminPassword);
    await User.create({
      username: adminUsername,
      passwordHash,
      role: "admin",
    });
    logger.info(`Usuário admin "${adminUsername}" criado com sucesso.`);
  } catch (err) {
    logger.error("Erro no seed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runSeed();

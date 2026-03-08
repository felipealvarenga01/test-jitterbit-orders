import { Router } from "express";
import {
  createOrder,
  getOrderById,
  listOrders,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";

const router = Router();

// Criar novo pedido (obrigatório)
router.post("/", createOrder);

// Obter pedido pelo número (obrigatório)
router.get("/:id", getOrderById);

// Listar todos os pedidos (opcional)
router.get("/list", listOrders);

// Atualizar pedido pelo número (opcional)
router.put("/:id", updateOrder);

// Deletar pedido pelo número (opcional)
router.delete("/:id", deleteOrder);

export default router;


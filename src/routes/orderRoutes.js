import { Router } from "express";
import {
  createOrder,
  getOrderById,
  listOrders,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

// Criar novo pedido (obrigatório)
router.post("/", createOrder);

// Listar todos os pedidos (opcional) — antes de /:id para não ser interpretado como id
router.get("/list", listOrders);

// Obter pedido pelo número (obrigatório)
router.get("/:id", getOrderById);

// Atualizar pedido pelo número (opcional)
router.put("/:id", updateOrder);

// Deletar pedido pelo número (opcional)
router.delete("/:id", deleteOrder);

export default router;

